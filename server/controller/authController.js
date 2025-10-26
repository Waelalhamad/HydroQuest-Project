/**
 * Authentication Controller
 *
 * Handles user authentication, registration, and session management
 * Uses Passport.js for authentication strategy and bcrypt for password hashing
 *
 * @module controller/authController
 */

const User = require('../model/userModel');
const bcrypt = require('bcrypt');

/**
 * Render login page
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
exports.loginPage = (req, res) => {
  res.render('./security/login', {
    error: req.flash('error'),
    success: req.flash('success')
  });
};

/**
 * Render registration page
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
exports.registerPage = (req, res) => {
  res.render('./security/signup', {
    error: req.flash('error'),
    success: req.flash('success')
  });
};

/**
 * Register a new user
 *
 * Validates user input, hashes password with bcrypt (salt rounds: 12)
 * and creates new user account in MongoDB
 *
 * @async
 * @param {Request} req - Express request object with user data in body
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @example
 * POST /auth/register
 * Body: {
 *   firstName: "John",
 *   lastName: "Doe",
 *   email: "john@example.com",
 *   password: "SecurePass123",
 *   confirmPassword: "SecurePass123",
 *   DOB: "1990-01-01",
 *   gender: "male"
 * }
 */
exports.register = async (req, res) => {
  const body = req.body;

  try {
    // Validate password match
    if (body.password !== body.confirmPassword) {
      req.flash('error', 'Passwords do not match');
      return res.redirect('/auth/signup');
    }

    // Validate password strength (minimum 6 characters)
    if (body.password.length < 6) {
      req.flash('error', 'Password must be at least 6 characters long');
      return res.redirect('/auth/signup');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: body.email });
    if (existingUser) {
      req.flash('error', 'Email already registered');
      return res.redirect('/auth/signup');
    }

    // Hash password with bcrypt (12 salt rounds for security)
    const hashedPassword = await bcrypt.hash(body.password, 12);
    body.password = hashedPassword;

    // Remove confirmPassword from body before saving
    delete body.confirmPassword;

    // Create new user
    const user = await User.create(body);

    console.log('[AuthController] New user registered:', user.email);

    // Set success message and redirect to login
    req.flash('success', 'Registration successful! Please log in.');
    res.redirect('/auth/login');

  } catch (error) {
    console.error('[AuthController] Registration error:', error.message);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      req.flash('error', errors.join(', '));
      return res.redirect('/auth/signup');
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      req.flash('error', 'Email already registered');
      return res.redirect('/auth/signup');
    }

    // Generic error
    req.flash('error', 'Registration failed. Please try again.');
    res.redirect('/auth/signup');
  }
};

/**
 * Log out current user
 *
 * Destroys user session and redirects to home page
 *
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.logout = async (req, res) => {
  req.logOut((error) => {
    if (error) {
      console.error('[AuthController] Logout error:', error.message);
    } else {
      console.log('[AuthController] User logged out successfully');
    }
  });

  req.flash('success', 'Logged out successfully');
  res.redirect('/');
};
