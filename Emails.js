import mongoose from "mongoose"

const emailSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// ⛔ هذا السطر مفقود عندك أو غير صحيح
const Email = mongoose.model("Email", emailSchema)
export default Email // ✅ تأكد من وجود هذا