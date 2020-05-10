var mysql = require('mysql');
const dotenv = require('dotenv');
dotenv.config();



  var connection = mysql.createPool({
    host: process.env.database_host,
    user: process.env.database_user,
    password: process.env.database_pass,
    database : process.env.DATABASE_NAME
  });
function connect(){
    connection.getConnection((err,connection)=>{
        if(err){
            throw err;
        }
        else{
            return console.log("connected");
        }
    })
}
let query = function (sql, values, callback){
    connection.getConnection((err,connection)=>{
        if(err){
            throw err;
        }
        else{
            connection.query(sql,values,(err,result)=>{
                if(err){
        
                    connection.release();
                    callback(err,null);
                    
                }
                else{
        
                    connection.release();
                    callback(null,result);
                    
                }
            }) 
        }
    })  
}
exports.query = query;  

connect();

  



  