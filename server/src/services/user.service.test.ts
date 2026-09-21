import assert from "node:assert/strict";
import { once } from "node:events";
import type { Server } from "node:http";
import { after, before, beforeEach, test } from "node:test";
import mongoose, { Types } from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import app from "../app.js";
import { User } from "../models/User.model.js";
import {
    addAddress,
    changeUserPassword,
    deleteAddress,
    getUserAddresses,
    getUserProfile,
    setDefaultAddress,
    updateAddress,
    updateUserProfile,
} from "./user.service.js";

let database: MongoMemoryReplSet | undefined;
let server: Server | undefined;
let baseUrl: string;
let testUserId: Types.ObjectId;
const jwtSecret = "user-test-secret-key-1234567890";
const originalSecret = process.env.JWT_SECRET;

before(async () => {
    process.env.JWT_SECRET = jwtSecret;

    database = await MongoMemoryReplSet.create({
        binary: { version: "8.2.6" },
        replSet: { count: 1, storageEngine: "wiredTiger", ip: "127.0.0.1" },
    });
    await mongoose.connect(database.getUri(), { dbName: "user_tests" });
    await User.init();

    server = app.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    baseUrl = `http://127.0.0.1:${address.port}`;
}, { timeout: 180_000 });

after(async () => {
    if (originalSecret === undefined) {
        delete process.env.JWT_SECRET;
    } else {
        process.env.JWT_SECRET = originalSecret;
    }

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
    await User.deleteMany({});

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("Password123!", salt);

    const user = await User.create({
        name: "Carlos Doe",
        email: "carlos@kaltech.com",
        password: hashedPassword,
        role: "customer",
        phone: "+34 611 222 333",
        addresses: [],
    });
    testUserId = user._id as Types.ObjectId;
});

const generateToken = (userId: string) =>
    jwt.sign({ userId, role: "customer" }, jwtSecret, { expiresIn: "1h" });

test("getUserProfile returns user data without password", async () => {
    const profile = await getUserProfile(testUserId.toString());
    assert.ok(profile);
    assert.equal(profile.name, "Carlos Doe");
    assert.equal(profile.email, "carlos@kaltech.com");
    assert.equal(profile.phone, "+34 611 222 333");
    assert.equal((profile as any).password, undefined);
});

test("updateUserProfile updates name and phone", async () => {
    const updated = await updateUserProfile(testUserId.toString(), {
        name: "Carlos Updated",
        phone: "+34 699 888 777",
    });

    assert.equal(updated.name, "Carlos Updated");
    assert.equal(updated.phone, "+34 699 888 777");
});

test("updateUserProfile rejects invalid name length", async () => {
    await assert.rejects(
        async () => {
            await updateUserProfile(testUserId.toString(), { name: "A" });
        },
        {
            statusCode: 400,
            message: "Name must be between 2 and 80 characters",
        }
    );
});

test("changeUserPassword updates password with valid current password", async () => {
    const result = await changeUserPassword(
        testUserId.toString(),
        "Password123!",
        "NewSecretPassword123!"
    );

    assert.equal(result.message, "Password updated successfully");

    const userWithPw = await User.findById(testUserId).select("+password");
    assert.ok(userWithPw);
    const matchesNew = await bcrypt.compare(
        "NewSecretPassword123!",
        userWithPw.password
    );
    assert.equal(matchesNew, true);
});

test("changeUserPassword rejects wrong current password", async () => {
    await assert.rejects(
        async () => {
            await changeUserPassword(
                testUserId.toString(),
                "WrongCurrentPassword!",
                "NewSecretPassword123!"
            );
        },
        {
            statusCode: 400,
            message: "Incorrect current password",
        }
    );
});

test("address management: add, update, setDefault, delete and default reassignment", async () => {
    // 1. Add first address (should automatically become default)
    const add1 = await addAddress(testUserId.toString(), {
        fullName: "Carlos Doe",
        address: "Calle Mayor 10",
        city: "Madrid",
        postalCode: "28001",
        country: "España",
        phone: "+34 600 000 001",
    });
    assert.equal(add1.length, 1);
    assert.equal(add1[0].isDefault, true);
    const addressId1 = add1[0]._id!.toString();

    // 2. Add second address with isDefault: true (should unset first address default)
    const add2 = await addAddress(testUserId.toString(), {
        fullName: "Carlos Doe Office",
        address: "Paseo de la Castellana 50",
        city: "Madrid",
        postalCode: "28046",
        country: "España",
        phone: "+34 600 000 002",
        isDefault: true,
    });
    assert.equal(add2.length, 2);
    const addr1 = add2.find((a) => a._id!.toString() === addressId1);
    const addr2 = add2.find((a) => a.address === "Paseo de la Castellana 50");
    assert.equal(addr1?.isDefault, false);
    assert.equal(addr2?.isDefault, true);
    const addressId2 = addr2!._id!.toString();

    // 3. Update second address
    const updatedAddresses = await updateAddress(
        testUserId.toString(),
        addressId2,
        {
            address: "Paseo de la Castellana 100",
        }
    );
    const updated2 = updatedAddresses.find((a) => a._id!.toString() === addressId2);
    assert.equal(updated2?.address, "Paseo de la Castellana 100");

    // 4. Set first address back as default
    const withDefault1 = await setDefaultAddress(
        testUserId.toString(),
        addressId1
    );
    const reDefault1 = withDefault1.find((a) => a._id!.toString() === addressId1);
    const reDefault2 = withDefault1.find((a) => a._id!.toString() === addressId2);
    assert.equal(reDefault1?.isDefault, true);
    assert.equal(reDefault2?.isDefault, false);

    // 5. Delete default address (addressId1) -> remaining address (addressId2) becomes default
    const afterDelete = await deleteAddress(
        testUserId.toString(),
        addressId1
    );
    assert.equal(afterDelete.length, 1);
    assert.equal(afterDelete[0]._id!.toString(), addressId2);
    assert.equal(afterDelete[0].isDefault, true);
});

test("HTTP endpoints: full user profile and address lifecycle", async () => {
    const token = generateToken(testUserId.toString());

    // 1. Unauthenticated request returns 401
    const unauth = await fetch(`${baseUrl}/api/users/profile`);
    assert.equal(unauth.status, 401);

    // 2. GET /api/users/profile returns 200
    const getRes = await fetch(`${baseUrl}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(getRes.status, 200);
    const getBody = (await getRes.json()) as any;
    assert.equal(getBody.success, true);
    assert.equal(getBody.data.email, "carlos@kaltech.com");

    // 3. PUT /api/users/profile updates profile
    const putRes = await fetch(`${baseUrl}/api/users/profile`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: "Carlos HTTP", phone: "+34 600 111 222" }),
    });
    assert.equal(putRes.status, 200);
    const putBody = (await putRes.json()) as any;
    assert.equal(putBody.data.name, "Carlos HTTP");

    // 4. POST /api/users/addresses creates address
    const postAddr = await fetch(`${baseUrl}/api/users/addresses`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            fullName: "Carlos HTTP",
            address: "Calle Gran Vía 1",
            city: "Madrid",
            postalCode: "28013",
            country: "España",
            phone: "+34 600 111 222",
        }),
    });
    assert.equal(postAddr.status, 201);
    const addrBody = (await postAddr.json()) as any;
    assert.equal(addrBody.success, true);
    assert.equal(addrBody.data.length, 1);
    const newAddressId = addrBody.data[0]._id;

    // 5. GET /api/users/addresses returns 200
    const getAddrs = await fetch(`${baseUrl}/api/users/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(getAddrs.status, 200);

    // 6. DELETE /api/users/addresses/:addressId deletes address
    const delAddr = await fetch(
        `${baseUrl}/api/users/addresses/${newAddressId}`,
        {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    assert.equal(delAddr.status, 200);
    const delBody = (await delAddr.json()) as any;
    assert.equal(delBody.data.length, 0);
});
