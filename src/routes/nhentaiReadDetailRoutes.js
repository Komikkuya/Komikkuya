const express = require('express');
const router = express.Router();
const nhentaiReadDetailController = require('../controllers/nhentaiReadDetailController');

router.get('/g/:galleryId/:page', nhentaiReadDetailController.detail);

module.exports = router;

