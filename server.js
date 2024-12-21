var express=require("express");
var bodyparser=require("body-parser");
var path=require("path");
const mongoose =require("mongoose");
var app=express();
app.use(express.static(__dirname));
app.use(bodyparser.json());
const port=3000;
// schema
// connection

//-------------------mysql database connection>
require('dotenv').config();
const mysql=require("mysql");
const db = mysql.createConnection({
    host:'bbm7sqkbecqsgvdiopj7-mysql.services.clever-cloud.com', // Ensure this is your actual database hostname from Render
    user: "uc0pbkn6ud8bi0mu",               // Replace with actual MySQL username
    password:  "0VUI2zprtAD7e1x5TIDS",       // Replace with actual MySQL password
    database: "bbm7sqkbecqsgvdiopj7",     // Replace with actual database name
    port: 3306                          // Default MySQL port
});


db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
        return;
    }
    console.log("Connected to MySQL database");

    // Create the `todos` table if it doesn't exist
 

   
});


//--------------------------------mysql database connection START>
//--------------------------------PAGE load>
app.get('/users',(req,res)=>{
    res.sendFile(path.join(__dirname, "views", "signup.html"));
});
app.get('/login',(req,res)=>{
    res.sendFile(path.join(__dirname, "views", "login.html"));
});
app.get('/maintenance',(req,res)=>{
    res.sendFile(path.join(__dirname, "views", "maintenance.html"));
});
app.get('/feedback',(req,res)=>{
    res.sendFile(path.join(__dirname, "views", "rating.html"));
});
app.get('/monitering',(req,res)=>{
    res.sendFile(path.join(__dirname, "views", "monitering.html"));
});
app.get("/data",(req,res)=>{
    const sql = "SELECT * FROM users";
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error executing SQL query:', err.message);
            res.status(500).send({ error: 'Failed to fetch data' });
        } else {
            res.status(200).send(results);
        }
    });
})

//--------------------------------todo get load>
app.get("/api/todolist/:id",(req,res)=>{
    const userId=req.params.id;
    const sql="SELECT * from tasks WHERE user_id = ? order by id DESC";
    db.query(sql,[userId],(err,result)=>{
        if (err) {
            console.error("Error querying database:", err);
            return res.status(500).json({ message: "Failed to fetch todo list" });
        }
     
        if(result.length===0){
            res.json({message:"Your to-do list is empty!  Let's get productive and add your first task!"});
        }else{
            res.json(result);
        }
    })
});



//--------------------------------post load>
app.post("/api/todolist/:id",(req,res)=>{
    const userId=req.params.id;
    var {name, description,date}=req.body;
    var sql="insert into tasks (name,user_id,description,date) VALUES (?,?,?,?)";
    db.query(sql,[name,userId,description,date],(err,result)=>{
        if(err){
            res.status(500).json({message:err.message});
        }
        else{
            res.status(200).json({message:"todo added successfully"});
        }
    });
})
app.post("/api/feedback", (req, res) => {  // Corrected route path
    const { user_id, comment, rating } = req.body;

    // Validate the received data (basic validation)
    if (!user_id || !comment || !rating) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    const sql = "INSERT INTO Feedback (user_id, comment, rating) VALUES (?, ?, ?)";
    
    db.query(sql, [user_id, comment, rating], (err, result) => {
        if (err) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(200).json({ message: "Thanks for your feedback" });
        }
    });
});

//--------------------------------updateload>
app.put('/api/todolist/:id',(req,res)=>{
    const todoId=req.params.id;
    var {status}=req.body;
    var sql="update tasks SET status=? where id=?";
    db.query(sql,[status,todoId],(err,result)=>{
        if(err){
            res.status(500).json({error:err.message});

        }else{
            res.status(200).json({message: "Todo updated successfully"});
        }
    });
})

app.delete('/api/todolist/:id', (req, res) => {
    const todoId = req.params.id;

    // SQL query to delete the todo
    const sql = "DELETE FROM tasks WHERE id = ?";
    db.query(sql, [todoId], (err, result) => {
        if (err) {
            console.log(err);  // Log the error on the server side
            res.status(500).json({ error: err.message });
        } else {
            if (result.affectedRows === 0) {  // Check if the row exists
                return res.status(404).json({ message: "Todo not found" });
            }
            res.status(200).json({ message: "Todo deleted successfully" });
        }
    });
});
//---------------------------------sigup>
app.post("/newuser/todo",(req,res)=>{
    const {name,email,password_hash}=req.body;
    var sql="insert into users (name,email,password_hash) VALUES (?,?,?)";
    db.query(sql,[name,email,password_hash],(err,result)=>{
        if(err){
            res.status(500).json({message:err.message});
        }
        else{
            res.status(200).json({message:"User signed up successfully!"});
        }
    })

})
app.post("/login",(req,res)=>{
    const {email,pwd}=req.body;
    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], (err, result) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        console.log(result);
        if (result.length === 0) {
            // No user found with the provided email
            return res.status(404).json({ message: "Invalid email or password." });
        }

        const user = result[0];

        // Verify the password
        if (user.password_hash !== pwd) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        // Successful login
        res.status(200).json({
            message: "Login successful!",
            user: { id: user.id, name: user.name, email: user.email },
        });
    });

})

//--------------------------------listen>
app.listen(port,()=>{
    console.log("good sucess bro!");
}); 



