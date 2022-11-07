const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: [true, 'Please provide firstname'],
    },
    lastname: {
      type: String,
      required: [true, 'Please provide lastname'],
    },
    email: {
      type: String,
      required: [true, 'Please Provide Email Address'],
      unique: true,
      validate: [validator.isEmail, 'Please a valid email address'],
    },
    username: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Please Provide A Password'],
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please Fill Password Field'],
      validate: function (el) {
        return el === this.password;
      },
      message: 'Password do not match.',
    },
    resetPasswordToken: String,
    resetTokenExpires: Date,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  this.username = this.username.toLowerCase();
  next();
});
userSchema.methods.createResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  console.log({ resetToken }, this.resetPasswordToken);
  this.resetTokenExpires = Date.now() + 30 * 60 * 1000;
  return resetToken;
};
userSchema.methods.comparePassword = async function (
  signinPassword,
  userPassword
) {
  return await bcrypt.compare(signinPassword, userPassword);
};
//Virtual Properties To Load articles per user
userSchema.virtual('articles', {
  ref: 'Blog',
  foreignField: 'author',
  localField: '_id',
});
const User = mongoose.model('User', userSchema);

module.exports = User;
