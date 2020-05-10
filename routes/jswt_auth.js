const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const connection = require('./connection');
const dotenv = require('dotenv');
dotenv.config();
const jwt_secret = process.env.jwt_secret;
let jwt_sign = function (user_id, role) {
  var token = jwt.sign({
    id: user_id,
    role : role,
  }, jwt_secret, {
    expiresIn: 86400 // expires in 24 hours
  });
return token; 
};
exports.jwt_sign = jwt_sign;

let jwt_create_admin = (req,res)=>{
    let admin_name = req.body.admin_name;
    let admin_pass = req.body.admin_pass;
    let admin_email = req.body.admin_email;
     bcrypt.hash(admin_pass, 10, function(err, admin_pass) {
        let insert_sql = "INSERT INTO tb_users (user_name,user_email,user_password,user_role) VALUES (?,?,?,?)";
        connection.query(insert_sql,[admin_name,admin_email,admin_pass,'admin'],(err,result)=>{
          if(err){
            res.status(412).send({
                message : err.sqlMessage
            })
        }
            else{
                res.status(200).send({
                    message : "success, Please signin to get verified",
                    admin_id : result.insertId
                })
            }
        });   
    });
}
exports.jwt_create_admin = jwt_create_admin;

let jwt_admin_signin = (req,res)=>{
    let admin_email = req.body.admin_email;
    let admin_pass = req.body.admin_pass;
    let select_sql = "SELECT * from tb_users WHERE user_email = ?";
    connection.query(select_sql,[admin_email],(err,result)=>{
      if(err){
        res.status(412).send({
            message : err.sqlMessage
        })
    }
        else{
            bcrypt.compare(admin_pass, result[0].user_password, function(err, match_result) {
                if(err){
                    res.status(401).send(err);
                }
                else{
                    let token = jwt.sign({
                        id : result[0].user_id,
                        role : 'admin'
                    },jwt_secret,{
                        expiresIn: 86400 
                    });
                    res.status(200).send({
                        message : "success",
                        token : token,
                        admin_id : result[0].user_id
                    })
                }
            });
        }
    })
}
exports.jwt_admin_signin = jwt_admin_signin;

let verifyToken = function (req, res, next) {

  if (req.method === 'OPTIONS') {
    return res.status(200).send();
  } else {
    var token = req.headers['authorization'];
    console.log("THE TOKEN IS-==============" + token);
    if (!token) return res.status(401).send({
      auth: false,
      message: 'No token provided.'
    });

    jwt.verify(token, jwt_secret, function (err, decoded) {
      console.log("ERRRRRRR=============" + err + token);
      if (err) return res.status(401).send({
        auth: false,
        message: 'Failed to authenticate token.'
      });
      req.headers['role'] = decoded.role;
      req.headers['user_id'] = decoded.id;
     // console.log("user id===" + req.body.user_id);
      next();
    });
  }

};
exports.verifyToken = verifyToken;