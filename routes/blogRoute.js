const express = require('express');
const blogController = require('./../controllers/blogController');
const authController = require('./../controllers/authController');

const router = express.Router();
router
  .route('/')
  .post(authController.protectRoute, blogController.createBlog)
  .get(blogController.getAllBlogs);

router
  .route('/update/:id')
  .patch(authController.protectRoute, blogController.updateBlog);

router
  .route('/delete/:id')
  .patch(authController.protectRoute, blogController.deleteBlog);

module.exports = router;
