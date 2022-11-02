const mongoose = require('mongoose');
const validator = require('validator');
const slugify = require('slugify');

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Your Blog Requires A Title'],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      trim: true,
    },
    author: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    state: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    read_count: {
      type: Number,
    },
    reading_time: {
      type: String,
    },
    tags: [String],
    body: {
      type: String,
      required: [true, 'Your blog must have a body!'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
blogSchema.set('timestamps', true);
blogSchema.pre('save', function (next) {
  this.populate({
    path: 'author',
    select: '-__v -resetPasswordToken -resetTokenExpires -password -email',
  });
  next();
});
blogSchema.pre('save', function (next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});
blogSchema.pre('/^find/', function (next) {
  this.read_count = this.read_count + 1;
  next();
});

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
