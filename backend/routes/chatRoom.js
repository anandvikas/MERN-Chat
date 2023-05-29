const express = require("express");
const router = express.Router();
const upload = require("../utils/fileUpload");

const controller = require("../controllers/chatRoom");
const userAuthMiddleware = require("../middleware/userAuth");

router.post("/check-exists",
  userAuthMiddleware,
  controller.checkChatExists
);

router.post("/create",
  userAuthMiddleware,
  controller.createChat
);

router.post("/create-message",
  userAuthMiddleware,
  upload.fields([{ name: "fileAttachments", maxCount: 1 }]),
  controller.createMessage
);

router.get("/my-chats",
  userAuthMiddleware,
  controller.getMyChats
);

router.post("/chat-messages",
  userAuthMiddleware,
  controller.getMessages
);


module.exports = router;
