const express = require('express');
const router = express.Router();
const qamController = require('../controller/qam');
const { isQAM } = require("../middleware/auth");


router.get('/qam/changePassword', isQAM, qamController.changePassword)
router.post('/qam/doChangePassword', isQAM, qamController.doChangePassword)


module.exports = router;