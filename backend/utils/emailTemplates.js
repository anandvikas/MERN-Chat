exports.emailVerificationOtp = {
    subject : "Email Verification (MERN Chat App)",
    body :  `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
    <div style="margin:50px auto;width:70%;padding:20px 0">
      <div style="border-bottom:1px solid #eee">
        <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Welcome</a>
      </div>
      <p style="font-size:1.1em">Hi, {{USER_NAME}}</p>
      <p>Please Use the following OTP to complete your Sign Up procedures.</p>
      <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">{{OTP}}</h2>
      
      <hr style="border:none;border-top:1px solid #eee" />
      <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
        <p>Thank You</p>    
      </div>
    </div>
    </div>`
}

exports.forgetPasswordLink = {
  subject : "Forget Password (MERN Chat App)",
  body :  `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
  <div style="margin:50px auto;width:70%;padding:20px 0">
    <div style="border-bottom:1px solid #eee">
      <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Welcome</a>
    </div>
    <p style="font-size:1.1em">Hi, {{USER_NAME}}</p>
    <p>Click on the following button to reset your password.</p>
    <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;"><a href={{LINK}} style="color:black" target="__blank">Click Here</a></h2>
    
    <hr style="border:none;border-top:1px solid #eee" />
    <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
      <p>Thank You</p>    
    </div>
  </div>
  </div>`
}