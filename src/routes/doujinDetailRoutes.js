const express = require('express');
const router = express.Router();
const doujinDetailController = require('../controllers/doujinDetailController');

router.get('/:slug', doujinDetailController.detail);

module.exports = router; 
