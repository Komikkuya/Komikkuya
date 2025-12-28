const express = require('express');
const router = express.Router();
const nhentaiSearchController = require('../controllers/nhentaiSearchController');

router.get('/', nhentaiSearchController.search);
 
module.exports = router; 
