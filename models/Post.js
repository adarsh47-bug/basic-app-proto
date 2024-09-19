// backend/models/Post.js
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    media: String,
    type: {
      type: String,
      enum: ['media', 'article', 'discussion'],
      required: true,
    },
    title: String,
    link: String,
    size: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);

// // models/Post.js
// const mongoose = require('mongoose');
// const { Schema } = mongoose;

// // Base schema for all posts
// const postSchema = new Schema({
//   postId: { type: String, required: true },
//   authorId: { type: String, required: true },
//   authorName: { type: String, required: true },
//   authorAvatar: { type: String, required: true },
//   content: { type: String, required: true },
//   timestamp: { type: Date, default: Date.now },
//   likes: { type: Number, default: 0 },
//   comments: [
//     {
//       commentId: String,
//       userId: String,
//       userName: String,
//       userAvatar: String,
//       commentText: String,
//       commentTimestamp: Date,
//     }
//   ],
//   shares: { type: Number, default: 0 },
//   type: { type: String, required: true, enum: ['Media', 'Article', 'Discussion'] },
// }, { discriminatorKey: 'type' });

// const Post = mongoose.model('Post', postSchema);

// // Media post schema
// const mediaPostSchema = new Schema({
//   mediaUrl: { type: String, required: true },
//   mediaType: { type: String, required: true },
//   mediaThumbnail: String,
// });
// const MediaPost = Post.discriminator('Media', mediaPostSchema);

// // Article post schema
// const articlePostSchema = new Schema({
//   title: { type: String, required: true },
//   body: { type: String, required: true },
//   references: [
//     {
//       refTitle: String,
//       refUrl: String,
//     }
//   ],
//   readTime: Number,
// });
// const ArticlePost = Post.discriminator('Article', articlePostSchema);

// // Discussion thread schema
// const discussionPostSchema = new Schema({
//   topic: { type: String, required: true },
//   thread: [
//     {
//       userId: String,
//       userName: String,
//       userAvatar: String,
//       commentText: String,
//       commentTimestamp: Date,
//     }
//   ],
//   closed: { type: Boolean, default: false },
// });
// const DiscussionPost = Post.discriminator('Discussion', discussionPostSchema);

// module.exports = { Post, MediaPost, ArticlePost, DiscussionPost };
