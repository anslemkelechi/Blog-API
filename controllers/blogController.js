const Blog = require('./../models/blogModel');
const catchAsy = require('./../utils/catchAsync');
const appError = require('./../utils/appError');
const slugify = require('slugify');

exports.createBlog = catchAsy(async (req, res, next) => {
  req.body.author = req.user._id;
  const blog = await Blog.create(req.body);

  res.status(200).json({
    status: 'Success',
    data: {
      blog,
    },
  });
});
