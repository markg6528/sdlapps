
const express = require('express');
const { getBooks, addBook, updateBook, deleteBook } = require('../controllers/bookController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').get(protect, getBooks).post(protect, addBook);
router.route('/:id').put(protect, updateBook).delete(protect, deleteBook);

module.exports = router;
