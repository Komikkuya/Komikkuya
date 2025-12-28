const express = require('express');
const router = express.Router();
const mangaController = require('../controllers/mangaController');

router.get('/:slug', mangaController.detail);
router.get('/image/:imageId', mangaController.proxyImage);
 
module.exports = router; 