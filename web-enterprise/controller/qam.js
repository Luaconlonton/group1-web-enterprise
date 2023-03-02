const Account = require('../models/user');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const validation = require('./validation');
var mongoose = require('mongoose');
const fs = require("fs");
const fsPromises = fs.promises;

exports.getQAM = async(req, res) => {
    res.render('qam/qam_index', { loginName: req.session.email })
}

exports.changePassword = async(req, res) => {
    res.render('qam/changePassword', { loginName: req.session.email })
}

exports.doChangePassword = async(req, res) => {
    let user = await Account.findOne({ email: req.session.email });
    let current = req.body.current;
    let newpw = req.body.new;
    let confirm = req.body.confirm;
    let errors = {};
    let flag = true;
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
            res.render('qam/changePassword', { errors: errors, loginName: req.session.email })
        } else {
            await bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newpw, salt, (err, hash) => {
                    if (err) throw err;
                    user.password = hash;
                    user = user.save();
                    req.session.user = user;
                    res.redirect('/qam_index')
                })
            })

        }
    } catch (err) {
        console.log(err);
    }
}