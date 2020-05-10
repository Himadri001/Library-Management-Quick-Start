const validator = require('../helpers/validate');

const create_book = (req, res, next) => {
    const validationRule = {
        "book_name": "required|string",
        "book_author": "required|integer",
    }
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.status(412)
                .send({
                    success: false,
                    message: 'Validation failed',
                    data: err
                });
        } else {
            next();
        }
    });
}
exports.create_book = create_book;

let update_book = (req,res,next)=>{
    const validationRule = {
        "book_id" : "required|integer",
        "book_name" : "string",
        "book_author" : "integer",
    }
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.status(412)
                .send({
                    success: false,
                    message: 'Validation failed',
                    data: err
                });
        } else {
            next();
        }
    });  
}
exports.update_book = update_book;
const delete_book = (req,res,next)=>{
    const validationRule = {
        "book_id" : "required|integer",
    }
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.status(412)
                .send({
                    success: false,
                    message: 'Validation failed',
                    data: err
                });
        } else {
            next();
        }
    }); 
}
exports.delete_book = delete_book;

const admin_signup = (req,res,next)=>{
    const validationRule = {
        "admin_name": "required|string",
        "admin_email": "required|email",
        "admin_pass" : "required|string"
    }
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.status(412)
                .send({
                    success: false,
                    message: 'Validation failed',
                    data: err
                });
        } else {
            next();
        }
    });
}
exports.admin_signup = admin_signup; 

const user_signup = (req,res,next)=>{
    const validationRule = {
        "user_name": "required|string",
        "user_email": "required|email",
        "user_pass" : "required|string"
    }
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.status(412)
                .send({
                    success: false,
                    message: 'Validation failed',
                    data: err
                });
        } else {
            next();
        }
    });
}
exports.user_signup = user_signup;

const admin_signin = (req,res,next)=>{
    const validationRule = {
        "admin_email": "required|email",
        "admin_pass" : "required|string"
    }
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.status(412)
                .send({
                    success: false,
                    message: 'Validation failed',
                    data: err
                });
        } else {
            next();
        }
    });
}
exports.admin_signin = admin_signin;

const user_signin = (req,res,next)=>{
    const validationRule = {
        "user_email": "required|email",
        "user_pass" : "required|string"
    }
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.status(412)
                .send({
                    success: false,
                    message: 'Validation failed',
                    data: err
                });
        } else {
            next();
        }
    });
}
exports.user_signin = user_signin;

let create_author = (req,res,next)=>{
    const validationRule = {
        "author_name" : "required|string"
    }
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.status(412)
                .send({
                    success: false,
                    message: 'Validation failed',
                    data: err
                });
        } else {
            next();
        }
    }); 
}
exports.create_author = create_author;

let update_author = (req,res,next)=>{
    const validationRule = {
        "author_id" : "required|integer",
        "author_name" : "required|string",
    }
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.status(412)
                .send({
                    success: false,
                    message: 'Validation failed',
                    data: err
                });
        } else {
            next();
        }
    });  
}
exports.update_author = update_author;

let delete_author = (req,res,next)=>{
    const validationRule = {
        "author_id" : "required|integer",
    }
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.status(412)
                .send({
                    success: false,
                    message: 'Validation failed',
                    data: err
                });
        } else {
            next();
        }
    });
}
exports.delete_author = delete_author;

let request_book_loan = (req,res,next)=>{
    const validationRule = {
        "book_id" : "required|integer",
    }
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.status(412)
                .send({
                    success: false,
                    message: 'Validation failed',
                    data: err
                });
        } else {
            next();
        }
    });
}
exports.request_book_loan = request_book_loan;

let approve_bookloan_request = (req,res,next)=>{
    const validationRule = {
        "book_id" : "required|integer",
        "approve_status" : "required|integer"
    }
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.status(412)
                .send({
                    success: false,
                    message: 'Validation failed',
                    data: err
                });
        } else {
            next();
        }
    });
}

exports.approve_bookloan_request = approve_bookloan_request;



let browse_book = (req,res,next)=>{
    const validationRule = {
        "is_author" : "integer",
        "is_book" : "integer",
        "searchTerm" : "required"
    }
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.status(412)
                .send({
                    success: false,
                    message: 'Validation failed',
                    data: err
                });
        } else {
            next();
        }
    }); 
}
exports.browse_book = browse_book;