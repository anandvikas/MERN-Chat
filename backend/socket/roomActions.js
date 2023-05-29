const { decodeToken } = require("../utils/helper")

const users = {
  // userId : [socketId, socketId]
};

const sockets = {
  // socketId : userId
};

const activeChats = {
  // socketId : chatId
};

const socketsActiveOnChat = {
  // chatId : [socketIds]
};

const getTokenData = async (token) => {
  let decodedToken;

  try {
    decodedToken = await decodeToken(token);
  } catch (err) {
    return {
      status: false,
    };
  }

  if (!decodedToken) {
    return {
      status: false,
    };
  }

  return {
    status: true,
    id: decodedToken.id,
  };
};

const addUser = async ({ userId, socketId }) => {
  // const { status, id: userId } = await getTokenData(token);

  // console.log(userId)

  // if (!status || status == false) {
  //   return;
  // }

  let isUserExist = users[userId];

  if (!isUserExist) {
    users[userId] = [socketId];
    sockets[socketId] = userId
  }

  if (isUserExist && !isUserExist.includes(socketId)) {
    users[userId].push(socketId);
    sockets[socketId] = userId;
  }

  console.log("users ------>", users);
  console.log("seckets ------>", sockets);

  return;
};

const removeUser = async (socketId) => {

  let userId = sockets[socketId];
  if (users[userId]) {
    if (users[userId].length < 2) {
      delete users[userId]
    } else {
      users[userId] = users[userId].filter(sid => sid !== socketId)
    }
    delete sockets[socketId]
  }

  // removing active chat ----
  removeActiveChat(socketId);

  console.log("users ------>", users);
  console.log("seckets ------>", sockets);

  return;
};

const getSocketIdsOfUser = (userId) => {
  return users[userId] || [];
};

const userWithThisSocketId = (sid) => {
  return sockets[sid];
};

const addActiveChat = (socketId, chatId) => {
  activeChats[socketId] = chatId;

  if (socketsActiveOnChat[chatId]) {
    socketsActiveOnChat[chatId].push(socketId)
  } else {
    socketsActiveOnChat[chatId] = [socketId]
  }

  console.log("active chats ------> ", activeChats);
  console.log("sockets on chat ------> ", socketsActiveOnChat);
};

const removeActiveChat = (socketId) => {

  let chatId = activeChats[socketId]
  delete activeChats[socketId];

  if (socketsActiveOnChat[chatId]) {
    socketsActiveOnChat[chatId] = socketsActiveOnChat[chatId].filter(v => v != socketId)
  }

  if (socketsActiveOnChat[chatId] && socketsActiveOnChat[chatId].length < 0) {
    delete socketsActiveOnChat[chatId]
  }

  console.log("active chats ------> ", activeChats);
  console.log("sockets on chat ------> ", socketsActiveOnChat);
};

const isActiveOnChat = (socketId, chatId) => {
  return activeChats[socketId] === chatId;
};

const socketsOnChat = (chatId) => {
  return socketsActiveOnChat[chatId];
};

module.exports = {
  getTokenData,
  addUser,
  getSocketIdsOfUser,
  userWithThisSocketId,
  activeChats,
  addActiveChat,
  removeActiveChat,
  isActiveOnChat,
  removeUser,
  socketsOnChat  
};
