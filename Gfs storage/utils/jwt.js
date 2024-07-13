const jwt = require('jsonwebtoken');
const secret = '65DPkH9823'; // Use environment variables in a real application

// Generate a JWT token
const generateToken = (user) => {
  return jwt.sign({ id: user._id, companyCode: user.companyCode }, secret, {
    expiresIn: '2h',
  });
};

// Verify a JWT token
const verifyToken = (token) => {
  return jwt.verify(token, secret);
};

module.exports = { generateToken, verifyToken };
