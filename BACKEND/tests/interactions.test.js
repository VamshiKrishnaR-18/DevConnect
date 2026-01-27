import request from "supertest";
import app from "../src/app.js";
import mongoose from "mongoose";
import User from "../src/models/User.model.js";
import Post from "../src/models/Post.model.js";

describe("Social Interactions (Likes & Comments)", () => {
  const agent = request.agent(app);
  let postId;
  let userId;
  let cookieString;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
    }
   
    await User.deleteMany({ email: /interaction/ });
    await Post.deleteMany({});

   
    await agent.post("/api/auth/register").send({
      username: "interactor",
      email: "interaction@test.com",
      password: "Password123"
    });
    
    const loginRes = await agent.post("/api/auth/login").send({
      email: "interaction@test.com",
      password: "Password123"
    });
    
   
    const cookies = loginRes.headers['set-cookie'];
    if (cookies) cookieString = cookies[0].split(';')[0];
    
    userId = loginRes.body.data.user._id;

    
    const postRes = await agent
      .post("/api/posts")
      .set("Cookie", cookieString)
      .send({ content: "Post to be liked" });

    
    const body = postRes.body;
    const postObj = body.data?.post || body.data || body.post;
    
    if (postObj && postObj._id) {
        postId = postObj._id;
    } else {
        console.error("❌ SETUP FAILED: Could not get Post ID", body);
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  
  const getLikes = (res) => {
    const data = res.body.data?.post || res.body.data || res.body.post || res.body;
    return data ? (data.likes || []) : [];
  };

  it("POST /api/posts/:id/like - Should like a post", async () => {
    if (!postId) throw new Error("Skipping test: postId is undefined");

    const res = await agent
      .post(`/api/posts/${postId}/like`)
      .set("Cookie", cookieString);

    expect(res.statusCode).toBe(200);
    expect(getLikes(res)).toContain(userId);
  });

  it("POST /api/posts/:id/like - Should UN-like if clicked again", async () => {
    if (!postId) throw new Error("Skipping test: postId is undefined");

    const res = await agent
      .post(`/api/posts/${postId}/like`)
      .set("Cookie", cookieString);

    expect(res.statusCode).toBe(200);
    expect(getLikes(res)).not.toContain(userId);
  });

  it("POST /api/posts/:id/comment - Should add a comment", async () => {
    if (!postId) throw new Error("Skipping test: postId is undefined");

    const res = await agent
      .post(`/api/posts/${postId}/comment`)
      .set("Cookie", cookieString)
      .send({ text: "Test comment" });

    
    expect(res.statusCode).toBe(200);
    
    
    const data = res.body.data?.post || res.body.data || res.body.post;
    const comments = Array.isArray(data) ? data : (data.comments || []);
    
    const found = comments.some 
        ? comments.some(c => c.text === "Test comment") 
        : (data.text === "Test comment");
    
    expect(found).toBe(true);
  });

  it("DELETE /api/posts/:id - Should delete the post", async () => {
    if (!postId) throw new Error("Skipping test: postId is undefined");

    const res = await agent
      .delete(`/api/posts/${postId}`)
      .set("Cookie", cookieString);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });
});