const express = require("express");
const { check } = require("express-validator");
const router = express.Router();

const userController = require("../controllers/user");
const userAuthMiddleware = require("../middleware/userAuth");

//AUTH ROUTES >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

router.post("/signup",
  [
    check("password")
      .notEmpty()
      .withMessage("Password is required.")
      .isLength({ min: 8 })
      .withMessage(
        "Password must be of 8 characters long."
      ),
    check("email").notEmpty().withMessage("Email is required").matches(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/).withMessage("Please provide a valid email address."),
    check("avatar").notEmpty().withMessage("Avatar is required."),
    check("userName")
      .notEmpty()
      .withMessage("User name is required.")
  ],
  userController.signup
);

router.post("/validate-token",
  userController.validateVerificationToken
);

router.post("/resend-otp",
  userController.resendVerificationOtp
);

router.post("/verify-email",
  userController.validateOtp
);

router.post("/forget-password",
  [
    check("email").notEmpty().withMessage("Email name is required."),
  ],
  userController.forgetPassword
);

router.post("/validate-forget-password-token",
  userController.validateForgetPasswordToken
);

router.post("/reset-password",
  [
    check("password").notEmpty().withMessage("Password name is required."),
  ],
  userController.resetPassword
);

router.post("/login",
  [
    check("loginId").notEmpty().withMessage("User name or email is required."),
    check("password").notEmpty().withMessage("Password is required."),
  ],
  userController.login
);

router.post("/validate-auth", userController.validateAuthToken);

router.post("/update-profile", userAuthMiddleware, userController.updateProfile);


//CHAT ROUTES >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

router.get("/search-users", userAuthMiddleware, userController.searchUsers);

module.exports = router;
