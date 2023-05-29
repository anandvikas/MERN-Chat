const Message = require("../models/message");
const { validationResult } = require("express-validator");
const ChatRoom = require("../models/chatRoom");
const User = require("../models/user");
const { eventEmitters } = require("../socket/emitters");
const { getSocketIdsOfUser, isActiveOnChat } = require("../socket/roomActions");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const {
  HttpErrorResponse, 
} = require("../utils/helper");

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

exports.checkChatExists = async (req, res) => {
  const {otherUserId} = req.body;
  const {userId} = req;


  const users = [ObjectId(userId), ObjectId(otherUserId)];

  let isChatExists = false;
  let chatId = null;
  let lastMessage = null;
  try {
    let chat = await ChatRoom.findOne({users : { $all: users }});
    if(chat && chat.users.length === users.length){
      isChatExists = true;
      chatId = chat._id;
      let messages = chat.messages;
      if(messages.length > 0){
        // code to fetch the last message ---
      }
    } 
  } catch (err) {
    return res.status(500).json(HttpErrorResponse("Something went wrong while fetching required data."));    
  }

  res.status(200).json({
    status : true,
    isChatExists,
    chatId,
    lastMessage
  })
}

exports.createChat = async (req, res) => {
  const {otherUserId} = req.body;
  const {userId} = req;
  const users = [ObjectId(userId), ObjectId(otherUserId)];
 

  // creating new -----
  let newChat = new ChatRoom({
    users,      
  })

  try {
    let isChatExists = await ChatRoom.findOne({users : { $all: users }});
    if(isChatExists && isChatExists.users.length === users.length){
      return res.status(500).json(HttpErrorResponse("This chat is already active."));
    }     

    await newChat.save();

  } catch (err) {
    return res.status(500).json(HttpErrorResponse("Something went wrong while creating the chat."));    
  }

  res.status(200).json({
    status : true,
    messate : "Chat successfuly created.",
    chatId : newChat._id,
    lastMessage : null
  })
}

exports.getMyChats = async (req, res) => {
  const {userId} = req;

  let commonPipe = [
    {
      '$match': {
        'users': {
          '$in': [
            new ObjectId(userId)
          ]
        }
      }
    }, {
      '$addFields': {
        'totalMessages': {
          '$size': '$messages'
        }
      }
    }, {
      '$match': {
        'totalMessages': {
          '$gt': 0
        }
      }
    }, {
      '$addFields': {
        'lastMessage': {
          '$last': '$messages'
        }, 
        'otherUser': {
          '$filter': {
            'input': '$users', 
            'as': 'user', 
            'cond': {
              '$ne': [
                '$$user', new ObjectId(userId)
              ]
            }
          }
        }
      }
    }, {
      '$addFields': {
        'otherUser': {
          '$first': '$otherUser'
        }
      }
    }, {
      '$lookup': {
        'from': 'users', 
        'localField': 'otherUser', 
        'foreignField': '_id', 
        'as': 'otherUser'
      }
    }, {
      '$addFields': {
        'otherUser': {
          '$first': '$otherUser'
        }
      }
    }, {
      '$lookup': {
        'from': 'messages', 
        'localField': 'lastMessage', 
        'foreignField': '_id', 
        'as': 'lastMessage'
      }
    }, {
      '$addFields': {
        'lastMessage': {
          '$first': '$lastMessage'
        }
      }
    }, {
      '$lookup': {
        'from': 'messages', 
        'localField': '_id', 
        'foreignField': 'chatId', 
        'pipeline': [
          {
            '$match': {
              'receiver': new ObjectId(userId), 
              'status': {
                '$ne': 'seen'
              }
            }
          }
        ], 
        'as': 'unseenMessages'
      }
    }, {
      '$project': {
        '_id': 1, 
        'updatedAt': 1, 
        'unseenMessagesCount': {
          '$size': '$unseenMessages'
        }, 
        'unseenMessages' : {
          '_id' : 1,
          // 'text' : 1,
          // 'file' : 1,
          // 'status' : 1,
          // 'createdAt' : 1,
        },
        'lastMessage': {
          '_id': 1, 
          'text': 1, 
          'file': 1, 
          'sender': {
            '_id' : "$lastMessage.sender"
          }, 
          'status': 1, 
          'createdAt': 1
        }, 
        'otherUser': {
          '_id': 1, 
          'userName': 1, 
          'email': 1, 
          'avatar': 1
        }
      }
    }, {
      '$sort': {
        'updatedAt': -1
      }
    }
  ]

  let chats;
  try {
    chats = await ChatRoom.aggregate([commonPipe]);
  } catch (err) {
    return res.status(500).json(HttpErrorResponse("Couldn't find chats."));    
  };

  res.status(200).json({
    status : true,
    message : "Chats fetched successfully",
    chats
  })
}

exports.createMessage = async (req, res) => {
  const {text, chatId, receiver, replyOf} = req.body;
  const {files} = req;  
  const {userId : sender} = req;
  const {userData : senderData} = req;
  let allowedMessageCountPerUser = 100;

  let chat;
  let extras = {};
  if(files?.fileAttachments && files.fileAttachments.length > 0){
    extras.file = files.fileAttachments[0].path.split("backend\\")[1]
  }  

  if(!text && !extras.file){
    return res.status(402).json(HttpErrorResponse("Message cannot be empty."));
  }

  // validating the chatroom ------
  try {
    chat = await ChatRoom.findById(chatId);
    if(!chat){
      return res.status(402).json(HttpErrorResponse("Couldn't find the chat."));
    }
    if(chat.messages && chat.messages.length >= allowedMessageCountPerUser){
      let myMessagesCount = await Message.find({sender});
      console.log(myMessagesCount)
      myMessagesCount = myMessagesCount.length || 0;
      if(myMessagesCount >= allowedMessageCountPerUser){
        return res.status(402).json(HttpErrorResponse("You are not allowed to send more then 50 messages."));
      }
    }
  } catch (err) {
    return res.status(500).json(HttpErrorResponse("Something went wrong while sending the message."));
  }

  // validating the replyOf message ------
  let replyOfMessage;
  if(replyOf){
    try {
      replyOfMessage = await Message.findById(replyOf);
      if(!replyOfMessage || !replyOfMessage.chatId || replyOfMessage.chatId.toString() !== chatId.toString()){
        return res.status(402).json(HttpErrorResponse("Replying to an invalid message."));
      }

      extras.isReply = true;
      extras.replyOf = replyOf;
    
    } catch (err) {
      return res.status(500).json(HttpErrorResponse("Something went wrong while sending the message."));
    }
  }
  

  // getting socketIds if sender an receiver is live ----
  let senderSocketIds = getSocketIdsOfUser(sender);
  let receiverSocketIds = getSocketIdsOfUser(receiver);

  //if receiver socket id exists --> receiver is live
  if(receiverSocketIds.length > 0){
    extras.status = "received"
  }

  let isReceiverActiveOnChat = isActiveOnChat(receiverSocketIds, chatId)
  if(isReceiverActiveOnChat){
    extras.status = "seen"
  }

  // creating new message -----
  let newMessage = new Message({
    chatId,
    text,    
    sender,
    receiver,
    ...extras
  })

  try {
    newMessage = await newMessage.save();
    await ChatRoom.findByIdAndUpdate(chatId, {
      $push : {messages : ObjectId(newMessage._id)}
    })
  } catch (err) {
    return res.status(500).json(HttpErrorResponse("Something went wrong while sending the message."));    
  }

  // Emitting the message to the receiver AND SENDER ----
  let messsageToSend = {
    chatId,
    message : {
      _id : newMessage._id,
      text : newMessage.text,
      file : newMessage.file,
      status : newMessage.status,
      createdAt : newMessage.createdAt,
      isReply : newMessage.isReply,
      replyOf : !newMessage.isReply ? null : {
        _id : replyOfMessage._id,
        text : replyOfMessage.text,
        file : replyOfMessage.file,
        status : replyOfMessage.status,
        createdAt : replyOfMessage.createdAt,
      },
      sender : {
        userName : senderData.userName,
        email : senderData.email,
        avatar : senderData.avatar,
        _id : senderData._id
      }
    }
  }

  let dataToSend = [
    {
      sendTo : senderSocketIds,
      data : messsageToSend
    },    
  ]

  let chatReplyData = [];
  let notificationData = [];
  // if sender is active on chat sending as a chat reply otherwise sending as a new message notification -----
  if(senderSocketIds.length > 0 ){
    senderSocketIds.forEach(sid => {
      let isActive = isActiveOnChat(sid, chatId);
      if(isActive){
        chatReplyData.push({
          sendTo : sid,
          data : messsageToSend
        })
        notificationData.push({
          sendTo : sid,
          data : messsageToSend
        })
      } else if (!isActive){
        notificationData.push({
          sendTo : sid,
          data : messsageToSend
        })
      }
    })    
  }

  // if receiver is active on chat sending as a chat reply otherwise sending as a new message notification -----
  if(receiverSocketIds.length > 0 ){
    receiverSocketIds.forEach(sid => {
      let isActive = isActiveOnChat(sid, chatId);
      if(isActive){
        chatReplyData.push({
          sendTo : sid,
          data : messsageToSend
        })
        notificationData.push({
          sendTo : sid,
          data : messsageToSend
        })
      } else if (!isActive){
        notificationData.push({
          sendTo : sid,
          data : messsageToSend
        })
      }
    })
    // if(isReceiverActiveOnChat){
    //   dataToSend.push(  
    //     {
    //       sendTo : receiverSocketIds,
    //       data : messsageToSend
    //     }
    //   );
    // } else if (!isReceiverActiveOnChat){
    //   await eventEmitters.newMessage([      
    //     {
    //       sendTo : receiverSocketIds,
    //       data : messsageToSend
    //     }
    //   ]);
    // }    
  }

  // await eventEmitters.chatReply(dataToSend);
  await eventEmitters.chatReply(chatReplyData);
  await eventEmitters.newMessage(notificationData);


  res.status(200).json({
      status : true,
      message : "Message sent successfully"
  })
}

exports.getMessages = async (req, res) => {
  let {page} = req.query;
  const {chatId} = req.body;
  const {userId} = req;

  page = page ? +page : 1;
  let perPage = 10;

  let paginationPipe = [
    {
      '$skip': (page - 1)*perPage
    }, 
    {
      '$limit': perPage
    }, 
  ]

  const commonPipe = [
    {
      '$match': {
        'chatId': new ObjectId(chatId)
      }
    }, 
    {
      '$sort': {
        'createdAt': -1
      }
    }, 
    ...paginationPipe,
    {
      '$lookup': {
        'from': 'users', 
        'localField': 'sender', 
        'foreignField': '_id', 
        'as': 'sender'
      }
    }, 
    {
      '$lookup': {
        'from': 'messages',
        'localField': 'replyOf',
        'foreignField': '_id',
        'as': 'replyOf'
      }
    },
    {
      '$addFields': {
        'sender': {
          '$first': '$sender'
        },        
        'replyOf':{'$first' : "$replyOf"}        
      }
    },     
    {
      '$project': {
        'text': 1, 
        'file': 1, 
        'status': 1, 
        'createdAt': 1, 
        'isReply': 1, 
        'receiver' : 1,
        'replyOf' : {
          '_id' : 1,
          'text' : 1,
          'file' : 1,
          'status' : 1,
          'createdAt' : 1
        }, 
        'chatId': 1, 
        'sender': {
          '_id': 1, 
          'userName': 1, 
          'email': 1, 
          'avatar': 1
        }
      }
    },
    {
      '$sort' : {
        'createdAt' : 1
      }
    }
  ];

  let messages;
  try {
    messages = await Message.aggregate(commonPipe);
  } catch (err) {
    return res.status(500).json(HttpErrorResponse("Unable to get the messages."));
  }

  // If messages are fetched by an user --> it means it it seen by the user, 
  let messagesToMarkSeen = []
  messages = messages.map(m => {
    if(m.receiver.toString() == userId.toString() && m.status != 'seen'){
      messagesToMarkSeen.push(m);
      return {...m, status : 'seen'}
    }else {
      return m
    }
  })
  let sender = messagesToMarkSeen[0]?.sender?._id || null;
  // messagesToMarkSeen = messagesToMarkSeen.map(m => ObjectId(m._id));
  await markSeen(messagesToMarkSeen, sender);

  res.status(200).json({
    status : true,
    message : "Messages fetched successfully.",
    messages : messages || [],
    nextPage : page + 1
  })
}

const markSeen = async (messagesToMarkSeen = [], sendStatusTo = null) => {

  try {
    let listOfIds = messagesToMarkSeen.map(m => ObjectId(m._id));
    await Message.updateMany({_id : {$in : listOfIds}}, {$set : {status : "seen"}});

    // sending mark seen event to te sender ----
    if(sendStatusTo && listOfIds.length > 0){
      let chatId = messagesToMarkSeen[0].chatId
      let senderSocketIds = getSocketIdsOfUser(sendStatusTo);
      let dataToSend = [
        {
          sendTo : senderSocketIds,
          data : {messages : listOfIds, chatId}
        }        
      ]
    
      await eventEmitters.seenStatus(dataToSend)
    }
  } catch (err) {
    console.log(err)
  }

}

exports.markReceived = async (userId) => {

  try {
    // when an user is joining the socket it means they have received all the messages ------
    let messagesToMarkReceived = await Message.find({receiver : ObjectId(userId), status : 'sent'});
    let sender = messagesToMarkReceived[0]?.sender || null
    let listOfIds = messagesToMarkReceived.map(m => ObjectId(m._id));
    await Message.updateMany({_id : {$in : listOfIds}}, {$set : {status : "received"}});

    // sending mark seen event to te sender ----
    if(sender && listOfIds.length > 0){
      let chatId = messagesToMarkReceived[0].chatId
      let senderSocketIds = getSocketIdsOfUser(sender);
      let dataToSend = [
        {
          sendTo : senderSocketIds,
          data : {messages : listOfIds, chatId}
        }        
      ]    
      await eventEmitters.receivedStatus(dataToSend)
    }    
    
  } catch (err) {
    console.log(err)
  }

}


































// const getReceiverData = async (userId) => {
//   let data = await User.aggregate([
//     {
//       $match: {
//         _id: new ObjectId(userId),
//       },
//     },
//     {
//       $lookup: {
//         from: "subscriptionplans",
//         localField: "subscriptionPlan",
//         foreignField: "_id",
//         as: "subs",
//       },
//     },
//     {
//       $unwind: {
//         path: "$subs",
//       },
//     },
//     {
//       $project: {
//         allowedMessages: "$subs.messages",
//         _id: 0,
//         receiver: {
//           _id: "$_id",
//           name: "$name",
//           userName: "$userName",
//           profilePic: "$profilePic",
//           email: "$email",
//         },
//       },
//     },
//   ]);
//   return data[0];
// };

// const getFilteredChat = (chat, totalMessages, receiverData) => {
//   let filtered;
//   let { _id: userId } = receiverData.receiver;
//   let { allowedMessages } = receiverData;
//   allowedMessages = +allowedMessages;

//   filtered = chat.map((v) => {
//     if (
//       totalMessages >= allowedMessages &&
//       v.sender._id.toString() !== userId.toString()
//     ) {
//       return {
//         message: {
//           ...v.message,
//           text: v.message.text
//             .split(" ")
//             .map((a) => {
//               let b = "";
//               for (let c = 0; c < a.length; c++) {
//                 b += "*";
//               }
//               return b;
//             })
//             .join(" "),
//           file: v.message.file ? "/assets/noImageIcon.png" : undefined,
//           replyOf : v.message.isReply ? {
//             ...v.message.replyOf,
//             text : "*** ***",            
//           } : {}
//         },
//         sender: v.sender,
//         isBlurred: true,
//       };
//     } else {
//       return {
//         message: v.message,
//         sender: v.sender,
//         isBlurred: false,
//       };
//     }
//   });

//   return filtered;

//   // for few messages to be blurred
//   // chat = chat.map((v) => {
//   //   if (v.msgNumber > +allowedMessages && v.sender._id.toString() !== userId) {
//   //     return {
//   //       message: {
//   //         ...v.message,
//   //         text: "**** **** **** ****",
//   //         file: v.message.file ? "/assets/noImageIcon.png" : undefined,
//   //       },
//   //       sender: v.sender,
//   //       isBlurred: true,
//   //     };
//   //   } else {
//   //     return {
//   //       message: v.message,
//   //       sender: v.sender,
//   //       isBlurred: false,
//   //     };
//   //   }
//   // });
// };

// const markSeen = async (messages) => {
//   messages = messages.map((m) => ObjectId(m._id));

//   let seenRes;
//   try {
//     seenRes = await Message.updateMany(
//       { _id: { $in: messages } },
//       { $set: { status: "seen" } }
//     );

//     if (!seenRes.acknowledged || seenRes.modifiedCount <= 0) {
//       return false;
//     }
//   } catch (err) {
//     return false;
//   }

//   return true;
// };

// exports.markReceived = async (data) => {
//   const { id: userId } = data;

//   let chats = await ChatRoom.find({
//     users: {
//       $in: [new ObjectId(userId)],
//     },
//   });

//   let messages = [];
//   let otherUsers = [];
//   chats.forEach((chat) => {
//     messages = messages.concat(chat.messages);
//     otherUsers = otherUsers.concat(
//       chat.users.filter((u) => u.toString() !== userId.toString())
//     );
//   });

//   messages = messages.map((m) => ObjectId(m));
//   otherUsers = otherUsers.map((u) => ObjectId(u));
//   otherUsers = [...new Set(otherUsers)];

//   messages = await Message.find({
//     _id: {
//       $in: messages,
//     },
//   });

//   let messagesToMarkReceived = [];
//   messages.forEach((m) => {
//     if (
//       m.receiver.toString() === userId.toString() &&
//       m.status !== "received" &&
//       m.status !== "seen"
//     ) {
//       messagesToMarkReceived.push({ _id: m._id, status: "received" });
//     }
//   });

//   msgArr = messagesToMarkReceived.map((m) => ObjectId(m._id));

//   receivedRes = await Message.updateMany(
//     { _id: { $in: msgArr } },
//     { $set: { status: "received" } }
//   );

//   //emiting received status to others
//   let otherSocketIds = [];
//   otherUsers.forEach((a) => {
//     let sIds = userIdToSocketId(a);
//     if (sIds && sIds.length > 0) {
//       otherSocketIds = otherSocketIds.concat(sIds);
//     }
//   });

//   eventEmitters.messageStatus(otherSocketIds, {
//     messages: messagesToMarkReceived,
//     // chatId: id,
//   });
// };

// exports.getChatsForUser = async (req, res, next) => {
//   const { userId } = req;
//   let chats = [];

//   const chatsPipe = [
//     {
//       $match: {
//         users: {
//           $in: [new ObjectId(userId)],
//         },
//       },
//     },
//     {
//       $project: {
//         otherUser: {
//           $filter: {
//             input: "$users",
//             as: "item",
//             cond: {
//               $ne: ["$$item", new ObjectId(userId)],
//             },
//           },
//         },
//         messages: 1,
//         updatedAt: 1,
//         addType: 1,
//         addId: 1,
//       },
//     },
//     {
//       $project: {
//         partner: {
//           $first: "$otherUser",
//         },
//         lastMessage: {
//           $last: "$messages",
//         },
//         updatedAt: 1,
//         addType: 1,
//         addId: 1,
//       },
//     },
//     {
//       $lookup: {
//         from: "users",
//         localField: "partner",
//         foreignField: "_id",
//         as: "partner",
//       },
//     },
//     {
//       $unwind: {
//         path: "$partner",
//       },
//     },
//     {
//       $lookup: {
//         from: "messages",
//         localField: "lastMessage",
//         foreignField: "_id",
//         as: "lastMessage",
//       },
//     },
//     {
//       $unwind: {
//         path: "$lastMessage",
//         preserveNullAndEmptyArrays: true,
//       },
//     },
//     {
//       $addFields: {
//         lastMessage: { $ifNull: ["$lastMessage", null] },
//       },
//     },
//     {
//       $project: {
//         _id: 0,
//         chatId: "$_id",
//         partner: {
//           profilePic: 1,
//           name: 1,
//           userName: 1,
//         },
//         lastMessage: 1,
//         updatedAt: 1,
//         hasNewMessage: {
//           $cond: {
//             if: {
//               $and: [
//                 {
//                   $ne: [ObjectId(userId), "$lastMessage.sender"],
//                 },
//                 {
//                   $eq: ["$lastMessage.received", false],
//                 },
//               ],
//             },
//             then: true,
//             else: false,
//           },
//         },
//         addType: 1,
//         addId: 1,
//       },
//     },
//     {
//       $sort: {
//         updatedAt: -1,
//       },
//     },
//   ];

//   try {
//     chats = await ChatRoom.aggregate([...chatsPipe]);
//   } catch (err) {
//     console.log(err);
//     const error = new HttpError(
//       req,
//       new Error().stack.split("at ")[1].trim(),
//       "Could not get chats.",
//       500
//     );
//     return next(error);
//   }

  
  

//   res.status(200).json({
//     status: true,
//     chats,
//     userId,
//   });
// };

// exports.checkChatExistsForUser = async (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     const Err = errors.array();
//     const { Errors, message } = ErrorMessageHandler(Err);
//     return res
//       .status(422)
//       .json({ status: false, data: {}, errors: Errors, message });
//   }

//   const { member, addId, addType } = req.body;
//   const { userId } = req;

//   let roomUsers = [ObjectId(member), ObjectId(userId)];

//   let isChatExists;

//   try {
//     isChatExists = await ChatRoom.findOne({
//       users: { $all: roomUsers },
//       addId,
//       addType,
//     });
//     if (!isChatExists || isChatExists.users.length !== roomUsers.length) {
//       isChatExists = false;
//     }
//   } catch (err) {
//     const error = new HttpError(
//       req,
//       new Error().stack.split("at ")[1].trim(),
//       "Something went wrong.",
//       500
//     );
//     return next(error);
//   }

//   res.status(200).json({
//     isChatExists: !!isChatExists,
//     chatId: isChatExists._id,
//   });
// };

// exports.createChat = async (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     const Err = errors.array();
//     const { Errors, message } = ErrorMessageHandler(Err);
//     return res
//       .status(422)
//       .json({ status: false, data: {}, errors: Errors, message });
//   }

//   const { member, members, addType, addId } = req.body;
//   const { userId } = req;

//   // room users -----
//   let roomUsers = [ObjectId(userId)];
//   if (member) {
//     roomUsers = roomUsers.concat([ObjectId(member)]);
//   }
//   if (members) {
//     roomUsers = roomUsers.concat(members.map((val) => ObjectId(val)));
//   }
//   roomUsers = [...new Set(roomUsers)];  

//   // getting chat ----
//   let existingChat;
//   try {
//     existingChat = await ChatRoom.findOne({
//       users: { $all: roomUsers },
//       addId,
//       addType,
//     });
//     if (existingChat && existingChat.users.length == roomUsers.length) {
//       const error = new HttpError(
//         req,
//         new Error().stack.split("at ")[1].trim(),
//         "Chat already exists.",
//         422
//       );
//       return next(error);
//     }
//   } catch (err) {
//     const error = new HttpError(
//       req,
//       new Error().stack.split("at ")[1].trim(),
//       "Something went wrong.",
//       500
//     );
//     return next(error);
//   }

//   // creating new -----
//   let newChat = new ChatRoom({
//     users: roomUsers,
//     addId,
//     addType,
//   });

//   try {
//     await newChat.save();
//   } catch (err) {
//     const error = new HttpError(
//       req,
//       new Error().stack.split("at ")[1].trim(),
//       "Could not create chat.",
//       500
//     );
//     return next(error);
//   }

//   res.status(200).json({
//     status: true,
//     message: "Chat created Successfully",
//     chatId: newChat._id,
//   });
// };

// exports.getChatForUser = async (req, res, next) => {
//   const { id } = req.params;
//   let { last } = req.query;
//   const { userId } = req;

//   const mpr = 20;

//   let chat;

//   last = last ? ObjectId(last) : "notGiven";

//   let variablePart = [];
//   if (last === "notGiven") {
//     variablePart = [
//       {
//         $match: {
//           _id: new ObjectId(id),
//           users: {
//             $in: [new ObjectId(userId)],
//           },
//         },
//       },
//       {
//         $addFields: {
//           newMessages: {
//             $cond: {
//               if: {
//                 $gt: [{ $size: "$messages" }, mpr],
//               },
//               then: { $slice: ["$messages", 0 - mpr] },
//               else: "$messages",
//             },
//           },
//           totalMessages: {
//             $size: "$messages",
//           },
//         },
//       },
//     ];
//   } else {
//     if (
//       last !== "notGiven" &&
//       !mongoose.Types.ObjectId.isValid(last.toString())
//     ) {
//       const error = new HttpError(
//         req,
//         new Error().stack.split("at ")[1].trim(),
//         "Invalid id.",
//         500
//       );
//       return next(error);
//     }

//     variablePart = [
//       {
//         $match: {
//           _id: new ObjectId(id),
//           users: {
//             $in: [new ObjectId(userId)],
//           },
//         },
//       },
//       {
//         $addFields: {
//           index: {
//             $indexOfArray: ["$messages", last],
//           },
//           totalMessages: {
//             $size: "$messages",
//           },
//         },
//       },
//       {
//         $addFields: {
//           newMessages: {
//             $cond: {
//               if: {
//                 $gte: ["$index", mpr],
//               },
//               then: {
//                 $slice: [
//                   "$messages",
//                   {
//                     $subtract: ["$index", mpr],
//                   },
//                   mpr,
//                 ],
//               },
//               else: {
//                 $slice: ["$messages", 0, "$index"],
//               },
//             },
//           },
//         },
//       },
//     ];
//   }

//   const chatPipe = [
//     ...variablePart,
//     {
//       $project: {
//         messages: "$newMessages",
//         _id: 0,
//         index: 1,
//         totalMessages: 1,
//         users: 1,
//       },
//     },
//     {
//       $unwind: {
//         path: "$messages",
//         includeArrayIndex: "string",
//       },
//     },
//     {
//       $addFields: {
//         sub1: {
//           $subtract: [mpr, "$string"],
//         },
//       },
//     },
//     {
//       $addFields: {
//         ind: {
//           $subtract: ["$index", "$sub1"],
//         },
//       },
//     },
//     {
//       $addFields: {
//         ind2: {
//           $cond: {
//             if: {
//               $gte: ["$index", mpr],
//             },
//             then: {
//               $subtract: ["$index", "$sub1"],
//             },
//             else: "$string",
//           },
//         },
//       },
//     },
//     {
//       $project: {
//         msgNumber: {
//           $add: ["$ind2", 1],
//         },
//         messages: 1,
//         totalMessages: 1,
//         users: 1,
//       },
//     },
//     {
//       $lookup: {
//         from: "messages",
//         localField: "messages",
//         foreignField: "_id",
//         as: "message",
//       },
//     },
//     {
//       $unwind: {
//         path: "$message",
//       },
//     },
//     {
//       $lookup: {
//         from: "messages",
//         localField: "message.replyOf",
//         foreignField: "_id",
//         as: "replyOf",
//       },
//     },
//     {
//       $unwind: {
//         path: "$replyOf",
//         preserveNullAndEmptyArrays: true,
//       },
//     },
//     {
//       $addFields: {
//         reply: {
//           _id: "$replyOf._id",
//           text: "$replyOf.text",
//           file: "$replyOf.file",
//           status: "$replyOf.status",
//         },
//       },
//     },
//     {
//       $lookup: {
//         from: "users",
//         localField: "message.sender",
//         foreignField: "_id",
//         as: "sender",
//       },
//     },
//     {
//       $unwind: {
//         path: "$sender",
//       },
//     },
//     {
//       $project: {
//         message: {
//           _id: 1,
//           text: 1,
//           file: 1,
//           createdAt: 1,
//           updatedAt: 1,
//           status: 1,
//           receiver: 1,
//           isReply: 1,
//           replyOf: {
//             $ifNull: ["$reply", null],
//           },
//         },
//         sender: {
//           _id: 1,
//           name: 1,
//           userId: 1,
//           profilePic: 1,
//         },
//         msgNumber: 1,
//         totalMessages: 1,
//         users: 1,
//       },
//     },
//   ];  

//   try {
//     chat = await ChatRoom.aggregate([...chatPipe]);
//   } catch (err) {
//     console.log(err);
//     const error = new HttpError(
//       req,
//       new Error().stack.split("at ")[1].trim(),
//       "Could not get chat.",
//       500
//     );
//     return next(error);
//   }

//   // marking seen true --------
//   let messagesToMarkSeen = [];
//   chat = chat.map((c) => {
//     if (
//       c.message.receiver.toString() === userId.toString() &&
//       c.message.status !== "seen"
//     ) {
//       messagesToMarkSeen.push({ _id: c.message._id, status: "seen" });
//       return {
//         ...c,
//         message: {
//           ...c.message,
//           status: "seen",
//         },
//       };
//     } else {
//       return c;
//     }
//   });

//   let markSeenStatus = await markSeen(messagesToMarkSeen);

//   //emiting seen status to others
//   let otherUsers = [];
//   chat.forEach((a) => {
//     if (markSeenStatus && a.sender._id.toString() !== userId) {
//       otherUsers.push(a.sender._id.toString());
//     }
//   });
//   otherUsers = [...new Set(otherUsers)];

//   let otherSocketIds = [];
//   otherUsers.forEach((a) => {
//     let sIds = userIdToSocketId(a);
//     if (sIds && sIds.length > 0) {
//       otherSocketIds = otherSocketIds.concat(sIds);
//     }
//   });

//   eventEmitters.messageStatus(otherSocketIds, {
//     messages: messagesToMarkSeen,
//     // chatId: id,
//   });
//   //---------------------------------

//   // blurring messages --------------------------
//   let receiverData;

//   try {
//     receiverData = await getReceiverData(userId);
//   } catch (err) {
//     console.log(err);
//     const error = new HttpError(
//       req,
//       new Error().stack.split("at ")[1].trim(),
//       "Could not get chat.",
//       500
//     );
//     return next(error);
//   }

//   let totalMessages = chat[0]?.totalMessages || 0;

//   chat = getFilteredChat(chat, totalMessages, receiverData);
//   // --------------------------------------------

//   res.status(200).json({
//     status: true,
//     chat,
//     chatId: id,
//     last: chat[0]?.message?._id || null,
//     totalMessages,
//     messagePerRequest: mpr,
//   });
// };

// exports.createMessage = async (data) => {
//   const { chatId, text, file, sender, replyOf } = data;

//   console.log("data", data);

//   let chat, message;

//   // chat data ----------
//   try {
//     chat = await ChatRoom.findOne({ _id: chatId });
//   } catch (err) {
//     console.log(err);
//     eventEmitters.error([sender], {
//       message: "Something went wrong while sending message.",
//     });
//     return;
//   }
//   let receiverId = chat.users.find((v) => v.toString() !== sender);

//   // creating new message ---
//   let extras = {};
//   if (replyOf && mongoose.Types.ObjectId.isValid(replyOf)) {
//     extras.replyOf = replyOf;
//     extras.isReply = true;
//   }
//   let newMessage = new Message({
//     chatId,
//     sender,
//     receiver: receiverId,
//     text,
//     file,
//     ...extras,
//   });

//   // if any socket id exists -> user is live
//   let senderSocketIds = userIdToSocketId(sender); //array
//   let receiverSocketIds = userIdToSocketId(receiverId.toString()); //array

//   if (receiverSocketIds && receiverSocketIds.length > 0) {
//     newMessage.status = "received";
//   }

//   // if receiver is active on chat
//   let isActive = isActiveOnChat(receiverSocketIds, chatId);
//   if (isActive) {
//     newMessage.status = "seen";
//   }

//   // saving --
//   try {
//     message = await newMessage.save();
//   } catch (err) {
//     console.log(err);
//     eventEmitters.error([sender], {
//       message: "Something went wrong while sending message.",
//     });
//     return;
//   }

//   //  updating in chatroom ----
//   try {
//     chat = await ChatRoom.findByIdAndUpdate(
//       chatId,
//       {
//         $push: { messages: ObjectId(newMessage._id) },
//       },
//       { new: true }
//     );
//   } catch (err) {
//     console.log(err);
//     eventEmitters.error([sender], {
//       message: "Something went wrong while sending message.",
//     });
//     return;
//   }

//   let totalMessages = chat.messages.length;
//   let receiverData, senderData;

//   try {
//     receiverData = await getReceiverData(receiverId);
//     senderData = await User.findOne({ _id: sender });
//   } catch (err) {
//     console.log(err);
//     const error = new HttpError(
//       req,
//       new Error().stack.split("at ")[1].trim(),
//       "Could not get chat.",
//       500
//     );
//     return next(error);
//   }

//   // getting replyOf data
//   let reply = {}
//   if (message.isReply) {
//     reply = await Message.findOne({ _id: message.replyOf }).lean();    
//     reply = {
//       _id: reply._id,
//       text: reply.text,
//       file: reply.file,
//       status: reply.status,
//     };
//   }

//   // filtered message will be send if message count according to subscription plan is over ----
//   let unfilteredMessage = {
//     chatId,
//     message: {
//       _id: message._id,
//       text: message.text,
//       file: message.file,
//       createdAt: message.createdAt,
//       updatedAt: message.updatedAt,
//       status: message.status,
//       isReply: message.isReply,
//       replyOf: reply,
//     },
//     sender: {
//       _id: senderData._id,
//       name: senderData.name,
//       userName: senderData.userName,
//       profilePic: senderData.profilePic,
//     },
//     isBlurred: false,
//   };

//   chat = getFilteredChat(
//     [{ ...unfilteredMessage }],
//     totalMessages,
//     receiverData
//   );

//   let dataToSend = [
//     {
//       sendTo: receiverSocketIds,
//       data: { ...chat[0], chatId },
//     },
//     {
//       sendTo: senderSocketIds,
//       data: unfilteredMessage,
//     },
//   ];  

//   eventEmitters.chatReply(dataToSend);

  
// };
