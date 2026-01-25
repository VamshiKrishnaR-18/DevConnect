const API_URL = import.meta.env.VITE_API_BASE_URL;

export const getProfileImageSrc = (profilepic) => {
  if (!profilepic) return "/defaultAvatar.svg";

  if (profilepic.startsWith("http")) return profilepic;

  if (profilepic.startsWith("/uploads")) {
    return `${API_URL}${profilepic}`;
  }

  return `${API_URL}/uploads/profile/profile_pics/${profilepic}`;
};
