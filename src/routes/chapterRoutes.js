const express = require('express');
const router = express.Router();
const chapterController = require('../controllers/chapterController');

router.get('/:chapterUrl(*)', chapterController.read);

module.exports = router; 