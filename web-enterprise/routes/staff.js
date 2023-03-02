const express = require('express');
const router = express.Router();
const staffController = require('../controller/staff');
const { isStaff } = require("../middleware/auth");

router.get('/staff', staffController.getStaff);
router.get('/staff/viewStaff', staffController.viewStaff);


router.get('/staff/changePassword', isStaff, staffController.changePassword)
router.post('/staff/doChangePassword', isStaff, staffController.doChangePassword)

module.exports = router;