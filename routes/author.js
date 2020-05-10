const connection = require('./connection');

let create_author = (req,res)=>{
    if(req.headers['role'] != 'admin'){
        res.status(401).send({message: "Unauthorized to access the API"});
    }
    else{
        let insert_sql = "INSERT INTO tb_authors (author_name) VALUES (?)";
        connection.query(insert_sql,[req.body.author_name],(err,result)=>{
            if(err){
                res.status(412).send({
                    message : err.sqlMessage
                })
            }
            else{
                res.status(200).send({message : "Author creation successful"});
            }
        })
    }
}
exports.create_author = create_author;

let update_author = (req,res)=>{
    if(req.headers['role'] != 'admin'){
        res.status(401).send({message: "Unauthorized to access the API"});
    }
    else{
        if(req.body.author_name){
            let update_author = "UPDATE tb_authors set author_name = ? WHERE author_id = ?";
            connection.query(update_author,[req.body.author_name,req.body.author_id],(err,result)=>{
                console.dir(result);
                if(err){
                    res.status(412).send({
                        message : err.sqlMessage
                    })
                }
                else{
                    if(result.affectedRows == 0){
                        res.status(412).send({message : "Author does not exist"})
                    }
                    else{
                        res.status(200).send({message : "Author information updated"})
                    }
                }
            })
        }
        else{
            res.status(412).send({message : "Author Name Required"});
        }
    } 
}
exports.update_author = update_author;

let delete_author = (req,res)=>{
    if(req.headers['role'] != 'admin'){
        res.status(401).send({message: "Unauthorized to access the API"});
    }
    else{
        authors_book_availabe_check(req.body.author_id, (err,result)=>{ // to check weather author have books in his name, if yes then deleting author will create problem in book loan
            if(err){
                res.status(412).send({message : err.message})
            }
            else{
            check_bookloanof_author_before_delete_author (req.body.author_id,(err,result)=>{// to check if any book a the author is in loan.
                if(err){
                    res.status(412).send({message : err.message})
                }
                else{
                    let delete_sql = "DELETE FROM tb_authors WHERE author_id= ? ";
                    connection.query(delete_sql,[req.body.author_id],(err,result)=>{
                        if(err){
                            res.status(412).send({
                                message : err.sqlMessage
                            })
                        }
                       else if(result.affectedRows == 0){
                             res.status(412).send({message : "Author does not exist"})
                           }
                        else{
                            res.status(200).send({message : "Author Deleted"})
                        }
                    })
                }
            })
                
            }
        })
    } 
}
exports.delete_author =delete_author;

let show_authors = (req,res)=>{
    if(req.headers['role'] == 'admin' || req.headers['role'] == 'book user'){
        if(req.body.author_id){
            let select_sql = "SELECT * FROM tb_authors WHERE author_id = ?";
            connection.query(select_sql,[author_id],(err,result)=>{
                if(err){
                    res.status(412).send({
                        message : err.sqlMessage
                    })
                }
                else if(result.length == 0) {
                    res.status(412).send({message : "No Author Found"});
                }
                else{
                    res.status(200).send({message : "Success", data : result});
                }
            })  
        }
        else{
            let select_sql = "SELECT * FROM tb_authors";
            connection.query(select_sql,(err,result)=>{
                if(err){
                    res.status(412).send({
                        message : err.sqlMessage
                    })
                }
                else if(result.length == 0) {
                    res.status(412).send({message : "No Author Found"});
                }
                else{
                    res.status(200).send({message : "Success", data : result});
                }
            })
        }
    }
    else{
        res.status(412).send({message : "Unauthorized to access the API"})
    }
}
exports.show_authors = show_authors;

var author_check = function (author_id,callback){
   // console.log(author_id);
   var author_exists = 0;
    let select_sql = "SELECT * FROM tb_authors where author_id = ?";
    connection.query(select_sql,[author_id],(err,result)=>{
        if(err) {
            callback({message : err.sqlMessage},null);
        }
        else if(result.length == 0){
             callback({message : "Admin does not exist"},null);
        }
        else{
            author_exists = 1;
            console.dir( result[0]);
            callback(null,author_exists);
        }
       
    });
    
}
exports.author_check = author_check;

let check_bookloanof_author_before_delete_author = (author_id,callback)=>{
    if(author_id){
        let select_sql = "SELECT l.loan_id, l.loan_date, l.loan_status, u.user_id, u.user_name, b.book_id, b.book_name, a.author_id, a.author_name FROM tb_bookloan l LEFT JOIN tb_users u ON l.user_id = u.user_id LEFT JOIN tb_books b ON l.book_id = b.book_id LEFT JOIN tb_authors a ON b.book_author = a.author_id WHERE a.author_id = ?";
        connection.query(select_sql,[author_id],(err,result)=>{
            if(err){
                callback({message : "Execution Error"},null);
            }
            else if(result.length == 0){
                callback(null,{message : "Auhor can be deleted"});
            }
            else{
                callback({message: "Author's book is loan, can not delete author"},null);
            }
        })
    }
}

let authors_book_availabe_check = (author_id,callback)=>{
    if(author_id){
        let select_sql = "SELECT * from tb_books WHERE book_author = ?";
        connection.query(select_sql,[author_id],(err,result)=>{
            if(err){
                callback({message: "Error in execution"},null);
            }
            else if(result.length == 0){
                callback(null,{message : "Author can be deleted"});
            }
            else{
                callback({message :  "Book is availabe in author's name "},null);
            }
        })
    }
}

