const express = require('express');
const router = express.Router();
const nhentaiController = require('../controllers/nhentaiController');

router.get('/', nhentaiController.index);

module.exports = router; 