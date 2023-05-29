const express = require("express");
const router = express.Router();
const Controller = require("../controllers/avatar");

//used by client
router.get("/",
    Controller.getAvatars
);

module.exports = router;
