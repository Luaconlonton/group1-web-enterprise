const Account = require('../models/user');
const Staff = require('../models/staff');
const QAcoordinator = require('../models/QAcoordinator');
const QAmanager = require('../models/QAmanager');;
const validation = require('./validation');
const bcrypt = require('bcryptjs');
exports.getAdmin = async(req, res) => {
    res.render('admin/admin', { loginName: req.session.email })
}
exports.changePassword = async(req, res) => {
    res.render('admin/changePassword', { loginName: req.session.email })
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
                res.render('admin/changePassword', { errors: errors, loginName: req.session.email })
            } else {
                await bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newpw, salt, (err, hash) => {
                        if (err) throw err;
                        user.password = hash;
                        user = user.save();
                        req.session.user = user;
                        res.redirect('/admin')
                    })
                })

            }
        } catch (err) {
            console.log(err);
        }
    }
    //QAmanager
exports.viewQAmanager = async(req, res) => {
    let listQAmanager = await QAmanager.find();
    console.log(listQAmanager);
    res.render('admin/viewQAmanager', { listQAmanager: listQAmanager, loginName: req.session.email })
}
exports.addQAmanager = async(req, res) => {
    res.render('admin/addQAmanager', { loginName: req.session.email });
}
exports.doAddQAmanager = async(req, res) => {
    //console.log(req.body)
    let newQAmanager;
    if (req.file) {
        newQAmanager = new QAmanager({
            name: req.body.name,
            email: req.body.email,
            dateOfBirth: new Date(req.body.date),
            address: req.body.address,
            img: req.file.filename
        })
    } else {
        newQAmanager = new QAmanager({
            name: req.body.name,
            email: req.body.email,
            dateOfBirth: new Date(req.body.date),
            address: req.body.address
        })
    }
    let newAccount = new Account({
        email: req.body.email,
        password: "12345678",
        role: "QAmanager"
    });
    try {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newAccount.password, salt, (err, hash) => {
                if (err) throw err;
                newAccount.password = hash;
                newAccount = newAccount.save();
            });
        });
        newQAmanager = await newQAmanager.save();
        res.redirect('/admin/viewQualityAssuranceManager');
    } catch (error) {
        console.log(error);
        return 0;
        // res.redirect('/admin/viewQualityAssuranceManager');
    }
}
exports.editQAmanager = async(req, res) => {
    let id = req.query.id;
    let aQAmanager = await QAmanager.findById(id);

    res.render('admin/editQAmanager', { aQAmanager: aQAmanager, loginName: req.session.email });
}
exports.doEditQAmanager = async(req, res) => {
    let id = req.body.id;
    let aQAmanager = await QAmanager.findById(id);
    // console.log(aQAmanager);

    try {
        if (req.file) {
            aQAmanager.img = req.file.filename;
        }
        aQAmanager.name = req.body.name;
        aQAmanager.dateOfBirth = new Date(req.body.date);
        aQAmanager.address = req.body.address;
        aQAmanager = await aQAmanager.save();
        res.redirect('/admin/viewQualityAssuranceManager');
    } catch (error) {
        console.log(error);
        res.redirect('/admin/viewQualityAssuranceManager');
    }
}
exports.deleteQAmanager = async(req, res) => {
    let id = req.query.id;
    let aQAmanager = await QAmanager.findById(id);
    let email = aQAmanager.email;
    console.log(email);
    Account.deleteOne({ 'email': email }, (err) => {
        if (err)
            throw err;
        else
            console.log('Account is deleted');
    })
    await QAmanager.findByIdAndRemove(id).then(data = {});

    res.redirect('/admin/viewQualityAssuranceManager');
}
exports.searchQAmanager = async(req, res) => {
        const searchText = req.body.keyword;
        //console.log(req.body.keyword);
        let listQAmanager;
        let checkAlphaName = validation.checkAlphabet(searchText);
        let checkEmpty = validation.checkEmpty(searchText);
        const searchCondition = new RegExp(searchText, 'i');

        //console.log(checkEmpty);
        if (!checkEmpty) {
            res.redirect('/admin/viewQualityAssuranceManager');
        } else if (checkAlphaName) {
            listQAmanager = await QAmanager.find({ name: searchCondition });
        }
        res.render('admin/viewQAmanager', { listQAmanager: listQAmanager, loginName: req.session.email });
    }
    //QAcoordinator
exports.viewQAcoordinator = async(req, res) => {
    let listQAcoordinator = await QAcoordinator.find();
    res.render('admin/viewQAcoordinator', { listQAcoordinator: listQAcoordinator, loginName: req.session.email })
}
exports.addQAcoordinator = async(req, res) => {
    res.render('admin/addQAcoordinator', { loginName: req.session.email });
}
exports.doAddQAcoordinator = async(req, res) => {
    let newQAcoordinator;
    console.log(req.body)
    if (req.file) {
        newQAcoordinator = new QAcoordinator({
            name: req.body.name,
            email: req.body.email,
            dateOfBirth: new Date(req.body.date),
            address: req.body.address,
            img: req.file.filename
        })
    } else {
        newQAcoordinator = new QAcoordinator({
            name: req.body.name,
            email: req.body.email,
            dateOfBirth: new Date(req.body.date),
            address: req.body.address
        })
    }
    let newAccount = new Account({
        email: req.body.email,
        password: "12345678",
        role: "QAcoordinator"
    })
    try {
        await bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newAccount.password, salt, (err, hash) => {
                if (err) throw err;
                newAccount.password = hash;
                newAccount = newAccount.save();
            });
        });
        newQAcoordinator = await newQAcoordinator.save();
        //console.log(newTrainee);
        res.redirect('/admin/viewQualityAssuranceCoordinator');
    } catch (error) {
        console.log(error);
        res.redirect('/admin/viewQualityAssuranceCoordinator');
    }
}
exports.editQAcoordinator = async(req, res) => {
    let id = req.query.id;
    let aQAcoordinator = await QAcoordinator.findById(id);

    res.render('admin/editQAcoordinator', { aQAcoordinator: aQAcoordinator, loginName: req.session.email });
}
exports.doEditQAcoordinator = async(req, res) => {
    let id = req.body.id;
    let aQAcoordinator = await QAcoordinator.findById(id);

    try {
        if (req.file) {
            aQAcoordinator.img = req.file.filename;
        }
        aQAcoordinator.name = req.body.name;
        aQAcoordinator.dateOfBirth = new Date(req.body.date);
        aQAcoordinator.address = req.body.address;
        aQAcoordinator = await aQAcoordinator.save();
        res.redirect('/admin/viewQualityAssuranceCoordinator');
    } catch (error) {
        console.log(error);
        res.redirect('/admin/viewQualityAssuranceCoordinator');
    }
}
exports.deleteQAcoordinator = async(req, res) => {
    let id = req.query.id;
    let aQAcoordinator = await QAcoordinator.findById(id);
    let email = aQAcoordinator.email;
    Account.deleteOne({ 'email': email }, (err) => {
        if (err)
            throw err;
        else
            console.log('Account is deleted');
    })
    await QAcoordinator.findByIdAndRemove(id).then(data = {});

    res.redirect('/admin/viewQualityAssuranceCoordinator');
}
exports.searchQAcoordinator = async(req, res) => {
    const searchText = req.body.keyword;
    //console.log(req.body.keyword);
    let listQAcoordinator;
    let checkAlphaName = validation.checkAlphabet(searchText);
    let checkEmpty = validation.checkEmpty(searchText);
    const searchCondition = new RegExp(searchText, 'i');

    //console.log(checkEmpty);
    if (!checkEmpty) {
        res.redirect('/admin/viewQualityAssuranceCoordinator');
    } else if (checkAlphaName) {
        listQAcoordinator = await QAcoordinator.find({ name: searchCondition });
    }
    res.render('admin/viewQAcoordinator', { listQAcoordinator: listQAcoordinator, loginName: req.session.email });
}

//Staff
exports.viewStaff = async(req, res) => {
    let listStaff = await Staff.find();
    res.render('admin/viewStaff', { listStaff: listStaff, loginName: req.session.email })
}
exports.addStaff = async(req, res) => {
    res.render('admin/addStaff', { loginName: req.session.email });
}
exports.doAddStaff = async(req, res) => {
    let newStaff;
    if (req.file) {
        newStaff = new Staff({
            name: req.body.name,
            email: req.body.email,
            dateOfBirth: new Date(req.body.date),
            address: req.body.address,
            img: req.file.filename,
            type: req.body.department
        })
    } else {
        newStaff = new Staff({
            name: req.body.name,
            email: req.body.email,
            dateOfBirth: new Date(req.body.date),
            address: req.body.address,
            type: req.body.department
        })
    }
    let newAccount = new Account({
        email: req.body.email,
        password: "12345678",
        role: "Staff"
    })
    try {
        await bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newAccount.password, salt, (err, hash) => {
                if (err) throw err;
                newAccount.password = hash;
                newAccount = newAccount.save();
            });
        });
        newStaff = await newStaff.save();
        res.redirect('/admin/viewStaff');
    } catch (error) {
        console.log(error);
        res.redirect('/admin/viewStaff');
    }
}
exports.editStaff = async(req, res) => {
    let id = req.query.id;
    let aStaff = await Staff.findById(id);

    res.render('admin/editStaff', { aStaff: aStaff, loginName: req.session.email });
}
exports.doEditStaff = async(req, res) => {
    let id = req.body.id;
    let aStaff = await Staff.findById(id);

    try {
        if (req.file) {
            aStaff.img = req.file.filename;
        }
        aStaff.name = req.body.name;
        aStaff.dateOfBirth = new Date(req.body.date);
        aStaff.address = req.body.address;
        aStaff.type = req.body.department
        aStaff = await aStaff.save();
        res.redirect('/admin/viewStaff');
    } catch (error) {
        console.log(error);
        res.redirect('/admin/viewStaff');
    }
}
exports.deleteStaff = async(req, res) => {
    let id = req.query.id;
    let aStaff = await Staff.findById(id);
    let email = aStaff.email;
    console.log(email);
    Account.deleteOne({ 'email': email }, (err) => {
        if (err)
            throw err;
        else
            console.log('Account is deleted');
    })
    await idea.deleteMany({ 'author': aStaff.id });
    await Comments.deleteMany({ 'author': aStaff.id });
    await Staff.findByIdAndRemove(id).then(data = {});
    res.redirect('/admin/viewStaff');
}
exports.searchStaff = async(req, res) => {
    const searchText = req.body.keyword;
    console.log(req.body);
    let listStaff;
    let checkAlphaName = validation.checkAlphabet(searchText);
    let checkEmpty = validation.checkEmpty(searchText);
    const searchCondition = new RegExp(searchText, 'i');

    //console.log(checkEmpty);
    if (!checkEmpty) {
        res.redirect('/admin/viewStaff');
    } else if (checkAlphaName) {
        listStaff = await Staff.find({ name: searchCondition });
    }
    res.render('admin/viewStaff', { listStaff: listStaff, loginName: req.session.email });
}