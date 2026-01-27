export const emitSocketEvent = (io, type, data) => {
  if (!io) return;

  const payload = {
    type,
    data,
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  
  if (data?.recipient) {
    io.to(`user:${data.recipient}`).emit(type, payload);
    return;
  }


  io.emit(type, payload);
};
