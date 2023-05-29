const User = require("../models/user");

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

module.exports = async (req, res, next) => {
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    return res.status(401).json(HttpErrorResponse("Authentication Failed #1."));    
  }

  const token = authHeader.split(" ")[1];

  if (!token || token === "null" || token === null) {
    return res.status(401).json(HttpErrorResponse("Authentication failed #2."));
  }

  let decodedToken;

  try {
    decodedToken = await decodeToken(token);
  } catch (err) {
    return res.status(401).json(HttpErrorResponse("Please login again."));    
  }

  if (!decodedToken) {
    return res.status(401).json(HttpErrorResponse("Authentication failed #3."));
  }

  let user;
  try {
    user = await User.findById(decodedToken.id);

    if (
      !user 
      // ||
      // user.isActive == false ||
      // user.isDeleted ||
      // user.isAccountDisabled
    ) {
      return res.status(401).json(HttpErrorResponse("Authentication failed #4."));
    }

  } catch (err) {
    return res.status(401).json(HttpErrorResponse("Authentication failed #5."));
  }

  req.userId = decodedToken.id;
  req.userData = user;
  req.token = token

  next();
};
