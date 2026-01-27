import request from "supertest";
import app from "../src/app.js";
import mongoose from "mongoose";

describe("Posts API (protected)", () => {
  const agent = request.agent(app);
  const unique = Date.now();
  let cookieString;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
    }

   
    await agent.post("/api/auth/register").send({
      username: `posttest_${unique}`,
      email: `posttest_${unique}@example.com`,
      password: "Password@123",
    });

   
    const loginRes = await agent.post("/api/auth/login").send({
      email: `posttest_${unique}@example.com`,
      password: "Password@123",
    });

    
    const cookies = loginRes.headers['set-cookie'];
    if (cookies) cookieString = cookies[0].split(';')[0];
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should create a post when authenticated", async () => {
    const res = await agent
      .post("/api/posts")
      .set("Cookie", cookieString)
      .send({ content: "This is a protected test post" });

   
    if (res.statusCode !== 201) {
      console.error("❌ Create Post Failed:", res.body);
    }
    

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);

    
    const postData = res.body.data?.post || res.body.data || res.body.post;
    
    if (!postData) {
      console.error("❌ Could not find post in response:", JSON.stringify(res.body, null, 2));
    }

    expect(postData).toBeDefined();
    expect(postData.content).toBe("This is a protected test post");
  });

  it("should fail if not authenticated", async () => {
    const res = await request(app).post("/api/posts").send({
      content: "Unauthorized post",
    });
    expect(res.statusCode).toBe(401);
  });
});