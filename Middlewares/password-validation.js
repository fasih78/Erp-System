// passwordValidationMiddleware.js

const passwordValidator = require('password-validator');

const passwordValidation = (req, res, next) => {
  const { password } = req.body;

  // Create a schema for password validation
  const schema = new passwordValidator();

  // Add password rules
  schema
    .is().min(8)                                    // Minimum length 8
    .has().uppercase()                              // Must have at least one uppercase letter
    .has().lowercase()                              // Must have at least one lowercase letter
    .has().digits()                                 // Must have at least one digit
    .has().symbols();                               // Must have at least one special character

  // Validate password against the schema
  const isValid = schema.validate(password);

  // If password is not valid, send a 400 response with error messages
  if (!isValid) {
    const errors = schema.validate(password, { list: true });
    return res.status(400).json({ message: "Password validation failed", errors });
  }

  // If password passes validation, proceed to the next middleware
  next();
};

module.exports = passwordValidation;
