const connection = require('./connection');
const author = require('./author');
const excel = require('node-excel-export');
const async = require('async');
const users = require('./users');

var create_book = (req,res)=>{
    if(req.headers['role'] != 'admin'){
        res.status(401).send({
            message : "Unauthorized to acess the API"
        })
    }
    
    author.author_check(req.body.book_author, (err,author_exists)=>{
        if(err){
            res.status(412).send({message : err.message})
        }
        else if(author_exists){
            let sql = "INSERT INTO tb_books (book_name,book_author) VALUES (?,?);";
            connection.query(sql,[req.body.book_name,req.body.book_author],(err,result)=>{
                if(err){
                    res.status(412).send({
                        message : err.sqlMessage
                    })
                }
                else{
                    res.status(200).send({
                        message : "success",
                        data : result
                    })
                }
            })
        }
        else{
            res.status(500).send({message : "Error in execution"})
        }
    })
}
exports.create_book = create_book;

let show_all_books = (req,res)=>{
    
    let sql = "SELECT * from tb_books";
    connection.query(sql,(err,result)=>{
        if(err){
            res.status(412).send({
                message : err.sqlMessage
            })
        }
        else{
            res.status(200).send({
                message : "Success",
                data : result
            })
        }
    })
}
exports.show_all_books = show_all_books;

let update_book = (req,res)=>{
    if(req.headers['role'] != 'admin'){
        res.status(401).send({
            message : "Unauthorized to acess the API"
        })
    }
    else{
        let update_sql = " ";
        let values = [];
         if(req.body.book_name && req.body.book_author){
            author.author_check(req.body.book_author, (err,author_exists)=>{
                if(err){
                    res.status(412).send({message: err.message});
                }
                else{
                    update_sql = "UPDATE tb_books set book_name = ?,book_author = ? where book_id = ?"
                    values = [req.body.book_name, req.body.book_author, req.body.book_id];
                    execute_update_query(update_sql,values);
                }
            })
        }
        else if(req.body.book_name){
                    update_sql = "UPDATE tb_books set book_name = ? where book_id = ?";
                    values = [req.body.book_name, req.body.book_id];
                    execute_update_query(update_sql,values);
       }
       else if(req.body.book_author){
            author.author_check(req.body.book_author, (err,author_exists)=>{
                if(err){
                    res.status(412).send(err.message);
                }
                else{
                    update_sql = "UPDATE tb_books set book_author = ? where book_id = ?";
                    values = [req.body.book_author, req.body.book_id];
                    execute_update_query(update_sql,values);
                }
            });
       }
       else{
           res.status(412).send({message : "All the update fields can not be null"})
       }
      function  execute_update_query(update_sql,values){
            connection.query(update_sql,values,(err,result)=>{
                if(err){
                    res.status(412).send({
                        message : err.sqlMessage
                    })
                }
                else if(result.affectedRows == 0){
                    res.status(412).send({
                        message : "Book doest not exist"
                    }) 
                }
                else{
                    res.status(200).send({message : "Book Update Success"})
                }
            })
        }
    }
}
exports.update_book = update_book;

let delete_book = (req,res)=>{
    if(req.headers['role'] != 'admin'){
        res.status(401).send({
            message : "Unauthorized to acess the API"
        })
    }
    else{
         book_loan_check(req.body.book_id,(err,result)=>{ // to check if the book is borrowed by any user or not
             if(err){
                 res.status(412).send({message : err.message});
             }
             else if(result){
                let delete_sql = "DELETE FROM tb_books WHERE book_id = ?";
                connection.query(delete_sql,[req.body.book_id],(err,result)=>{
                    if(err){
                        res.status(412).send({
                            message : err.sqlMessage
                        })
                    }
                    else if(result.affectedRows == 0){
                        res.status(412).send({
                            message : "Book doest not exist"
                        }) 
                    }
                    else{
                        console.log("Query executed");
                        res.status(200).send({message : "Book deleted Successfully"})
                    }
                })
             }
             else{
                req.status(412).send({message : "Execution error"});
             }
         });
    } 
}
exports.delete_book = delete_book;

let book_loan_check = (book_id,callback)=>{
    if(book_id) {
        let select_sql = "SELECT * from tb_bookloan where book_id = ? and loan_status = ?"; //loan_status = 0 means the book is currently borrowed by a book user which is not returned yet. 
        connection.query(select_sql,[book_id,0],(err,result)=>{
            if(err){
                callback({message :err}, null);
            }
            else if(result.length ==0 ){

                callback({message : "Active loan record does not exit"},null);
            }
            else{
                callback(null, {message : "Active loan record exists "});
            }
        })
    }
    else{
        callback({message : "book id required"},null);
    }
}
exports.book_loan_check = book_loan_check;
// let book_loan_excel_export = (req,res)=>{
//     const styles = {
//         headerDark: {
//           fill: {
//             fgColor: {
//               rgb: 'FF000000'
//             }
//           },
//           font: {
//             color: {
//               rgb: 'FFFFFFFF'
//             },
//             sz: 14,
//             bold: true,
//             underline: true
//           }
//         },
//         cellPink: {
//           fill: {
//             fgColor: {
//               rgb: 'FFFFCCFF'
//             }
//           }
//         },
//         cellGreen: {
//           fill: {
//             fgColor: {
//               rgb: 'FF00FF00'
//             }
//           }
//         }
//       };
//   //Here you specify the export structure
// const specification = {
//     loan_id: { // <- the key should match the actual data key
//       displayName: 'Loan Id', // <- Here you specify the column header
//       headerStyle: styles.headerDark, // <- Header style
//       width: 100 // <- width in pixels
//     },
//     user_id: {
//       displayName: 'User ID',
//       headerStyle: styles.headerDark,
//       width: 100 // <- width in chars (when the number is passed as string)
//     },
//     user_name: {
//       displayName: 'User Name',
//       headerStyle: styles.headerDark,
//       cellStyle: styles.cellPink, // <- Cell style
//       width: 220 // <- width in pixels
//     },
//     book_id: {
//         displayName: 'Book ID',
//         headerStyle: styles.headerDark,
//         width: 100 // <- width in chars (when the number is passed as string)
//       },
//       book_name: {
//         displayName: 'Book Name',
//         headerStyle: styles.headerDark,
//         cellStyle: styles.cellPink, // <- Cell style
//         width: 220 // <- width in pixels
//       },
//       author_id: {
//         displayName: 'Author ID',
//         headerStyle: styles.headerDark,
//         width: 100 // <- width in chars (when the number is passed as string)
//       },
//       author_name: {
//         displayName: 'Author Name',
//         headerStyle: styles.headerDark,
//         cellStyle: styles.cellPink, // <- Cell style
//         width: 220 // <- width in pixels
//       },
//       loan_date: {
//         displayName: 'Loan Date',
//         headerStyle: styles.headerDark,
//         width: 120 // <- width in pixels
//       },
//       loan_status: {
//         displayName: 'Loan status',
//         headerStyle: styles.headerDark,
//         cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
//             return (value == 1) ? 'Active' : 'Inactive';
//           },
//         width: 100 // <- width in pixels
//       }
//   }

//   var dataset = [];
//   loan_report_query((err,result)=>{
//       if(err){
//             res.status(412).send({message : err.message});
//       }
//       else{
//         async.eachSeries(result, function iteratee(element, callback) {
//             let temp_data = {
//                 loan_id : element.loan_id,
//                 user_id : element.user_id,
//                 user_name : element.user_name,
//                 book_id : element.book_id || 0,
//                 book_name : element.book_name ||"NA" ,
//                 author_id : element.author_id || 0,
//                 author_name : element.author_name || "NA",
//                 loan_date : element.loan_date,
//                 loan_status : element.loan_status
//             }
//             dataset.push(temp_data);
//             async.setImmediate(callback);
//         },function(err){
//             if(err){

//             }
//             else{
//                 // const merges = [
//                 //     { start: { row: 1, column: 1 }, end: { row: 1, column: 8 } },
//                 //     { start: { row: 2, column: 1 }, end: { row: 2, column: 8 } },
//                 //     { start: { row: 2, column: 6 }, end: { row: 2, column: 8 } }
//                 //   ]
//                 const report = excel.buildExport(
//                     [ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report
//                       {
//                         //heading : heading,  
//                         specification: specification, // <- Report specification
//                         data: dataset // <-- Report data
//                       }
//                     ]
//                   );
//                   res.attachment('report.xlsx');
//                   console.dir(res);
//                   res.status(200).send( report);
//             }
//         })
//       }
        
// })
//   function loan_report_query(callback){
//     let select_sql = " SELECT l.loan_id, l.loan_date, l.loan_status, u.user_id, u.user_name, b.book_id, b.book_name, a.author_id, a.author_name FROM tb_bookloan l LEFT JOIN tb_users u ON l.user_id = u.user_id LEFT JOIN tb_books b ON l.book_id = b.book_id LEFT JOIN tb_authors a ON b.book_author = a.author_id";
//     connection.query(select_sql,(err,result)=>{
//         if(err){
//             callback({message: err},null);
//         }
//         else if(result.length == 0 ){
//             callback({message : "No Data Found"},null);
//         }
//         else{
//             callback(null,  result);
//         }
//     })
//   }

// };
// exports.book_loan_excel_export = book_loan_excel_export;

let book_exists_check = (book_id,callback)=>{
 if(book_id) {
     let select_sql = "SELECT * FROM tb_books WHERE book_id = ?";
     connection.query(select_sql,[book_id],(err,result)=>{
         if(err){
             callback({message : err},null);
         }
         else if(result.length == 0) {
             callback({message: "Book does not exist"},null);
         }
         else{
             callback(null,{message : "Book exists "});
         }
     })
 }
}
exports.book_exists_check = book_exists_check;

