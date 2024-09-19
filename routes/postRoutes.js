// backend/routes/postRoutes.js
const express = require('express');
const Post = require('../models/Post');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// add
router.post('/', async (req, res) => {
  const { author, content, media, type, title, link, size } = req.body;

  if (!author || !content || !type) {
    return res.status(400).json({ message: 'Author, content, and type are required' });
  }

  const newPost = new Post({
    author,
    content,
    media,
    type,
    title,
    link,
    size,
  });

  try {
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// get all
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ timestamp: -1 }).populate('author', 'name avatar');
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// delete
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Ensure the user deleting the post is the author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await post.deleteOne(); // Use deleteOne instead of remove
    res.status(200).json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
router.route('/delete/:id').delete(protect, deletePost);


module.exports = router;