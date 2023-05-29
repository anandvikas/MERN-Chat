const mongoose = require("mongoose");

const Schema = mongoose.Schema(
  {
    chatId: { type: mongoose.Types.ObjectId, required: true },
    text: { type: String, default: null },
    file: { type: String, default: null },
    sender: { type: mongoose.Types.ObjectId, required: true },
    receiver: { type: mongoose.Types.ObjectId, required: true },
    status: {
      type: String,
      enum: ["sent", "received", "seen"],
      default: "sent",
      required: true,
    },
    isReply: { type: Boolean, default: false },
    replyOf: { type: mongoose.Types.ObjectId, default: null },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", Schema);
