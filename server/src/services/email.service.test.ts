import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";
import mongoose, { Types } from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";

import { Order } from "../models/Order.model.js";
import { Product } from "../models/Product.model.js";
import { User } from "../models/User.model.js";
import { registerUser } from "./auth.service.js";
import {
    clearSentEmails,
    getSentEmails,
    sendEmail,
    sendOrderCreatedEmail,
    sendOrderStatusUpdatedEmail,
    sendPaymentConfirmedEmail,
    sendWelcomeEmail,
} from "./email.service.js";
import {
    orderCreatedEmailTemplate,
    orderStatusUpdatedEmailTemplate,
    paymentConfirmedEmailTemplate,
    welcomeEmailTemplate,
} from "../templates/email.templates.js";
import { payOrder } from "./payment.service.js";
import { updateOrderStatus } from "./order.service.js";

let database: MongoMemoryReplSet | undefined;
let testUserId: Types.ObjectId;
let testOrderId: Types.ObjectId;
const jwtSecret = "email-test-secret-key-1234567890";
const originalSecret = process.env.JWT_SECRET;
const originalNodeEnv = process.env.NODE_ENV;

before(async () => {
    process.env.JWT_SECRET = jwtSecret;
    process.env.NODE_ENV = "test";

    database = await MongoMemoryReplSet.create({
        binary: { version: "8.2.6" },
        replSet: { count: 1, storageEngine: "wiredTiger", ip: "127.0.0.1" },
    });
    await mongoose.connect(database.getUri(), { dbName: "email_service_tests" });
    await Promise.all([Order.init(), Product.init(), User.init()]);
}, { timeout: 180_000 });

after(async () => {
    if (originalSecret === undefined) {
        delete process.env.JWT_SECRET;
    } else {
        process.env.JWT_SECRET = originalSecret;
    }
    process.env.NODE_ENV = originalNodeEnv;

    try {
        await mongoose.disconnect();
    } finally {
        await database?.stop();
    }
});

beforeEach(async () => {
    clearSentEmails();
    await Order.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});

    const user = await User.create({
        name: "Carlos Mendoza",
        email: "carlos@example.com",
        password: "Password123!",
        role: "customer",
    });
    testUserId = user._id as Types.ObjectId;

    const product = await Product.create({
        name: "Smart Watch Ultra",
        slug: "smart-watch-ultra",
        description: "Watch with advanced sensors",
        category: new Types.ObjectId(),
        price: 299.99,
        stock: 15,
        images: ["https://example.com/watch.png"],
    });

    const order = await Order.create({
        user: testUserId,
        items: [
            {
                product: product._id,
                name: product.name,
                quantity: 1,
                price: 299.99,
                image: product.images[0],
            },
        ],
        shippingAddress: {
            fullName: "Carlos Mendoza",
            address: "Av. Diagonal 450",
            city: "Barcelona",
            postalCode: "08006",
            country: "Spain",
            phone: "+34611223344",
        },
        paymentMethod: "card",
        paymentStatus: "pending",
        orderStatus: "pending",
        subtotal: 299.99,
        tax: 54.0,
        shippingCost: 25.0,
        total: 378.99,
    });
    testOrderId = order._id as Types.ObjectId;
});

test("welcomeEmailTemplate generates valid responsive HTML and text", () => {
    const template = welcomeEmailTemplate({ name: "Carlos Mendoza" });

    assert.ok(template.subject.includes("Carlos Mendoza"));
    assert.ok(template.html.includes("KAL"));
    assert.ok(template.html.includes("TECH"));
    assert.ok(template.html.includes("Carlos Mendoza"));
    assert.ok(template.html.includes("Explorar Productos"));
    assert.ok(template.text.includes("Carlos Mendoza"));
});

test("orderCreatedEmailTemplate includes order breakdown and shipping details", async () => {
    const order = await Order.findById(testOrderId).orFail();
    const template = orderCreatedEmailTemplate({
        order,
        customerName: "Carlos Mendoza",
        customerEmail: "carlos@example.com",
    });

    assert.ok(template.subject.includes(order._id.toString()));
    assert.ok(template.html.includes("Smart Watch Ultra"));
    assert.ok(template.html.includes("$378.99"));
    assert.ok(template.html.includes("Av. Diagonal 450"));
    assert.ok(template.html.includes("Barcelona"));
    assert.ok(template.text.includes("$378.99"));
});

test("paymentConfirmedEmailTemplate includes receipt and completion details", async () => {
    const order = await Order.findById(testOrderId).orFail();
    order.paymentStatus = "paid";
    order.paidAt = new Date();
    order.paymentResult = {
        id: "PAY-CARD-TEST-1234",
        status: "COMPLETED",
        method: "card_visa_4242",
    };

    const template = paymentConfirmedEmailTemplate({
        order,
        customerName: "Carlos Mendoza",
        customerEmail: "carlos@example.com",
    });

    assert.ok(template.subject.includes(order._id.toString()));
    assert.ok(template.html.includes("PAY-CARD-TEST-1234"));
    assert.ok(template.html.includes("Pago Confirmado"));
    assert.ok(template.html.includes("$378.99"));
    assert.ok(template.text.includes("PAY-CARD-TEST-1234"));
});

test("orderStatusUpdatedEmailTemplate renders different status messages", async () => {
    const order = await Order.findById(testOrderId).orFail();

    const shippedTemplate = orderStatusUpdatedEmailTemplate({
        order,
        customerName: "Carlos Mendoza",
        newStatus: "shipped",
    });
    assert.ok(shippedTemplate.subject.includes("Enviado"));
    assert.ok(shippedTemplate.html.includes("va en camino"));

    const deliveredTemplate = orderStatusUpdatedEmailTemplate({
        order,
        customerName: "Carlos Mendoza",
        newStatus: "delivered",
    });
    assert.ok(deliveredTemplate.subject.includes("Entregado"));
    assert.ok(deliveredTemplate.html.includes("ha sido entregado"));

    const cancelledTemplate = orderStatusUpdatedEmailTemplate({
        order,
        customerName: "Carlos Mendoza",
        newStatus: "cancelled",
    });
    assert.ok(cancelledTemplate.subject.includes("Cancelado"));
    assert.ok(cancelledTemplate.html.includes("ha sido cancelado"));
});

test("sendWelcomeEmail and direct sendEmail store records in sandbox buffer", async () => {
    clearSentEmails();
    assert.equal(getSentEmails().length, 0);

    await sendWelcomeEmail("test@kaltech.com", "Laura Gómez");

    const sent = getSentEmails();
    assert.equal(sent.length, 1);
    assert.equal(sent[0]!.to, "test@kaltech.com");
    assert.ok(sent[0]!.subject.includes("Laura Gómez"));
    assert.ok(sent[0]!.html.includes("KAL"));

    await sendEmail({
        to: "alert@kaltech.com",
        subject: "Direct Email Test",
        html: "<p>Direct content</p>",
        text: "Direct content",
    });

    assert.equal(getSentEmails().length, 2);
    assert.equal(getSentEmails()[1]!.to, "alert@kaltech.com");

    clearSentEmails();
    assert.equal(getSentEmails().length, 0);
});

test("registerUser triggers welcome email automatically", async () => {
    clearSentEmails();

    const result = await registerUser({
        name: "Ana Morales",
        email: "ana.morales@kaltech.com",
        password: "Password123!",
    });

    assert.ok(result.token);
    assert.equal(result.user.name, "Ana Morales");

    // Wait microtask tick for non-blocking email trigger
    await new Promise((resolve) => setTimeout(resolve, 50));

    const sent = getSentEmails();
    assert.equal(sent.length, 1);
    assert.equal(sent[0]!.to, "ana.morales@kaltech.com");
    assert.ok(sent[0]!.subject.includes("Ana Morales"));
});

test("payOrder triggers payment confirmation email", async () => {
    clearSentEmails();

    const nextYear = new Date().getFullYear() + 2;
    await payOrder(testUserId.toString(), testOrderId.toString(), {
        method: "card",
        card: {
            cardHolder: "Carlos Mendoza",
            cardNumber: "4242424242424242",
            expiryMonth: "12",
            expiryYear: nextYear.toString(),
            cvv: "123",
        },
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    const sent = getSentEmails();
    assert.equal(sent.length, 1);
    assert.equal(sent[0]!.to, "carlos@example.com");
    assert.ok(sent[0]!.subject.includes("Pago Confirmado"));
    assert.ok(sent[0]!.html.includes("PAY-CARD-"));
});

test("updateOrderStatus triggers order status update email", async () => {
    clearSentEmails();

    await updateOrderStatus(testOrderId.toString(), "processing");

    await new Promise((resolve) => setTimeout(resolve, 50));

    const sent = getSentEmails();
    assert.equal(sent.length, 1);
    assert.equal(sent[0]!.to, "carlos@example.com");
    assert.ok(sent[0]!.subject.includes("En Preparación"));
});
