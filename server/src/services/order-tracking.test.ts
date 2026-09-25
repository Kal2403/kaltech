import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";

import { Cart } from "../models/Cart.model.js";
import { Order } from "../models/Order.model.js";
import { Product } from "../models/Product.model.js";
import { User } from "../models/User.model.js";
import { createOrder, updateOrderStatus } from "./order.service.js";
import { payOrder } from "./payment.service.js";

let database: MongoMemoryReplSet | undefined;

before(async () => {
    database = await MongoMemoryReplSet.create({
        binary: { version: "8.2.6" },
        replSet: { count: 1, storageEngine: "wiredTiger", ip: "127.0.0.1" },
    });
    await mongoose.connect(database.getUri(), { dbName: "order_tracking_tests" });
    await Promise.all([Cart.init(), Order.init(), Product.init(), User.init()]);
}, { timeout: 180_000 });

after(async () => {
    try {
        await mongoose.disconnect();
    } finally {
        await database?.stop();
    }
});

const defaultShippingAddress = {
    fullName: "Juan Perez",
    address: "Calle Mayor 123",
    city: "Madrid",
    postalCode: "28001",
    country: "Spain",
    phone: "600123456",
};

const createFixtureProduct = async (stock = 10, price = 50) =>
    Product.create({
        name: "Smartphone Pro",
        slug: new mongoose.Types.ObjectId().toString(),
        description: "Test tracking product fixture",
        category: new mongoose.Types.ObjectId(),
        stock,
        price,
        images: ["https://example.com/phone.png"],
    });

const createFixtureUser = async () =>
    User.create({
        name: "Juan Perez",
        email: `buyer_${Date.now()}_${Math.random().toString(36).substring(7)}@kaltech.com`,
        password: "Password123!",
        role: "customer",
    });

test("createOrder initializes order with timeline containing 'Pedido recibido' event", async () => {
    const user = await createFixtureUser();
    const product = await createFixtureProduct(5, 100);
    await Cart.create({
        user: user._id,
        items: [{ product: product._id, quantity: 1 }],
    });

    const order = await createOrder(user._id.toString(), {
        shippingAddress: defaultShippingAddress,
        paymentMethod: "card",
    });

    assert.ok(Array.isArray(order.timeline), "timeline should be an array");
    assert.equal(order.timeline.length, 1);
    assert.equal(order.timeline[0]?.status, "pending");
    assert.equal(order.timeline[0]?.title, "Pedido recibido");
    assert.ok(order.timeline[0]?.description?.includes("exitosamente"));
    assert.ok(order.timeline[0]?.timestamp instanceof Date);
});

test("payOrder appends 'Pago verificado' event to timeline and transitions to processing", async () => {
    const user = await createFixtureUser();
    const product = await createFixtureProduct(5, 100);
    await Cart.create({
        user: user._id,
        items: [{ product: product._id, quantity: 1 }],
    });

    const order = await createOrder(user._id.toString(), {
        shippingAddress: defaultShippingAddress,
        paymentMethod: "cash",
    });

    const paidOrder = await payOrder(user._id.toString(), order._id.toString(), {
        method: "cash",
    });

    assert.equal(paidOrder.paymentStatus, "paid");
    assert.equal(paidOrder.orderStatus, "processing");
    assert.equal(paidOrder.timeline.length, 2);
    assert.equal(paidOrder.timeline[1]?.status, "processing");
    assert.equal(paidOrder.timeline[1]?.title, "Pago verificado");
    assert.ok(paidOrder.timeline[1]?.description?.includes("CASH"));
});

test("updateOrderStatus records status transitions, carrier info, and tracking details", async () => {
    const user = await createFixtureUser();
    const product = await createFixtureProduct(5, 100);
    await Cart.create({
        user: user._id,
        items: [{ product: product._id, quantity: 1 }],
    });

    const order = await createOrder(user._id.toString(), {
        shippingAddress: defaultShippingAddress,
        paymentMethod: "cash",
    });

    // Transition: pending -> processing
    const processingOrder = await updateOrderStatus(order._id.toString(), "processing", {
        note: "Empacado en caja reforzada",
    });
    assert.equal(processingOrder.orderStatus, "processing");
    assert.equal(processingOrder.timeline.length, 2);
    assert.equal(processingOrder.timeline[1]?.status, "processing");
    assert.equal(processingOrder.timeline[1]?.title, "En preparación");
    assert.equal(processingOrder.timeline[1]?.description, "Empacado en caja reforzada");

    // Transition: processing -> shipped with carrier & tracking
    const estDelivery = new Date(Date.now() + 86400000 * 3);
    const shippedOrder = await updateOrderStatus(order._id.toString(), "shipped", {
        carrier: "DHL Express",
        trackingNumber: "DHL-123456789",
        estimatedDelivery: estDelivery.toISOString(),
    });

    assert.equal(shippedOrder.orderStatus, "shipped");
    assert.equal(shippedOrder.carrier, "DHL Express");
    assert.equal(shippedOrder.trackingNumber, "DHL-123456789");
    assert.ok(shippedOrder.estimatedDelivery instanceof Date);
    assert.equal(shippedOrder.timeline.length, 3);
    assert.equal(shippedOrder.timeline[2]?.status, "shipped");
    assert.equal(shippedOrder.timeline[2]?.title, "En camino");
    assert.ok(shippedOrder.timeline[2]?.description?.includes("DHL Express"));
    assert.ok(shippedOrder.timeline[2]?.description?.includes("DHL-123456789"));
    assert.equal(shippedOrder.timeline[2]?.location, "DHL Express");

    // Transition: shipped -> delivered
    const deliveredOrder = await updateOrderStatus(order._id.toString(), "delivered");
    assert.equal(deliveredOrder.orderStatus, "delivered");
    assert.equal(deliveredOrder.timeline.length, 4);
    assert.equal(deliveredOrder.timeline[3]?.status, "delivered");
    assert.equal(deliveredOrder.timeline[3]?.title, "Entregado");

    // Verify idempotency: repeated status transition does not append duplicate event
    const idempotentOrder = await updateOrderStatus(order._id.toString(), "delivered");
    assert.equal(idempotentOrder.timeline.length, 4);
});

test("updateOrderStatus to cancelled records cancellation event in timeline", async () => {
    const user = await createFixtureUser();
    const product = await createFixtureProduct(10, 100);
    await Cart.create({
        user: user._id,
        items: [{ product: product._id, quantity: 2 }],
    });

    const order = await createOrder(user._id.toString(), {
        shippingAddress: defaultShippingAddress,
        paymentMethod: "cash",
    });

    const cancelledOrder = await updateOrderStatus(order._id.toString(), "cancelled", {
        note: "Cancelado a solicitud del cliente",
    });

    assert.equal(cancelledOrder.orderStatus, "cancelled");
    assert.equal(cancelledOrder.timeline.length, 2);
    assert.equal(cancelledOrder.timeline[1]?.status, "cancelled");
    assert.equal(cancelledOrder.timeline[1]?.title, "Cancelado");
    assert.equal(cancelledOrder.timeline[1]?.description, "Cancelado a solicitud del cliente");

    // Stock should be restored
    const updatedProduct = await Product.findById(product._id).orFail();
    assert.equal(updatedProduct.stock, 10);
});
