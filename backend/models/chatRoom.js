const mongoose = require("mongoose");

const Schema = mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Types.ObjectId,
        required: true,
      },
    ],
    messages: [
      {
        type: mongoose.Types.ObjectId,
        required: true,
      },
    ],
    name: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ChatRoom", Schema);
