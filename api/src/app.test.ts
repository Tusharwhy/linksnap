
import { after, test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";

import app from "./app.js";
import { redis } from "./config/redis.js";

// Close the Redis connection so the test process can exit.
after(() => {
    redis.disconnect();
});

test("GET /healthz returns 200 and a healthy message", async () => {
    const response = await request(app).get("/healthz");

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, {
        message: "LinkSnap API is healthy",
    });
});

test("Unknown routes return 404", async () => {
    const response = await request(app).get("/this-route-does-not-exist");

    assert.equal(response.status, 404);
    assert.deepEqual(response.body, {
        message: "Route not found",
    });
});



test("Protected routes reject requests without an access token", async () => {
    const response = await request(app).get("/api/v1/links");

    assert.equal(response.status, 401);
    assert.equal(response.body.message, "Missing token");
});

test("Protected routes reject invalid access tokens", async () => {
    const response = await request(app)
        .get("/api/v1/links")
        .set("Authorization", "Bearer invalid-token");

    assert.equal(response.status, 401);
    assert.equal(response.body.message, "Invalid or expired token");
});
