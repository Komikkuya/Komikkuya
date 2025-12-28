const express = require('express');
const router = express.Router();
const latestController = require('../controllers/latestController');

router.get('/', latestController.index);

module.exports = router; 
