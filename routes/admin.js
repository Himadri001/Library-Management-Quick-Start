const excel = require('node-excel-export');
const async = require('async');
const connection = require('./connection');
const users = require('./users');
const book = require('./book');

let book_loan_excel_export = (req,res)=>{
    if(req.headers['role'] != 'admin'){
        res.status(401).send({
            message : "Unauthorized to acess the API"
        })
    }
    else{
        const styles = {
            headerDark: {
              fill: {
                fgColor: {
                  rgb: 'FF000000'
                }
              },
              font: {
                color: {
                  rgb: 'FFFFFFFF'
                },
                sz: 14,
                bold: true,
                underline: true
              }
            },
            cellPink: {
              fill: {
                fgColor: {
                  rgb: 'FFFFCCFF'
                }
              }
            },
            cellGreen: {
              fill: {
                fgColor: {
                  rgb: 'FF00FF00'
                }
              }
            }
          };
      //Here you specify the export structure
    const specification = {
        loan_id: { // <- the key should match the actual data key
          displayName: 'Loan Id', // <- Here you specify the column header
          headerStyle: styles.headerDark, // <- Header style
          width: 100 // <- width in pixels
        },
        user_id: {
          displayName: 'User ID',
          headerStyle: styles.headerDark,
          width: 100 // <- width in chars (when the number is passed as string)
        },
        user_name: {
          displayName: 'User Name',
          headerStyle: styles.headerDark,
          cellStyle: styles.cellPink, // <- Cell style
          width: 220 // <- width in pixels
        },
        book_id: {
            displayName: 'Book ID',
            headerStyle: styles.headerDark,
            width: 100 // <- width in chars (when the number is passed as string)
          },
          book_name: {
            displayName: 'Book Name',
            headerStyle: styles.headerDark,
            cellStyle: styles.cellPink, // <- Cell style
            width: 220 // <- width in pixels
          },
          author_id: {
            displayName: 'Author ID',
            headerStyle: styles.headerDark,
            width: 100 // <- width in chars (when the number is passed as string)
          },
          author_name: {
            displayName: 'Author Name',
            headerStyle: styles.headerDark,
            cellStyle: styles.cellPink, // <- Cell style
            width: 220 // <- width in pixels
          },
          loan_date: {
            displayName: 'Loan Date',
            headerStyle: styles.headerDark,
            width: 120 // <- width in pixels
          },
          loan_status: {
            displayName: 'Loan status',
            headerStyle: styles.headerDark,
            cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
                return (value == 1) ? 'Active' : 'Inactive';
              },
            width: 100 // <- width in pixels
          }
      }
    
      var dataset = [];
      loan_report_query((err,result)=>{
          if(err){
                res.status(412).send({message : err.message});
          }
          else{
            async.eachSeries(result, function iteratee(element, callback) {
                let temp_data = {
                    loan_id : element.loan_id,
                    user_id : element.user_id,
                    user_name : element.user_name,
                    book_id : element.book_id || 0,
                    book_name : element.book_name ||"NA" ,
                    author_id : element.author_id || 0,
                    author_name : element.author_name || "NA",
                    loan_date : element.loan_date,
                    loan_status : element.loan_status
                }
                dataset.push(temp_data);
                async.setImmediate(callback);
            },function(err){
                if(err){
    
                }
                else{
                    // const merges = [
                    //     { start: { row: 1, column: 1 }, end: { row: 1, column: 8 } },
                    //     { start: { row: 2, column: 1 }, end: { row: 2, column: 8 } },
                    //     { start: { row: 2, column: 6 }, end: { row: 2, column: 8 } }
                    //   ]
                    const report = excel.buildExport(
                        [ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report
                          {
                            //heading : heading,  
                            specification: specification, // <- Report specification
                            data: dataset // <-- Report data
                          }
                        ]
                      );
                      res.attachment('report.xlsx');
                      console.dir(res);
                      res.status(200).send( report);
                }
            })
          }
            
    })
      function loan_report_query(callback){
        let select_sql = " SELECT l.loan_id, l.loan_date, l.loan_status, u.user_id, u.user_name, b.book_id, b.book_name, a.author_id, a.author_name FROM tb_bookloan l LEFT JOIN tb_users u ON l.user_id = u.user_id LEFT JOIN tb_books b ON l.book_id = b.book_id LEFT JOIN tb_authors a ON b.book_author = a.author_id";
        connection.query(select_sql,(err,result)=>{
            if(err){
                callback({message: err},null);
            }
            else if(result.length == 0 ){
                callback({message : "No Data Found"},null);
            }
            else{
                callback(null,  result);
            }
        })
      }
    }
};
exports.book_loan_excel_export = book_loan_excel_export;

let approve_bookloan_request = (req, res) => {
  if (req.headers['role'] != 'admin') {
    res.status(401).send({
      message: "Unauthorized to acess the API"
    })
  }
  else {
    users.active_request_check(req.body.book_id, (no_request, request_record) => {
      if (no_request) {
        res.status(412).send({ message: no_request.message })
      }
      else if (request_record) {
        book.book_exists_check(req.body.book_id, (err, bookid_result) => {
          if (err) {
            res.status(412).send({ message: err.message })
          }
          else if (bookid_result) {
            if (req.body.approve_status == 1 || req.body.approve_status == 2) {
              update_loan_request(request_record.request_id, req.body.approve_status, (err, update_result) => {
                if (err) {
                  res.status(412).send({ message: err.message });
                }
                else {
                  if (req.body.approve_status == 1) {
                    let insert_sql = "INSERT INTO tb_bookloan (book_id,user_id,loan_status,request_id) VALUES (?,?,?,?)";
                    connection.query(insert_sql, [req.body.book_id, request_record.user_id, 0, request_record.request_id], (err, result) => {
                      if (err || result.affectedRows == 0) {
                        res.status(412).send({ message: "Execution error in inserting loan data" });
                      }
                      else {
                        res.status(200).send({ message: "Book Loan Approved" })
                      }
                    })
                  }
                  else {
                    res.status(200).send({ message: "Book loan rejected" })
                  }
                }
              })
            }
            else {
              res.status(412).send({ message: "Approve status should be between 1 & 2" });
            }
          }
        })
      }
    });
  }
}
exports.approve_bookloan_request = approve_bookloan_request;

let update_loan_request =(request_id,status,callback)=>{
    let update_sql = "UPDATE tb_bookloan_request SET request_status = ? WHERE request_id = ?";
    connection.query(update_sql, [status,request_id],(err,result)=>{
        if(err){
            callback({message : err.sqlMessage},null);
        }
        else if(result.affectedRows == 0){
            callback({message : "No update occured"},null);
        }
        else{
            callback(null,{message : "Request Updated"})
        }
    })
}