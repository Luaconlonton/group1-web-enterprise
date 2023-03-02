const staff = require('../models/staff');
const fs = require("fs");
const Account = require('../models/user');
const bcrypt = require('bcryptjs');
const QAC = require('../models/QAcoordinator');


// ======================== View Change Password ========================== //
exports.changePassword = async(req, res) => {
    const existedQAC = await QAC.find({ email: req.session.email });
    if (req.session.email === undefined || existedQAC.length == 0) {
        res.redirect('/');
    } else {
        res.render('qac/changePassword', { loginName: req.session.email });
    }
}

// ======================== Change Password ========================== //
exports.doChangePassword = async(req, res) => {
    const existedQAC = await QAC.find({ email: req.session.email });
    if (req.session.email === undefined || existedQAC.length == 0) {
        res.redirect('/');
    } else {
        let user = await Account.findOne({ email: req.session.email });
        let current = req.body.current;
        let newpw = req.body.new;
        let confirm = req.body.confirm;
        let errors = {};
        let flag = true;
        console.log(1);
        try {
            await bcrypt.compare(current, user.password)
                .then((doMatch) => {
                    if (doMatch) {
                        if (newpw.length < 8) {
                            flag = false;
                            Object.assign(errors, { length: "Password must contain 8 characters or more!" });
                        } else if (newpw != confirm) {
                            flag = false;
                            Object.assign(errors, { check: "New Password and Confirm Password do not match!" });
                        }
                    } else {
                        flag = false;
                        Object.assign(errors, { current: "Old password is incorrect!" });
                    }
                });
            if (!flag) {
                res.render('qac/changePassword', { errors: errors, loginName: req.session.email })
            } else {
                await bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newpw, salt, (err, hash) => {
                        if (err) throw err;
                        user.password = hash;
                        user = user.save();
                        req.session.user = user;
                        res.redirect('/qac')
                    })
                })

            }
        } catch (err) {
            console.log(err);
        }
    }
}