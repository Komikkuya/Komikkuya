const express = require('express');
const router = express.Router();
const doujinController = require('../controllers/doujinController');
const doujinDetailController = require('../controllers/doujinDetailController');

router.get('/', doujinController.index);
router.get('/:slug', doujinDetailController.detail);

module.exports = router; 
