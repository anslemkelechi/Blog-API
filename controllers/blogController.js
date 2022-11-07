const Blog = require('./../models/blogModel');
const User = require('./../models/userModel');
const catchAsy = require('./../utils/catchAsync');
const appError = require('./../utils/appError');
const slugify = require('slugify');

exports.createBlog = catchAsy(async (req, res, next) => {
  req.body.author = req.user._id;
  const blog = await Blog.create(req.body);
  const readTime = await blog.calcReadTime();
  blog.reading_time = `${readTime[0]} min ${readTime[1]} seconds`;
  await blog.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'Success',
    data: {
      blog,
    },
  });
});

exports.getAllBlogs = catchAsy(async (req, res, next) => {
  //1. Create a query
  let query = Blog.find();

  //2. Check if user queries for any blog in draft state.
  if (req.query.state == 'draft') {
    return next(new appError(403, 'You cannot access unpublished articles!'));
  } else {
    query = Blog.find(req.query);
  }

  console.log(req.query);
  //Build query for author
  if (req.query.author) {
    const author = req.query.author;
    console.log(author);
    const user = await User.findOne({ username: author });
    if (!user)
      return next(
        new appError(403, 'Author does not exists or has written no articles')
      );
    const ID = user.id;
    query = Blog.find({ author: ID });
  }

  //Build query for tags
  if (req.query.tag) {
    const tag = req.query.tag.split(',');
    query = Blog.find({ tags: tag });
  }

  //Build Query For sort
  if (req.query.sort) {
    const sort = req.query.sort || 'createdAt';
    query = query.sort(sort);
  }
  //.Add Pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 20;
  const skip = (page - 1) * limit;
  query = query.skip(skip).limit(limit);

  //Await Query, and filter drafts out.
  const blog = await query;
  let newblog = [];
  if (blog.length == 0) return next(new appError(403, 'No Blog Found'));
  blog.forEach((el) => {
    if (el.state == 'published') {
      newblog.push(el);
    }
  });

  res.status(200).json({
    status: 'success',
    result: newblog.length,
    data: {
      newblog,
    },
  });
});

exports.getBlog = catchAsy(async (req, res, next) => {
  const ID = req.params.id;
  const blog = await Blog.findById(ID);

  if (blog.state == 'draft') {
    return next(new appError(403, 'You cannot access unpublished blog'));
  }
  const count = blog.updateRead();
  await blog.save({ validateBeforeSave: false });
  res.status(200).json({
    status: 'Success',
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

exports.myBlog = catchAsy(async (req, res, next) => {
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach((el) => delete queryObj[el]);

  //1. Grab user ID from protect route
  const userID = req.user.id;

  //2. Use ID To find Blog where it matches the author ID.
  let query = Blog.find({ author: userID });

  //3. Build Query For Other Query
  if (req.query.state) {
    const state = req.query.state;
    query = Blog.find({ author: userID, state: state });
  }
  //4.Add Pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 5;
  const skip = (page - 1) * limit;
  query = query.skip(skip).limit(limit);
  const blog = await query;

  res.status(200).json({
    status: 'success',
    result: blog.length,
    data: {
      blog,
    },
  });
});
