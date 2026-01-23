import request from "supertest";
import app from "../src/app.js";
import mongoose from "mongoose";

describe("Auth API", () => {
  const agent = request.agent(app);

  let email;
  const password = "Password@123";

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
    }

    const unique = Date.now();
    email = `testuser_${unique}@example.com`;

    await agent.post("/api/auth/register").send({
      username: `testuser_${unique}`,
      email,
      password,
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should login the user", async () => {
    const res = await agent.post("/api/auth/login").send({
      email,
      password,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
