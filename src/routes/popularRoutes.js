const express = require('express');
const router = express.Router();
const popularController = require('../controllers/popularController');

// Popular page route
router.get('/', popularController.index);

module.exports = router; 