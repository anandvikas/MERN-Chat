// const { validationResult } = require("express-validator");
// const User = require("../models/user");

const {  
  ErrorMessageHandler,
  comparePassword,
  HttpErrorResponse,  
  generateToken
} = require("../utils/helper");


exports.getAvatars = async (req, res, next) => { 

  let avatars = [
    "uploads/avatar/a1.jpg",
    "uploads/avatar/a2.jpg",
    "uploads/avatar/a3.jpg",
    "uploads/avatar/a4.jpg",
    "uploads/avatar/a5.jpg"
  ] 

  res.status(200).json({
    status: true,
    avatars
  })
};







