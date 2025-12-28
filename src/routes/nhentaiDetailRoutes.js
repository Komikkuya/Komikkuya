const express = require('express');
const router = express.Router();
const nhentaiDetailController = require('../controllers/nhentaiDetailController');

router.get('/g/:slug', nhentaiDetailController.detail);

module.exports = router; 