const jwt = require('jsonwebtoken');
const catchAsy = require('./../utils/catchAsync');
const appError = require('./../utils/appError');
const User = require('./../models/userModel');
const sendEmail = require('./../utils/email');
const crypto = require('crypto');
const { promisify } = require('util');
const app = require('../app');
const signToken = (id) => {
  return jwt.sign({ id }, process.env.jwt_secret, {
    expiresIn: process.env.jwt_expires,
  });
};

const createToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.jwt_cookie_expires * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  //Send Token To Client
  res.cookie('jwt', token, cookieOptions);

  //Remove Password From JSON
  user.password = undefined;

  //Send Response To Client
  res.status(statusCode).json({
    status: 'Success',
    data: {
      token,
      user,
    },
  });
};
exports.signup = catchAsy(async (req, res, next) => {
  const user = await User.create(req.body);

  createToken(user, 200, res);
});
exports.login = catchAsy(async (req, res, next) => {
  const { email, password } = req.body;

  //If user does not provide any of the required fields
  if (!email || !password) {
    return next(new appError(401, 'Please Provide Email or Password.'));
  }

  const user = await User.findOne({ email }).select('+password');

  //If Any Field Is Incorrect
  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(new appError(401, 'Email or Password Incorrect'));
  }

  //If everything checks out, send JWT Token.
  createToken(user, 200, res);
});

exports.forgetPassword = catchAsy(async (req, res, next) => {
  //1.Get User From Posted Email
  const user = await User.findOne({ email: req.body.email });

  if (!user) return next(new appError(404, 'Email Address Not Found!'));

  //2. Create Token and Save to DB
  const resetToken = user.createResetToken();
  await user.save({ validateBeforeSave: false });

  //3. Send to Client
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetpassword/${resetToken}`;
  const message = `You made a request for a password reset, Click on the link to reset your password, reset token is valid for 30mins! ${resetUrl} \n Please Ignore if you did not make this request`;

  try {
    sendEmail({
      email: user.email,
      subject: `Your Password Reset Token(Valid 30min)`,
      message,
    });
    res.status(201).json({
      status: 'Success',
      message: 'Please check inbox for reset token!',
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetTokenExpires = undefined;
    return next(
      new appError(
        500,
        'There was an error sending mail, Please try again later!'
      )
    );
  }
});

exports.resetPassword = catchAsy(async (req, res, next) => {
  //1. Grab token from resetUrl
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetTokenExpires: { $gt: Date.now() },
  });
  //2. Check IF token matches & still valid
  if (!user)
    return next(
      new appError(
        400,
        'Token Invalid or Expired, Try to reset password again!'
      )
    );
  //3. IF Token is valid
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.resetPasswordToken = undefined;
  user.resetTokenExpires = undefined;
  await user.save();
  //4. Login User
  createToken(user, 200, res);
});

exports.protectRoute = catchAsy(async (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) return next(new appError(400, 'Please Login Again!'));

  const decoded = await promisify(jwt.verify)(token, process.env.jwt_secret);
  //Check if user exists
  const currentUser = await User.findById(decoded.id);
  //if (decoded.expiresIn > Date.now() + jwt_cookie_expires * 60 * 60 * 1000)
  if (!currentUser)
    return next(new appError(404, 'Session expired, Login again!'));
  //Add user to req object
  req.user = currentUser;
  next();
});
