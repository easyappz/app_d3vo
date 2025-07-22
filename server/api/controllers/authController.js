const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');

const JWT_SECRET = 'mysecretkey';

exports.register = async (req, res) => {
  try {
    const { email, password, username, gender, age } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ email, password: hashedPassword, username, gender, age, points: 0 });
    await user.save();
    const token = jwt.sign({ userId: user._id, email }, JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        gender: user.gender,
        age: user.age,
        points: user.points
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id, email }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        gender: user.gender,
        age: user.age,
        points: user.points
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const resetToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000;
    await user.save();
    res.status(200).json({ message: 'Password reset token generated', resetToken });
  } catch (error) {
    res.status(500).json({ message: 'Password reset failed', error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    const decoded = jwt.verify(resetToken, JWT_SECRET);
    const user = await User.findOne({ _id: decoded.userId, resetToken, resetTokenExpiry: { $gt: Date.now() } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();
    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Password reset failed', error: error.message });
  }
};
