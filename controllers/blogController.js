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

exports.getAllBlogs = catchAsy(async (req, res, next) => {
  let query = Blog.find();
  if (req.query.state == 'draft') {
    return next(new appError(403, 'You cannot access unpublished articles!'));
  } else {
    query = Blog.find(req.query);
  }

  const blog = await query;

  res.status(200).json({
    status: 'success',
    result: blog.length,
    data: {
      blog,
    },
  });
});

exports.updateBlog = catchAsy(async (req, res, next) => {
  //1. Get Blog Id and Perform search in DB
  const blogID = req.params.id;
  const blog = await Blog.findById(blogID);

  //2. Return error when blog cannot be found
  if (!blog) return next(new appError(404, 'No Blog Found'));

  //3. Check if user is owner of blog
  if (blog.author.id === req.user.id) {
    //4. If everything checks out, allow user edit blog.
    const newBlog = await Blog.findByIdAndUpdate(blogID, req.body, {
      new: true,
      runValidators: true,
    });
    //5. Return data to user
    res.status(200).json({
      status: 'success',
      data: {
        newBlog,
      },
    });
  } else {
    return next(new appError(403, 'Action Forbidden, You cannot Update blog'));
  }
});

exports.deleteBlog = catchAsy(async (req, res, next) => {
  //1. Get Blog Id and Perform search in DB
  const blogID = req.params.id;
  const blog = await Blog.findById(blogID);

  //2. Return error when blog cannot be found
  if (!blog) return next(new appError(404, 'No Blog Found'));

  //3. Check if user is owner of blog
  if (blog.author.id === req.user.id) {
    //4. If everything checks out, allow user delete blog.
    const newBlog = await Blog.findByIdAndDelete(blogID);
    //5. Return data to user
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } else {
    return next(new appError(403, 'Action Forbidden, You cannot delete blog'));
  }
});
