import config from "../config/environment";

// Cloudinary Sample Image (The "Flower" you see)
const DEFAULT_AVATAR = "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg"; 

export const getProfileImageSrc = (profilepic) => {
  // 1. If no pic, return default
  if (!profilepic) return DEFAULT_AVATAR;

  // 2. Extract URL if it's the new Backend Object structure
  let imageUrl = profilepic;
  if (typeof profilepic === "object" && profilepic.url) {
    imageUrl = profilepic.url;
  }

  // 3. Safety Check: If it's still not a string, return default
  if (typeof imageUrl !== "string") return DEFAULT_AVATAR;

  // 4. Return correct URL
  if (imageUrl.startsWith("http")) {
    return imageUrl; // Already a full URL
  }

  // Handle local uploads (legacy)
  return `${config.API_BASE_URL}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
};