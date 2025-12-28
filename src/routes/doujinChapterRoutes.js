const express = require("express");
const router = express.Router();
const DoujinChapterController = require("../controllers/doujinChapterController");

router.get("/chapter/:slug", DoujinChapterController.read);

module.exports = router;

