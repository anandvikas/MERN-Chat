const { getReceivers } = require("./roomActions");
const { getIO } = require("./socket");

const eventEmitters = {
  chatReply: async (dataToSend) => {
    const io = getIO();
    dataToSend.forEach((val) => {
      io.to(val.sendTo).emit("chatReply", val.data);
    });
  },
  seenStatus: async (dataToSend) => {
    const io = getIO();

    dataToSend.forEach((val) => {
      val.sendTo.forEach((res) => {
        io.to(res).emit("seenStatus", val.data);
      });
    });
  },
  receivedStatus: async (dataToSend) => {
    const io = getIO();

    dataToSend.forEach((val) => {
      val.sendTo.forEach((res) => {
        io.to(res).emit("receivedStatus", val.data);
      });
    });
  },
  newMessage: async (dataToSend) => {
    const io = getIO();
    dataToSend.forEach((val) => {
      io.to(val.sendTo).emit("newMessage", val.data);
    });
  },
  typing: async ({ sendTo, data }) => {
    const io = getIO();
    sendTo.forEach((val) => {
      io.to(val).emit("typing", data);
    });
  },
};

module.exports = {
  eventEmitters,
};
