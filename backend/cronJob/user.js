const mongoose = require("mongoose")
const ObjectId = mongoose.Types.ObjectId;
const User = require("../models/user");
const ChatRoom = require("../models/chatRoom");
const Message = require("../models/message");
const moment = require("moment");


exports.deleteExpiredAccount = async () => {
  let users = await User.find({
    dateOfDeletion: {
      // older then 8 weeks
      $lte: moment(),
    },
  });
  if (users.length > 0) {
    for (let i = 0; i < users.length; i++) {
      let user = users[i];
      // deleting user -----
      await User.findOneAndDelete({ _id: user._id });

      // deleting user's chats -----
      await ChatRoom.deleteMany({ users: { $in: [ObjectId(user._id)] } });

      // deleting user's messages -----
      await Message.deleteMany({ $or: [{ sender: ObjectId(user._id) }, { receiver: ObjectId(user._id) }] });
    }
  }
};
