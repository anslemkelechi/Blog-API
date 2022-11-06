const express = require('express');
const blogController = require('./../controllers/blogController');
const authController = require('./../controllers/authController');

const router = express.Router();
router
  .route('/myblogs')
  .get(authController.protectRoute, blogController.myBlog);
router
  .route('/:author?')
  .post(authController.protectRoute, blogController.createBlog)
  .get(blogController.getAllBlogs);
router.route('/:id').get(blogController.getBlog);
router
  .route('/update/:id')
  .patch(authController.protectRoute, blogController.updateBlog);

router
  .route('/delete/:id')
  .delete(authController.protectRoute, blogController.deleteBlog);
module.exports = router;
