const {
  getTokenData,
  addUser,
  removeUser,
  addActiveChat,
  socketsOnChat
} = require("./roomActions");
const { eventEmitters } = require("./emitters")

const chatController = require("../controllers/chatRoom");

const eventListeners = async (socket) => {
  socket.on("join", async (data) => {
    let { status, id: userId } = await getTokenData(data.token);
    if (!status || status == false || !userId) {
      return;
    }
    addUser({ userId, socketId: socket.id });
    chatController.markReceived(userId)
    return;
  });

  socket.on("setActiveChat", async (data) => {
    let { chatId } = data;
    if (!chatId) {
      return;
    }
    addActiveChat(socket.id, chatId);
    return;
  });

  socket.on("typing", async (data) => {
    let { chatId } = data;
    if (!chatId) {
      return;
    }

    let sIds = socketsOnChat(chatId) || [];
    sIds = sIds.filter(id => id != socket.id)

    eventEmitters.typing({ sendTo: sIds, data: { chatId } });
    return;
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
    return;
  });

};

module.exports = {
  eventListeners,
};
