const express = require('express');
const router = express.Router();
const adminController = require('../controller/admin');
const { isAdmin } = require("../middleware/auth");
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json();

router.get('/admin', isAdmin, adminController.getAdmin);
router.get('/admin/changePassword', isAdmin, adminController.changePassword)
router.post('/admin/doChangePassword', isAdmin, adminController.doChangePassword)




module.exports = router;