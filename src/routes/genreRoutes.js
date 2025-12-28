const express = require('express');
const router = express.Router();
const genreController = require('../controllers/genreController');

// Genre listing and filtering
router.get('/', genreController.index);

module.exports = router; 
