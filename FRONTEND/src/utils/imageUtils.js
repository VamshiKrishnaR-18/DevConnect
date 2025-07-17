/**
 * Utility function to get the correct profile image source
 * @param {string} profilepic - The profile picture path/URL from the database
 * @returns {string} - The correct image source URL
 */
export const getProfileImageSrc = (profilepic) => {
  if (!profilepic) {
    return '/defaultAvatar.svg';
  }

  if (profilepic.startsWith('http')) {
    return profilepic;
  }

  if (profilepic.startsWith('/uploads')) {
    return profilepic;
  }

  return profilepic;
};
