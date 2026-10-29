
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
