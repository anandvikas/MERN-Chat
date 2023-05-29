const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    userName: {
      type: String,
      unique: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    verificationOtp: {
      type: Number,
      required: true
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    forgrtPasswordToken: {
      type: String,
      required: false
    },
    dateOfDeletion : {
      type : Date,
      required : true
    }
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model("User", userSchema);


