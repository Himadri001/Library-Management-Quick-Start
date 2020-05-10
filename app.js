var express         = require('express');
var http            = require('http');
var https           = require('https');
const bodyParser = require('body-parser');
const logger = require('morgan');
const jwt = require('./routes/jswt_auth');
const book = require('./routes/book');
const connection= require('./routes/connection');
const data_validation = require('./routes/validate-middleware');
const users = require('./routes/users');
const author = require('./routes/author');
const admin = require('./routes/admin');
const multer = require('multer')

const app = express();
const port = 3000
const dotenv = require('dotenv');
dotenv.config();
// var multipartMiddleware = multipart({
//     maxFilesSize: 16 * 1024 * 1024 // 16 mb
// });
//--------- block of code upload images of users starts ---------------
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './routes/images');
    },
    filename: (req, file, cb) => {
      console.log(file);
      var filetype = '';
      if(file.mimetype === 'image/gif') {
        filetype = 'gif';
      }
      if(file.mimetype === 'image/png') {
        filetype = 'png';
      }
      if(file.mimetype === 'image/jpeg') {
        filetype = 'jpg';
      }
      cb(null, 'image-' + Date.now() + '.' + filetype);
    }
});
var upload = multer({storage: storage});
// -----------------image upload block ends here -------------------------
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    var time = new Date();
    time.setMilliseconds(time.getMilliseconds()+ 5.5*60*60*1000);
    console.log('Time:', time.toString());
    console.log(req.body);
    next();
});

app.get('/jwt_token', jwt.jwt_sign);
/*
------------ Admin API ----------------------------
*/
app.post('/create_book', jwt.verifyToken, data_validation.create_book, book.create_book); // api to create book
app.post('/update_book', jwt.verifyToken, data_validation.update_book, book.update_book); // API to edit book information
app.post('/delete_book', jwt.verifyToken,data_validation.delete_book, book.delete_book);
app.get('/show_all_books', jwt.verifyToken,  book.show_all_books); //to view all the books in the house regardless of any condition
app.post('/create_admin', data_validation.admin_signup, jwt.jwt_create_admin);// for creating admin for the first time
app.post('/create_user', jwt.verifyToken, data_validation.user_signup, users.create_user);// only admin can create user
app.post('/admin_sing_in', data_validation.admin_signin, jwt.jwt_admin_signin);// the api will return new token if admin token is expired
app.post('/user_sign_in',  data_validation.user_signin, users.user_sign_in)//  the api will return new token if user token is expired
app.post('/create_author', jwt.verifyToken, data_validation.create_author, author.create_author); // Author creation API
app.post('/update_author', jwt.verifyToken, data_validation.update_author, author.update_author);//API to update author
app.post('/delete_author', jwt.verifyToken, data_validation.delete_author, author.delete_author);// API to delete author
app.get('/book_loan_report_admin', jwt.verifyToken, admin.book_loan_excel_export);
app.post('/approve_bookloan_request', jwt.verifyToken, data_validation.approve_bookloan_request,admin.approve_bookloan_request)// admin can approve request or reject with the api ; approve_status = 1 ==> approve , approve_status = 2 =====> reject 
/*
------------ End Admin API -------------------------
*/
/* -------- Book User API-------------------------
*/
app.post('/upload_image', jwt.verifyToken, upload.single('file'),   users.upload_user_image);//  to upload profile image of users 
app.post('/request_book_loan', jwt.verifyToken, data_validation.request_book_loan, users.request_book_loan)// API to request for a book loan
app.get('/view_loaned_book', jwt.verifyToken, users.view_loaned_book); //API for user to view loaned bokk
/*------------ ENd Book User API-----------------------
*/
/* 
---------------- API for both Admin and book users --------------------
*/
app.get('/show_authors', jwt.verifyToken, author.show_authors);
app.post('/browse_book',jwt.verifyToken, data_validation.browse_book, users.browse_book);
app.get('/view_bookloan_request', jwt.verifyToken, users.view_bookloan_request);
//---------------------------------------------------------------------
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
