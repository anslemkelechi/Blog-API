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
      default: 0,
    },
    reading_time: {
      type: String,
      default: 0,
    },
    tags: {
      type: [String],
      lowercase: true,
    },
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
blogSchema.pre(/^find/, function (next) {
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
blogSchema.methods.updateRead = async function () {
  this.read_count = this.read_count + 1;
  return this.read_count;
};
blogSchema.methods.calcReadTime = async function () {
  let words = this.title.length + this.body.length;
  let time = words / 200;
  const fullTime = time.toString().split('.');
  const min = fullTime[0];
  const sec = Math.round((fullTime[1] * 60) / 1000);
  return [min, sec];
};
const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
