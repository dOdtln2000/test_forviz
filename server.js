const express = require('express')
const mysql = require('mysql')

const app = express();
app.use(express.json());

const connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password: '',
    database: 'manage-book'
})

connection.connect((err) => {
   if(err){
       console.log('Error connecting to MySQL db =',err)
       return;
   } 
   console.log('MySQL successfully connected!');
})

app.get("/read", async (req, res) => {
    try {
        connection.query("SELECT * FROM book INNER JOIN author ON book.auth_id = author.auth_id", (err, results, fields) => {
            if (err) {
                console.log(err);
                return res.status(400).send();
            }
            res.status(200).json(results)
        })
    } catch(err) {
        console.log(err);
        return res.status(500).send();
    }
})

app.post("/create", async(req,res) => {
    var book = req.body;
    var author = req.body.author;
    try{
        var selectAuth = "SELECT * FROM author WHERE auth_name='"+author.name+"'";
        connection.query(selectAuth,(err,result,fields) => {
            if(result.length>0){
                var addBook = "INSERT INTO book(book_name, genre,auth_id) VALUES('" + book.name + "','" + book.genre + "','"+result[0].auth_id+"')"
                connection.query(addBook,(err,results,fields) => {
                        if (err) {
                            console.log("Error while inserting a book into the database", err);
                            return res.status(400).send();
                        }
                        return res.status(201).json({ message: "New book successfully created!"});
                    }
                )
            }
            else{
                var addAuth = "INSERT INTO author(auth_name,auth_gender) VALUES ('"+author.name+"','"+author.gender+"')"
                connection.query(addAuth,(err,result,fields) => {
                    if(!err){
                        connection.query(selectAuth,(err,result,fields) => {
                            if(result.length>0){
                                var addBook = "INSERT INTO book(book_name, genre,auth_id) VALUES('" + book.name + "','" + book.genre + "','"+result[0].auth_id+"')"
                                connection.query(addBook,(err,result,fields) => {
                                    if (err) {
                                        console.log("Error while inserting a book into the database", err);
                                        return res.status(400).send();
                                    }
                                    return res.status(201).json({ message: "New book successfully created!"});
                                })
                            }
                        })
                    }
                    
                })
            }   
        })
    } catch(err){
        console.log(err);
        return res.status(500).send();
    }
})

app.patch("/updateBook/:bid", async (req, res) => {
    var book_id = req.params.bid;
    var newBname = req.body.newBookName;
    var newGenre = req.body.newGenre;
    try {
        if(!isNaN(Number(book_id))){
          connection.query("UPDATE book SET book_name = '"+newBname+"',genre = '"+newGenre+"' WHERE book_id = '"+book_id+"'",
            (err, results, fields) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                res.status(200).json({ message: "Book updated successfully!"});
            })  
        }
        else{
            res.status(400).json({ err: "Something wrong!!"})
        }
    } catch(err) {
        console.log(err);
        return res.status(500).send();
    }
})

app.patch("/updateAuth/:auth_id", async (req, res) => {
    var auth_id = req.params.auth_id;
    var newAuthname = req.body.newAuthName;
    var newGender = req.body.newGender;
    try {
        if(!isNaN(Number(auth_id))){
            connection.query("UPDATE author SET auth_name = '"+newAuthname+"',auth_gender = '"+newGender+"' WHERE auth_id = '"+auth_id+"'", (err, results, fields) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                res.status(200).json({ message: "Author updated successfully!"});
            })
        }
        else{
            res.status(400).json({ err: "Something wrong!!"})
        }
    } catch(err) {
        console.log(err);
        return res.status(500).send();
    }
})

app.delete("/deleteBook/:bid", async (req, res) => {
    var book_id = req.params.bid;

    try {
        if(!isNaN(Number(book_id))){
            connection.query("DELETE FROM book WHERE book_id = '"+book_id+"'", (err, results, fields) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                if (results.affectedRows === 0) {
                    return res.status(404).json({ message: "Error. Try Again"});
                }
                return res.status(200).json({ message: "Book deleted successfully!"});
            })
        }
        else{
            res.status(400).json({ err: "Something wrong!!"})
        }
    } catch(err) {
        console.log(err);
        return res.status(500).send();
    }
})

app.delete("/deleteAuth/:auth_id", async (req, res) => {
    var auth_id = req.params.auth_id;

    try {
        if(!isNaN(Number(auth_id))){
            connection.query("DELETE FROM author WHERE auth_id = '"+auth_id+"'", (err, results, fields) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                if (results.affectedRows === 0) {
                    return res.status(404).json({ message: "Error. Try Again"});
                }
                return res.status(200).json({ message: "Author deleted successfully!"});
            })
        }
        else{
            res.status(400).json({ err: "Something wrong!!"})
        }
    } catch(err) {
        console.log(err);
        return res.status(500).send();
    }
})

app.listen(3000, () => console.log('Server is running on port 3000'));