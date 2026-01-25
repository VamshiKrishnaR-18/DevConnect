export const emitSocketEvent = (io, type, data) => {
  if (!io) return;

  const payload = {
    type,
    data,
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  // 🔔 User-specific notification
  if (data?.recipient) {
    io.to(`user:${data.recipient}`).emit(type, payload);
    return;
  }

  // 🌍 Global event (posts, likes, comments)
  io.emit(type, payload);
};
