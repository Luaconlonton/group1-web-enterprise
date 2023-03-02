const express = require('express');
const router = express.Router();
const qacController = require('../controller/qac');

router.get('/qac', qacController.getQAC);

router.get('/qac/changePassword', qacController.changePassword);
router.post('/qac/doChangePassword', qacController.doChangePassword);
module.exports = router;