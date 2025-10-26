/**
 * User Model
 *
 * Mongoose schema for user accounts and authentication
 * Supports role-based access control (RBAC) with roles: user, admin, mod
 *
 * @module model/userModel
 */

const mongoose = require('mongoose');
const validator = require('validator');

/**
 * User Schema Definition
 *
 * @typedef {Object} User
 * @property {string} firstName - User's first name (min 3 characters, no special chars)
 * @property {string} lastName - User's last name
 * @property {string} email - Unique email address (validated)
 * @property {string} password - Hashed password (bcrypt with 12 salt rounds)
 * @property {Date} DOB - Date of birth
 * @property {string} gender - User's gender
 * @property {Date} createdAt - Account creation timestamp
 * @property {string} profilePic - URL to profile picture
 * @property {boolean} isActive - Account active status
 * @property {Date} passwordChangedAt - Last password change timestamp
 * @property {string} role - User role (user|admin|mod)
 * @property {string} resetPasswordToken - Password reset token
 * @property {Date} passwordTokenExpiredAt - Reset token expiration
 */
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      minlength: [3, 'First name should be at least 3 characters'],
      maxlength: [50, 'First name cannot exceed 50 characters'],
      trim: true,
      validate: {
        validator: function (value) {
          // Ensure no special characters like @, #, $, etc.
          return /^[a-zA-Z\s'-]+$/.test(value);
        },
        message: 'First name can only contain letters, spaces, hyphens, and apostrophes',
      },
    },

    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      minlength: [2, 'Last name should be at least 2 characters'],
      maxlength: [50, 'Last name cannot exceed 50 characters'],
      trim: true,
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, 'Please enter a valid email address'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't include password in query results by default
    },

    DOB: {
      type: Date,
      validate: {
        validator: function (value) {
          // Ensure DOB is in the past
          return !value || value < new Date();
        },
        message: 'Date of birth must be in the past',
      },
    },

    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: {
        values: ['male', 'female', 'other', 'prefer-not-to-say'],
        message: 'Gender must be: male, female, other, or prefer-not-to-say',
      },
    },

    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true, // Cannot be changed after creation
    },

    profilePic: {
      type: String,
      default: '/assets/default-avatar.png',
    },

    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },

    passwordChangedAt: {
      type: Date,
      default: Date.now,
    },

    role: {
      type: String,
      enum: {
        values: ['user', 'admin', 'mod'],
        message: 'Role must be: user, admin, or mod',
      },
      default: 'user',
    },

    resetPasswordToken: {
      type: String,
      select: false,
    },

    passwordTokenExpiredAt: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt
    toJSON: { virtuals: true }, // Include virtual properties in JSON output
    toObject: { virtuals: true },
  }
);

/**
 * Indexes for better query performance
 */
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

/**
 * Virtual property: Full name
 */
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

/**
 * Pre-save middleware
 * Updates passwordChangedAt when password is modified
 */
userSchema.pre('save', function (next) {
  if (this.isModified('password') && !this.isNew) {
    this.passwordChangedAt = Date.now();
  }
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
