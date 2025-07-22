const jwt = require('jsonwebtoken');

const JWT_SECRET = 'mysecretkey';

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentication failed: No token provided' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userData = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed: Invalid token', error: error.message });
  }
};
