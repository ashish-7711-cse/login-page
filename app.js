const express = require("express");
const mysql = require("mysql");
const dotenv = require("dotenv");
const path = require('path');
const cookiesParser = require('cookie-parser');

dotenv.config({paht: './.env'});

const app = express();


const db = mysql.createConnection({
    host : process.env.DATABASE_HOST,
    user : process.env.DATABASE_USER,
    password :process.env.DATABASE_PASSWORD,
    database : process.env.DATABASE
});

const publicDirectory = path.join(__dirname,'./public');
console.log(__dirname);
app.use(express.static(publicDirectory));

app.set('view engine','hbs');

db.connect(function(error){
    if(error){
        console.log(error)
    }
    else{
        console.log("Mysql Connected...")
    }
})


app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cookiesParser());


app.use('/',require('./routes/pages'));
app.use('/auth',require('./routes/auth'));

app.listen(5001,function(){
    console.log("Server is running");
})