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
    "uploads/avatar/a1.JPG",
    "uploads/avatar/a2.JPG",
    "uploads/avatar/a3.JPG",
    "uploads/avatar/a4.JPG",
    "uploads/avatar/a5.JPG"
  ] 

  res.status(200).json({
    status: true,
    avatars
  })
};







