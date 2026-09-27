import assert from "node:assert/strict";
import { once } from "node:events";
import type { Server } from "node:http";
import { after, before, beforeEach, test } from "node:test";
import jwt from "jsonwebtoken";
import mongoose, { Types } from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";

import app from "../app.js";
import { Cart } from "../models/Cart.model.js";
import { Category } from "../models/Category.model.js";
import { Order } from "../models/Order.model.js";
import { Product } from "../models/Product.model.js";
import { User } from "../models/User.model.js";
import { getInventoryAlerts, restockProduct } from "./product.service.js";
import { createOrder } from "./order.service.js";
import { getSentEmails, clearSentEmails } from "./email.service.js";
import { ApiError } from "../utils/ApiError.js";

let database: MongoMemoryReplSet | undefined;
let server: Server | undefined;
let baseUrl: string;
const jwtSecret = "inventory-alerts-test-secret";
let testCategoryId: Types.ObjectId;

before(async () => {
    process.env.JWT_SECRET = jwtSecret;
    database = await MongoMemoryReplSet.create({
        binary: { version: "8.2.6" },
        replSet: { count: 1, storageEngine: "wiredTiger", ip: "127.0.0.1" },
    });
    await mongoose.connect(database.getUri(), { dbName: "inventory_alerts_tests" });
    await Promise.all([
        Cart.init(),
        Category.init(),
        Order.init(),
        Product.init(),
        User.init(),
    ]);

    server = app.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    baseUrl = `http://127.0.0.1:${address.port}`;
}, { timeout: 180_000 });

after(async () => {
    try {
        if (server) {
            await new Promise<void>((resolve, reject) =>
                server!.close((err) => (err ? reject(err) : resolve()))
            );
        }
    } finally {
        try {
            await mongoose.disconnect();
        } finally {
            await database?.stop();
        }
    }
});

beforeEach(async () => {
    await Cart.deleteMany({});
    await Category.deleteMany({});
    await Order.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});
    clearSentEmails();

    const category = await Category.create({
        name: "Componentes",
        slug: "componentes",
        description: "Componentes de hardware",
        isActive: true,
    });
    testCategoryId = category._id as Types.ObjectId;
});

const generateToken = (id: string, role: "customer" | "admin" = "customer") =>
    jwt.sign({ userId: id, role }, jwtSecret, { expiresIn: "1h" });

const createFixtureProduct = async (overrides: Partial<Record<string, unknown>> = {}) =>
    Product.create({
        name: "Teclado Mecánico RGB",
        slug: `teclado-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        description: "Teclado mecánico para gaming",
        category: testCategoryId,
        stock: 10,
        price: 99.99,
        lowStockThreshold: 5,
        isActive: true,
        images: ["https://example.com/keyboard.png"],
        ...overrides,
    });

test("getInventoryAlerts: calculates summary metrics and default alerts correctly", async () => {
    // 1 out of stock
    await createFixtureProduct({ name: "Monitor Agotado", stock: 0, lowStockThreshold: 5 });
    // 2 low stock (stock <= threshold)
    await createFixtureProduct({ name: "Mouse Bajo Stock", stock: 3, lowStockThreshold: 5 });
    await createFixtureProduct({ name: "GPU Bajo Stock Custom", stock: 8, lowStockThreshold: 10 });
    // 1 healthy stock
    await createFixtureProduct({ name: "RAM Saludable", stock: 25, lowStockThreshold: 5 });
    // 1 inactive product with 0 stock (should be ignored)
    await createFixtureProduct({ name: "Inactivo", stock: 0, isActive: false });

    const result = await getInventoryAlerts();

    assert.equal(result.summary.totalActive, 4);
    assert.equal(result.summary.outOfStockCount, 1);
    assert.equal(result.summary.lowStockCount, 2);
    assert.equal(result.summary.healthyStockCount, 1);

    // Default "all" filter returns out of stock + low stock
    assert.equal(result.alerts.length, 3);
    const names = result.alerts.map((p) => p.name);
    assert.ok(names.includes("Monitor Agotado"));
    assert.ok(names.includes("Mouse Bajo Stock"));
    assert.ok(names.includes("GPU Bajo Stock Custom"));
    assert.ok(!names.includes("RAM Saludable"));
    assert.ok(!names.includes("Inactivo"));
});

test("getInventoryAlerts: filters alerts by out_of_stock and low_stock", async () => {
    await createFixtureProduct({ name: "Agotado 1", stock: 0 });
    await createFixtureProduct({ name: "Agotado 2", stock: 0 });
    await createFixtureProduct({ name: "Bajo Stock 1", stock: 2, lowStockThreshold: 5 });
    await createFixtureProduct({ name: "Saludable 1", stock: 15, lowStockThreshold: 5 });

    const outOfStockResult = await getInventoryAlerts("out_of_stock");
    assert.equal(outOfStockResult.summary.outOfStockCount, 2);
    assert.equal(outOfStockResult.alerts.length, 2);
    assert.ok(outOfStockResult.alerts.every((p) => p.stock === 0));

    const lowStockResult = await getInventoryAlerts("low_stock");
    assert.equal(lowStockResult.summary.lowStockCount, 1);
    assert.equal(lowStockResult.alerts.length, 1);
    assert.equal(lowStockResult.alerts[0]!.name, "Bajo Stock 1");
});

test("restockProduct: updates stock and optional lowStockThreshold", async () => {
    const product = await createFixtureProduct({ stock: 2, lowStockThreshold: 5 });

    const updated = await restockProduct(product._id.toString(), 15, 8);

    assert.equal(updated.stock, 17);
    assert.equal(updated.lowStockThreshold, 8);

    const fromDb = await Product.findById(product._id);
    assert.equal(fromDb?.stock, 17);
    assert.equal(fromDb?.lowStockThreshold, 8);
});

test("restockProduct: validates inputs and rejects invalid values", async () => {
    const product = await createFixtureProduct({ stock: 5 });
    const productId = product._id.toString();

    // Rejects non-positive additionalStock
    await assert.rejects(
        () => restockProduct(productId, 0),
        (err: unknown) => err instanceof ApiError && err.statusCode === 400
    );
    await assert.rejects(
        () => restockProduct(productId, -5),
        (err: unknown) => err instanceof ApiError && err.statusCode === 400
    );
    await assert.rejects(
        () => restockProduct(productId, 2.5),
        (err: unknown) => err instanceof ApiError && err.statusCode === 400
    );

    // Rejects negative lowStockThreshold
    await assert.rejects(
        () => restockProduct(productId, 10, -1),
        (err: unknown) => err instanceof ApiError && err.statusCode === 400
    );

    // Rejects non-existent product
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    await assert.rejects(
        () => restockProduct(nonExistentId, 10),
        (err: unknown) => err instanceof ApiError && err.statusCode === 404
    );

    // Rejects invalid ObjectId format
    await assert.rejects(
        () => restockProduct("invalid-id", 10),
        (err: unknown) => err instanceof ApiError && err.statusCode === 400
    );
});

test("checkout triggers low stock alert email when inventory drops below threshold", async () => {
    clearSentEmails();

    const admin = await User.create({
        name: "Admin User",
        email: "admin@kaltech.com",
        password: "Password123!",
        role: "admin",
        isActive: true,
    });

    const customer = await User.create({
        name: "Cliente Comprador",
        email: "cliente@kaltech.com",
        password: "Password123!",
        role: "customer",
    });

    // Product with stock 6, threshold 5. Purchasing 2 items will reduce stock to 4 (<= 5).
    const product = await createFixtureProduct({
        name: "Procesador Ryzen 9",
        stock: 6,
        lowStockThreshold: 5,
        price: 300,
    });

    await Cart.create({
        user: customer._id,
        items: [{ product: product._id, quantity: 2, price: 300 }],
    });

    const orderInput = {
        shippingAddress: {
            fullName: "Cliente Comprador",
            address: "Av. Principal 456",
            city: "Madrid",
            postalCode: "28001",
            country: "España",
            phone: "+34600123456",
        },
        paymentMethod: "card",
    };

    await createOrder(customer._id.toString(), orderInput);

    // Wait microtask tick for non-blocking email trigger
    await new Promise((resolve) => setTimeout(resolve, 80));

    const sent = getSentEmails();
    // One email sent to customer (order created) and one to admin (low stock alert)
    const alertEmail = sent.find((e) => e.to === admin.email);
    assert.ok(alertEmail, "Admin should receive low stock alert email");
    assert.ok(alertEmail.subject.includes("Procesador Ryzen 9"));
    assert.ok(alertEmail.html.includes("Procesador Ryzen 9"));
    assert.ok(alertEmail.html.includes("4 unidades"));
});

test("HTTP GET /api/products/admin/inventory-alerts: access control and response", async () => {
    const admin = await User.create({
        name: "Admin User",
        email: "admin2@kaltech.com",
        password: "Password123!",
        role: "admin",
    });
    const customer = await User.create({
        name: "Customer User",
        email: "customer2@kaltech.com",
        password: "Password123!",
        role: "customer",
    });

    await createFixtureProduct({ name: "Producto Alerta", stock: 2, lowStockThreshold: 5 });

    const adminToken = generateToken(admin._id.toString(), "admin");
    const customerToken = generateToken(customer._id.toString(), "customer");

    // 401 without token
    const resNoToken = await fetch(`${baseUrl}/api/products/admin/inventory-alerts`);
    assert.equal(resNoToken.status, 401);

    // 403 with customer token
    const resCustomer = await fetch(`${baseUrl}/api/products/admin/inventory-alerts`, {
        headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert.equal(resCustomer.status, 403);

    // 200 with admin token
    const resAdmin = await fetch(`${baseUrl}/api/products/admin/inventory-alerts?filter=low_stock`, {
        headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(resAdmin.status, 200);
    const body = (await resAdmin.json()) as {
        success: boolean;
        data: {
            summary: { totalActive: number; lowStockCount: number };
            alerts: Array<{ name: string }>;
        };
    };
    assert.equal(body.success, true);
    assert.equal(body.data.summary.lowStockCount, 1);
    assert.equal(body.data.alerts.length, 1);
    assert.equal(body.data.alerts[0]!.name, "Producto Alerta");
});

test("HTTP PATCH /api/products/admin/:id/restock: restocks stock and threshold via endpoint", async () => {
    const admin = await User.create({
        name: "Admin User 3",
        email: "admin3@kaltech.com",
        password: "Password123!",
        role: "admin",
    });
    const product = await createFixtureProduct({ stock: 1, lowStockThreshold: 5 });
    const adminToken = generateToken(admin._id.toString(), "admin");

    const res = await fetch(`${baseUrl}/api/products/admin/${product._id}/restock`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
            additionalStock: 20,
            lowStockThreshold: 10,
        }),
    });

    assert.equal(res.status, 200);
    const body = (await res.json()) as {
        success: boolean;
        data: { product: { stock: number; lowStockThreshold: number } };
    };
    assert.equal(body.success, true);
    assert.equal(body.data.product.stock, 21);
    assert.equal(body.data.product.lowStockThreshold, 10);
});
