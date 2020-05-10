const connection = require('./connection');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const book = require('./book');
dotenv.config();
const jwt_secret = process.env.jwt_secret;
let create_user = (req, res) => {
    if (req.headers['role'] != 'admin') {
        res.status(401).send({
            message: "Unauthorized to access the API"
        })
    }
    else {
        let user_name = req.body.user_name;
        let user_email = req.body.user_email;
        let user_pass = req.body.user_pass;
        bcrypt.hash(user_pass, 10, function (err, user_pass) {
            if (err) {
                res.status(500).send({
                    message: err
                })
            }
            else {
                let insert_sql = "INSERT INTO tb_users (user_name,user_email,user_password,user_role) VALUES (?,?,?,?)";
                connection.query(insert_sql, [user_name, user_email, user_pass, 'book user'], (err, result) => {
                    if (err) {
                        res.status(412).send({
                            message: err.sqlMessage
                        })
                    }
                    else {
                        res.status(200).send({
                            message: "Success, Please signin to verify",
                            user_id: result.insertId
                        })

                    }

                })
            }
        })
    }
}
exports.create_user = create_user;

let user_sign_in = (req,res)=>{
    let user_email = req.body.user_email;
    let user_pass = req.body.user_pass;
    let select_sql = "SELECT * from tb_users WHERE user_email = ?";
    connection.query(select_sql,[user_email],(err,result)=>{
        if(err){
            res.status(412).send({
                message : err.sqlMessage
            })
        }
        else{
            bcrypt.compare(user_pass, result[0].user_password, function(err, match_result) {
                if(err){
                    res.status(401).send(err);
                }
                else{
                    let token = jwt.sign({
                        id : result[0].user_id,
                        role : result[0].user_role
                    },jwt_secret,{
                        expiresIn: 86400 
                    });
                    res.status(200).send({
                        message : "success",
                        token : token,
                        user_id : result[0].user_id
                    })
                }
            });
        }
    })
}
exports.user_sign_in = user_sign_in;



let upload_user_image = (req,res)=>{
    if(req.headers['role'] != 'book user' ){
        res.send(401).send({message: "Unauthorized to access the API"})
    }
    console.log(req.file);
    if(!req.file) {
      res.status(500).send({message : "Image file is required"});
    }
    console.dir( req.headers);
    let fileUrl= 'http://localhsot:3000/images/' + req.file.filename;
    let user_id = req.headers['user_id'];
    let update_sql = "UPDATE tb_users set profile_image = ? WHERE user_id = ?";
    connection.query(update_sql,[fileUrl,user_id],(err,result)=>{
        if(err){
            res.status(412).send({
                message : err.sqlMessage
            })
        }
        else{
            res.status(200).send({message: "Profile image successfuly added"});
        }
    })
};
exports.upload_user_image = upload_user_image;

// exports.nodejs-faka-faka = (req,res)=>{
   
// }
let request_book_loan = (req,res)=>{
    if(req.headers['role'] != 'book user' ){
        res.send(401).send({message: "Unauthorized to access the API"})
    }
    else{
        book.book_exists_check(req.body.book_id,(err,book_result)=>{ // checking book existance 
            if(err){
                res.status(412).send({message : err.message})
            }
            else{
                book.book_loan_check(req.body.book_id,(no_loan_data,loan_record)=>{// checking if book is in loan already
                    if(loan_record){
                        res.status(412).send({message: "Book is already on loan can not request it"})
                    }
                    else if(no_loan_data){
                        active_request_check(req.body.book_id,(no_request,request_record)=>{// checking if any one request the book earlier
                            if(request_record){
                                res.status(412).send({message :request_record.message });
                            }
                            else if(no_request){
                                let insert_sql = "INSERT INTO tb_bookloan_request (book_id,user_id,request_status) VALUES (?,?,?) ";
                                connection.query(insert_sql,[req.body.book_id,req.headers['user_id'],0],(err,result)=>{
                                    if(err){
                                        res.status(412).send({message : err.sqlMessage})
                                    }
                                    else{
                                        res.status(200).send({message : "Book requested for admin approval"})
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })
    } 
}
exports.request_book_loan = request_book_loan;

let active_request_check = (book_id,callback)=>{
    if(book_id) {
        let select_sql = "SELECT * from tb_bookloan_request where book_id = ? and request_status = ?";
        connection.query(select_sql,[book_id,0],(err,result)=>{
            if(err){
                callback({message : err},null);
            }
            else if(result.length == 0) {
                callback({message : "No active request"}, null)
            }
            else{
                callback(null,{message : "Active request exists", request_id : result[0].request_id, user_id: result[0].user_id});
            }
        })
    }
    else{
        callback({message: "Book Id required"},null);
    }
}
exports.active_request_check = active_request_check;

let active_user_check = (user_id,callback)=>{
    if(user_id) {
        let select_sql = "SELECT * from tb_users where user_id = ?";
        connection.query(select_sql,[user_id,1],(err,result)=>{
            if(err){
                callback({message : err},null);
            }
            else if(result.length == 0) {
                callback({message : "User does not exist or not an approved user"},null)
            }
            else{
                callback(null,{message : "user_exists"},);
            }
        })
    }
    else{
        callback({message: "User Id required"},null);
    }
}
exports.active_user_check = active_user_check;

let view_loaned_book = (req,res)=>{
    if(req.headers['role'] != 'book user' ){
        res.status(401).send({message: "Unauthorized to access the API"})
    }
    else{
        active_user_check(req.headers['user_id'],(empty_record,user_record)=>{
            if(empty_record){
                res.status(412).send({message : "User does not exist or not approved"});
            }
            else{
                let select_sql = "SELECT * from tb_bookloan WHERE user_id = ? and loan_status = ?";
                connection.query(select_sql,[req.headers['user_id'],0],(err,result)=>{
                    if(err){
                        res.status(412).send({message : err.sqlMessage})
                    }
                    else if(result.length == 0){
                        res.status(412).send({message : "No book in loan list"})
                    }
                    else{
                        res.status(200).send({message : "Success", data : result})
                    }
                })
            }
        })
    }
}
exports.view_loaned_book = view_loaned_book;

let browse_book = (req,res)=>{
    if(req.headers['role'] == 'book user' || req.headers['role'] == 'admin' ){
        if(req.body.searchTerm != " "){
            console.dir(req.headers);
            let searchTerm = "%" + req.body.searchTerm + "%";
            let select_sql = "";
            if(!req.body.is_author && !req.body.is_book){
                 select_sql = "SELECT *, a.author_name FROM tb_books b LEFT JOIN tb_authors a ON b.book_author = a.author_id WHERE (b.book_name LIKE  ?  or a.author_name like  ?)";
                 execute_query(select_sql,searchTerm);
            }
            else if(!req.body.is_author && req.body.is_book){
                select_sql = "SELECT *, a.author_name FROM tb_books b LEFT JOIN tb_authors a ON b.book_author = a.author_id WHERE (b.book_name LIKE  ?)";
                execute_query(select_sql,searchTerm);
            }
            else if(req.body.is_author && !req.body.is_book){
                select_sql = "SELECT *, a.author_name FROM tb_books b LEFT JOIN tb_authors a ON b.book_author = a.author_id WHERE (a.author_name LIKE  ?)";
                execute_query(select_sql,searchTerm);          
            }
            else{
                select_sql = "SELECT *, a.author_name FROM tb_books b LEFT JOIN tb_authors a ON b.book_author = a.author_id WHERE (b.book_name LIKE  ?  or a.author_name like  ?)";
                 execute_query(select_sql,searchTerm);
            }
        }

        else{
            res.status(412).send({message : "search query can not be empty"});
        }
        function execute_query(select_sql,searchTerm){
            connection.query(select_sql, [searchTerm,searchTerm],(err,result)=>{
                if(err){
                    res.status(412).send({message : err.sqlMessage});
                }
                else if(result.length == 0){
                    res.status(412).send({message :  "No Book or Author matched with " + req.body.searchTerm})
                }
                else {
                    res.status(200).send({message : "successs", data : result});
                }
            })
        }
    }
    else{
        res.status(401).send({message: "Unauthorized to access the API"})
    }
}
exports.browse_book = browse_book;

let view_bookloan_request = (req,res)=>{
    let select_sql = "";
    let values = [];
    if(req.headers['role'] == 'book user' ){
        if(req.headers['user_id']) {
             select_sql = "SELECT (CASE WHEN r.request_status = 0 THEN 'Pending' WHEN r.request_status = 1 THEN 'Approved' ELSE 'Rejected' END ) as request_status,  b.book_name, a.author_name FROM tb_bookloan_request r LEFT JOIN tb_books b ON r.book_id = b.book_id LEFT JOIN tb_authors a ON b.book_author = a.author_id where r.user_id=?";
             values = [req.headers['user_id']];
             execute_query(select_sql,values);
        }
        else{
            res.status(412).send({message : "User id required"});
        }
    }
    else if(req.headers['role'] == 'admin'){
        select_sql = "SELECT *, b.book_name, a.author_name FROM tb_bookloan_request r LEFT JOIN tb_books b ON r.book_id = b.book_id LEFT JOIN tb_authors a ON b.book_author = a.author_id where r.request_status = ?";
        values = [0];
        execute_query(select_sql,values);

    }
    else{
        res.status(401).send({message: "Unauthorized to access the API"})
    }
    function execute_query(select_sql,values){
        connection.query(select_sql, [values],(err,result)=>{
            if(err){
                res.status(412).send({message : err.sqlMessage});
            }
            else if(result.length == 0){
                res.status(412).send({message :  "No Book request found"})
            }
            else {
                res.status(200).send({message : "successs", data : result});
            }
        })
    }
}
exports.view_bookloan_request = view_bookloan_request;
