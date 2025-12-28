const express = require('express');
const router = express.Router();
const { getHistory } = require('../controllers/historyController');

// GET /history - Display reading history
router.get('/', getHistory);

module.exports = router; 