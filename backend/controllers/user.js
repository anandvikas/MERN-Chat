const { validationResult } = require("express-validator");
const User = require("../models/user");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const moment = require("moment");

const {
  ErrorMessageHandler,
  comparePassword,
  HttpErrorResponse,
  generateToken,
  emailNotification,
  decodeToken,
  generateOtp,
  generateUniqueToken,
  hashPassword
} = require("../utils/helper");

const { emailVerificationOtp, forgetPasswordLink } = require("../utils/emailTemplates")

// AUTH CONTROLLERS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const Err = errors.array();
    const { Errors, message } = ErrorMessageHandler(Err);
    return res
      .status(422)
      .json({ status: false, data: {}, errors: Errors, message });
  }

  const {
    userName,
    email,
    password,
    avatar
  } = req.body;

  let newUser;

  let isExists;
  try {
    isExists = await User.findOne({ $or: [{ email }, { userName }] });
    if (isExists) {
      return res.status(402).json(HttpErrorResponse("Username of email already exists."))
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json(HttpErrorResponse("Somethig went wrong while creating your account."));
  }

  let hashedPassword = await hashPassword(password)
  let dateOfDeletion = moment(moment(), "DD-MM-YYYY").add(15, 'days');
  // saving -----
  newUser = new User({
    userName,
    email,
    password: hashedPassword,
    avatar,
    dateOfDeletion
  });

  let otp = generateOtp();
  newUser.verificationOtp = otp;

  try {
    await newUser.save();
  } catch (err) {
    console.log(err);
    return res.status(500).json(HttpErrorResponse("Something went wrong while creating your account."))
  }

  let { body, subject } = emailVerificationOtp;

  body = body.replace("{{OTP}}", otp);
  body = body.replace("{{USER_NAME}}", userName)

  let emailStatus = await emailNotification(email, subject, body)

  if (!emailStatus) {
    console.log("emailStatus", emailStatus)
    return res.status(500).json(HttpErrorResponse("Something went wrong while creating your account."))
  }

  res.status(200).json({
    status: true,
    message: "Account created successfully.",
    token: await generateUniqueToken({ id: newUser._id })
  })
};

exports.validateVerificationToken = async (req, res, next) => {

  const {
    token
  } = req.body;

  let isExists;

  try {
    let tokenData = await decodeToken(token)
    isExists = await User.findOne({ _id: tokenData.id });
    if (!isExists || !isExists.verificationOtp) {
      return res.status(200).json({ status: false })
    }
  } catch (err) {
    console.log(err)
    return res.status(200).json({ status: false });
  }

  res.status(200).json({
    status: true,
    email: isExists.email
  })
};

exports.resendVerificationOtp = async (req, res, next) => {

  const {
    token
  } = req.body;

  let tokenData, user;

  try {
    tokenData = await decodeToken(token)
    user = await User.findOne({ _id: tokenData.id });
    if (!user || !user.verificationOtp) {
      return res.status(402).json(HttpErrorResponse("Invalid user."))
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json(HttpErrorResponse("Something went wrong while resending the OTP."))
  }

  const otp = generateOtp()

  try {
    await User.updateOne({ _id: tokenData.id }, { $set: { verificationOtp: otp } });
  } catch (err) {
    console.log(err)
    return res.status(500).json(HttpErrorResponse("Something went wrong while resending the OTP."))
  }

  let { body, subject } = emailVerificationOtp;
  body = body.replace("{{OTP}}", otp);
  body = body.replace("{{USER_NAME}}", user.userName)

  let emailStatus = await emailNotification(user.email, subject, body)

  // if (!emailStatus) {
  //   console.log("emailStatus", emailStatus)
  //   return res.status(500).json(HttpErrorResponse("Something went wrong while resending the OTP."))
  // }

  res.status(200).json({
    status: true,
    message: "OTP resend successfully.",
    token: await generateUniqueToken({ id: user._id })
  })
};

exports.validateOtp = async (req, res, next) => {

  const {
    token,
    otp
  } = req.body;

  let tokenData, user;

  try {
    tokenData = await decodeToken(token)
    user = await User.findOne({ _id: tokenData.id });
    if (!user || !user.verificationOtp) {
      return res.status(402).json(HttpErrorResponse("Invalid user."))
    }
    if (user.verificationOtp != otp) {
      return res.status(402).json(HttpErrorResponse("Incorrect OTP !"))
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json(HttpErrorResponse("Something went wrong while verifying the OTP."))
  }

  try {
    await User.updateOne({ _id: tokenData.id }, { $set: { emailVerified: true }, $unset: { verificationOtp: 1 } });
  } catch (err) {
    console.log(err)
    return res.status(500).json(HttpErrorResponse("Something went wrong while resending the OTP."))
  }

  res.status(200).json({
    status: true,
    message: "OTP verified successfully.",
    token: await generateUniqueToken({ id: user._id }),
    user: {
      userName: user.userName,
      email: user.email,
      _id: user._id,
      avatar: user.avatar
    }
  })
};

exports.forgetPassword = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const Err = errors.array();
    const { Errors, message } = ErrorMessageHandler(Err);
    return res
      .status(422)
      .json({ status: false, data: {}, errors: Errors, message });
  }

  const {
    email,
  } = req.body;

  let user;

  try {
    user = await User.findOne({ email });
    if (!user) {
      return res.status(402).json(HttpErrorResponse("Invalid user."))
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json(HttpErrorResponse("Something went wrong while sending reset password link."))
  }

  let forgrtPasswordToken = await generateUniqueToken({ id: user._id, email: user.email });
  let forgetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password/${forgrtPasswordToken}`

  try {
    await User.updateOne({ _id: user.id }, { $set: { forgrtPasswordToken } });
  } catch (err) {
    console.log(err)
    return res.status(500).json(HttpErrorResponse("Something went wrong while sending reset password link."))
  }

  let { subject, body } = forgetPasswordLink;

  body = body.replace("{{LINK}}", forgetPasswordUrl);
  body = body.replace("{{USER_NAME}}", user.userName)

  let emailStatus = await emailNotification(user.email, subject, body)

  if (!emailStatus) {
    console.log("emailStatus", emailStatus)
    return res.status(500).json(HttpErrorResponse("Something went wrong while sending reset password link."))
  }

  res.status(200).json({
    status: true,
    message: "Forget password link is sent to your email.",
  })
};

exports.validateForgetPasswordToken = async (req, res, next) => {

  const {
    token
  } = req.body;

  let isExists;

  try {
    let tokenData = await decodeToken(token)
    isExists = await User.findOne({ _id: tokenData.id, email: tokenData.email });
    if (!isExists || !isExists.forgrtPasswordToken || isExists.forgrtPasswordToken != token) {
      return res.status(200).json({ status: false })
    }
  } catch (err) {
    console.log(err)
    return res.status(200).json({ status: false });
  }

  res.status(200).json({
    status: true,
    email: isExists.email
  })
};

exports.resetPassword = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const Err = errors.array();
    const { Errors, message } = ErrorMessageHandler(Err);
    return res
      .status(422)
      .json({ status: false, data: {}, errors: Errors, message });
  }

  const {
    token,
    password
  } = req.body;

  let tokenData, user;

  try {
    tokenData = await decodeToken(token)
    user = await User.findOne({ _id: tokenData.id });
    if (!user || !user.forgrtPasswordToken || user.forgrtPasswordToken != token) {
      return res.status(402).json(HttpErrorResponse("Invalid user."))
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json(HttpErrorResponse("Something went wrong while updating your password."))
  }

  try {
    let hashedPassword = await hashPassword(password)
    await User.updateOne({ _id: tokenData.id }, { $set: { password: hashedPassword }, $unset: { forgrtPasswordToken: 1 } });
  } catch (err) {
    console.log(err)
    return res.status(500).json(HttpErrorResponse("Something went wrong while updating your password."))
  }

  res.status(200).json({
    status: true,
    message: "Password changed successfully.",
  })
};

exports.login = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const Err = errors.array();
    const { Errors, message } = ErrorMessageHandler(Err);
    return res
      .status(422)
      .json({ status: false, data: {}, errors: Errors, message });
  }

  let { loginId, password } = req.body;
  let userRes, isPassMatched, token;

  try {
    userRes = await User.findOne({ $or: [{ userName: loginId }, { email: loginId }] });
    if (!userRes) {
      return res.status(402).json(HttpErrorResponse("Invalid credentials."));
    }

    isPassMatched = await comparePassword(password, userRes.password);
    if (!isPassMatched) {
      return res.status(402).json(HttpErrorResponse("Invalid credentials."));
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json(HttpErrorResponse("Unable to login."));
  }

  token = await generateUniqueToken({ id: userRes._id, email: userRes.email });

  res.status(200).json({
    status: true,
    user: {
      userName: userRes.userName,
      _id: userRes._id,
      avatar: userRes.avatar,
      email: userRes.email
    },
    token,
    message: "Logged In Successfully.",
  });
};

exports.validateAuthToken = async (req, res, next) => {

  let { token } = req.body;
  let userData, tokenData;

  try {
    tokenData = await decodeToken(token)
    userData = await User.findOne({ _id: tokenData.id });
    if (!userData) {
      return res.status(200).json({ status: false });
    }
  } catch (err) {
    return res.status(200).json({ status: false });
  }

  res.status(200).json({
    status: true,
    user: {
      userName: userData.userName,
      _id: userData._id,
      avatar: userData.avatar,
      email: userData.email
    },
    token,
    message: "Logged In Successfully.",
  });
};

exports.updateProfile = async (req, res, next) => {
  let { userName, avatar } = req.body;
  const { userId } = req
  let updatedUser;

  try {
    updatedUser = await User.findByIdAndUpdate(userId, { $set: { userName, avatar } }, { new: true });
  } catch (err) {
    return res.status(500).json(HttpErrorResponse("Somthing went wrong while updating the data."));
  }

  res.status(200).json({
    status: true,
    updated: {
      userName: updatedUser.userName,
      avatar: updatedUser.avatar,
    },
    message: "Profile Updated Successfully.",
  });
};

// CHAT CONTROLLERS >>>>>>>>>>>>>>>>>>>>>>>>>>>

exports.searchUsers = async (req, res) => {
  let { query } = req.query
  const { userId } = req;
  query = query ?? ""

  let users;

  try {
    users = await User.aggregate([
      {
        '$match': {
          '$or': [
            {
              'userName': {
                '$regex': query,
                '$options': 'i'
              }
            },
            {
              'email': {
                '$regex': query,
                '$options': 'i'
              }
            }
          ],
          _id: { $ne: ObjectId(userId) }
        }
      },
      {
        $project: {
          userName: 1,
          email: 1,
          avatar: 1
        }
      }
    ])
  } catch (err) {
    // console.log(err)
    return res.status(500).json(HttpErrorResponse("Could not fetch users."));
  }

  res.status(200).json({
    status: true,
    message: "Users fetched successfully.",
    users
  })
}





