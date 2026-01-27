import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, required: true }, 
  targetId: { type: String },
  details: { type: String },
  ipAddress: { type: String }
}, { timestamps: true });

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);