export const emitSocketEvent = (io, type, data) => {
  io.emit(type, {
    type,
    data,
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
};
