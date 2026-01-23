import request from "supertest";
import app from "../src/app.js";
import mongoose from "mongoose";

describe("Posts API (protected)", () => {
  const agent = request.agent(app);
  const unique = Date.now();

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
    }

    await agent.post("/api/auth/register").send({
      username: `poststestuser_${unique}`,
      email: `poststestuser_${unique}@example.com`,
      password: "Password@123",
    });

    const loginRes = await agent.post("/api/auth/login").send({
      email: `poststestuser_${unique}@example.com`,
      password: "Password@123",
    });

    expect([200, 401]).toContain(loginRes.statusCode);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should create a post when authenticated", async () => {
    const res = await agent.post("/api/posts").send({
      content: "This is a protected test post",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.post).toBeDefined();
  });

  it("should fail if not authenticated", async () => {
    const res = await request(app).post("/api/posts").send({
      content: "Unauthorized post",
    });

    expect(res.statusCode).toBe(401);
  });
});
