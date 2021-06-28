const mysql = require("mysql");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


const db = mysql.createConnection({
    host : process.env.DATABASE_HOST,
    user : process.env.DATABASE_USER,
    password :process.env.DATABASE_PASSWORD,
    database : process.env.DATABASE
});

exports.login = function(req,res){
    try{
        const{email, password} = req.body;

        if(!email || !password){
            return res.status(400).render('login',{
                message:"Please provide email and password"
            })
        }
        db.query('SELECT * FROM users WHERE email= ?',[email],async(error,result)=>{
            console.log(result);
            if(!result || !(await bcrypt.compare(password, result[0].password))){
                res.status(401).render('login',{
                    message:"Email or password is incorrect"
                })
            }
            else{
                const id = result[0].id;
                const token = jwt.sign({id}, process.env.JWT_SECRET,{
                    expiresIn: process.env.JWT_EXPIRES_IN
                });
                console.log("The token is"+token);
                const cookiesOption ={
                    expires: new Date (
                        Date.now()+ process.env.JWT_COOKIES_EXPIRES*24*60*60
                    ),
                    httpOnly: true
                    
                }
                res.cookie('jwt',token,cookiesOption);
                res.status(200).redirect('/'); 
            }
        })
    }
    catch(error){
        console.log(error);
    }
}

exports.register = function(req,res){
    console.log(req.body);

    const{name ,email, password, passwordConfirm} =req.body;

    db.query('SELECT email FROM users WHERE email = ?',[email],async(error,result)=>{
        if(error){
            console.log(error);
        }
        if(result.length > 0)
        {
            return res.render('register',{
                message:'the email is aleready taken'
            });
        }
        else if(password !== passwordConfirm){
            return res.render('register',{
                message: 'Password Do not match'

            });
        }

               
        let hashedPassword = await bcrypt.hash(password, 4);
        console.log(hashedPassword);
        
        db.query('INSERT INTO users SET ?',{name: name , email:email, password:hashedPassword},(error,result)=>{
            if(error)
            {
                console.log(error);
            }
            else{
                console.log(result);
                return res.render('register',{
                    message:'User Registered'
                });
            }
        });

    });

}