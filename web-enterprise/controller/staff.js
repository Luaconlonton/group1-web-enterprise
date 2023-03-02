const validation = require('./validation');
const Account = require('../models/user');
const bcrypt = require('bcryptjs');
const fs = require("fs");
const multer = require('multer');
const { redirect } = require('express/lib/response');
const Staff = require('../models/staff');
const nodemailer = require('nodemailer');
const QAC = require('../models/QAcoordinator');

exports.getStaff = async(req, res) => {
    res.render('staff/staff', { loginName: req.session.email })
}

exports.viewStaff = async(req, res) => {
    let listStaff = await Staff.find();
    res.render('staff/viewStaff', { listStaff: listStaff, loginName: req.session.email })
}

exports.searchStaff = async(req, res) => {
    const searchText = req.body.keyword;
    console.log(req.body);
    let listStaff;
    let checkEmpty = validation.checkEmpty(searchText);
    const searchCondition = new RegExp(searchText, 'i');

    //console.log(checkEmpty);
    if (!checkEmpty) {
        res.redirect('/staff/viewStaff');
    } else {
        listStaff = await Staff.find({ name: searchCondition });
    }
    res.render('staff/viewStaff', { listStaff: listStaff, loginName: req.session.email });
}

exports.changePassword = async(req, res) => {
    res.render('staff/changePassword', { loginName: req.session.email })
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
            res.render('staff/changePassword', { errors: errors, loginName: req.session.email })
        } else {
            await bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newpw, salt, (err, hash) => {
                    if (err) throw err;
                    user.password = hash;
                    user = user.save();
                    req.session.user = user;
                    res.redirect('/staff')
                })
            })

        }
    } catch (err) {
        console.log(err);
    }
}