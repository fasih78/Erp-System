const validator = require('validator');




const emailValidation = (req, res, next) => {
  const { email } = req.body;
  const trimmedEmail = email.trim();
  
  const isEmailValid = validator.isEmail(trimmedEmail);

  if (!isEmailValid) {
    return res.status(400).json({ message: "Invalid email address" });
  }

  next();
};

module.exports = emailValidation;
