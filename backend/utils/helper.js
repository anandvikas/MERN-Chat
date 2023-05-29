const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");


const ErrorMessageHandler = (Err = []) => {
  const Errors = {};
  let message = "";
  Err.forEach((el, index) => {
    if (!Errors[el.param]) {
      Errors[el.param] = [el.msg];
      message += `${el.msg} ${Err.length - 1 !== index ? ", " : ""}`;
    }
  });
  return { Errors, message };
};

const emailNotification = (to, subject, html, mailDataObj = {}) => {
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.MAIL_FROM,
    to,
    subject,
    html,
    attachDataUrls: true,
    ...mailDataObj,
  };

  let isError = false;

  transporter.sendMail(mailOptions, async (err, info) => {
    
    if (err) {
      console.log("Error while sending email", err);
      isError = true;
    } 
    // if (isError) {
    //   return false;
    // }  
    
    // return true;
  });

  return !isError
};

const fileUpload = (file, folderName) => {
  if (file == undefined) {
    return "";
  } else {
    var img = file;
    var fileName = img.name.split(".");
    var ext = fileName.pop();
    var splitName = fileName.join("");
    var uniqueName = (splitName + "-" + Date.now() + "." + ext)
      .split(" ")
      .join("_");
    var filePath = "uploads/images/" + folderName + "/" + uniqueName;

    img.mv(filePath, (err) => {
      if (err) {
        console.log("err", err);
        return false;
      }
    });
    return filePath;
  }
};

const hashPassword = async (password) => {
  let hashedPassword = await bcrypt.hash(password, 10);
  return hashedPassword;
};

const comparePassword = async (passRecieved, passInDB) => {
  return await bcrypt.compare(passRecieved, passInDB);
};

const generateUniqueToken = async (data, expire = "365d") => {
  const token = await  jwt.sign(data, process.env.JWT, { expiresIn: expire });
  return token;
};

const generateToken = async (id, isAdmin) => {
  const token = jwt.sign({ _id, isAdmin }, process.env.JWT);
  return token;
};

const decodeToken = async (token) => {
  const data = await jwt.verify(token, process.env.JWT);
  return data;
};

const HttpErrorResponse = (message, data = {}) => {
  return {
    status: false,
    message,
    data
  };
};

const getDateXDaysAgo = (numOfWeeks, date = new Date()) => {
  console.log(numOfWeeks);

  if (numOfWeeks === "start") {
    return new Date("1970-01-01");
  }
  if (numOfWeeks === "end") {
    return new Date();
  }

  numOfDays = +numOfWeeks * 7;

  const daysAgo = new Date(date.getTime());
  daysAgo.setDate(date.getDate() - numOfDays);
  return daysAgo;
};

const generateOtp = () => {
  return Math.ceil(Math.random() * 1000) + 1000;
}

module.exports = {
  fileUpload,
  ErrorMessageHandler,
  hashPassword,
  comparePassword,
  generateUniqueToken,
  decodeToken,
  HttpErrorResponse,
  getDateXDaysAgo,
  emailNotification,
  generateToken,
  generateOtp
};
