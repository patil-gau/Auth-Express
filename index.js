require('dotenv').config();
const express = require('express');
const User = require('./models/user');
require('./config/database').connection()
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const authMiddleware = require('./middlewares/auth');
const nodemailer = require("nodemailer");


const PORT = process.env.PORT
const secret = process.env.SECRET_KEY

//create a app object
const app = express();

//add middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}))


let transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASSWORD
    },
  });


//Register a user endpoints
//Steps:
   //1.create a endpoint with post method
   //2.create a function to handle the request
   //3. grab all the data coming from the clinet in req body
   //4.check if all data is present
   //5.check if user already exists
   //6.hash the password
   //7.create a user object
   //8.save the user object
app.post("/register",async(req,res)=>{

    //grab the data coming from client
    const {email,password,firstname,lastname,phone} = req.body;

    //check if data is present
    if(!email || !password || !firstname || !lastname || !phone){
        return res.status(400).json({msg:"Please enter all the fields"})
    }

    //check if user already exists
    const user = await User.findOne({email})
    if(user){
        return res.status(400).json({msg:"User already exists"})
    }

    //hash the password
    const encPass = await bcrypt.hash(password,10)

    


    //create a user object
    const newUser = new User({email,password:encPass,firstname,lastname,phone})

    // save the user object
    await newUser.save((err,user)=>{
        if(!err){
            return res.status(200).json({msg:"User created successfully"})
        }
        else{
            return res.status(500).json({msg:"Something went wrong , please try again"})
        }

    })
    
})


//login feature
//Steps:
   //1.create a endpoint with Post method
   //2.create a function to handle that endpoint
   //3.grab the data (username and password) from the client
   //4.check if email exists then check for password => using compare function
   //5.if email doesnot exists return error
   //6.if password is wrong return error
   //7. else logged in success 
   //8. generate a token and send it to user
   
app.post('/login',async(req,res)=>{

const {email,password} = req.body;
const user = await User.findOne({email});
if(!user){
    return res.status(400).json({"message":"email address is not registered"})  
}


bcrypt.compare(password,user.password,async function(err,result){
    if(result){
        //generate a token
       const token  = jwt.sign({"email":user.email},secret,{expiresIn:'1h'})
       console.log(token)
       user.password = undefined;
       user.token = token 

       return res.status(200).json({msg:"Logged in successfully",user:user})
    }
    else{
        return res.status(400).json({msg:"Incorrect password"})
    }
})





})


//instagram home page feed route
app.get('/feed',authMiddleware,(req,res)=>{
    console.log("i am inside feed")
    res.status(200).json({"message":"all photos"})
})



app.post('/forgotpassword',async(req,res)=>{

//get the email from the user to which we will sent password reset link
const {email} = req.body;

const user = await User.findOne({email})
if(!user){
    return res.status(400).json({msg:'email address is not registered'})

}
//generate the password reset link
const token  = jwt.sign({"email":user.email},secret,{expiresIn:60*10})

if(token){
    //create a reset link
    const link = `http://127.0.0.1:3000/resetpassword/${user._id}/${token}`
    console.log(link)
    // send mail with defined transport object
    let info = await transporter.sendMail({
    from: 'letzzbuild@gmail.com', // sender address
    to: "gautampatil728gp4@gmail.com", // list of receivers
    subject: "No-Reply", // Subject line
    text: "Hello world?", // plain text body
    html: ` <h1>Reset your password</h1>
            <b>
               <a href=${link}>Click Here to Reset Password</a>
               <h5>Link is valid only for 10 minutes</h5>
            </b>
            `, // html body
  },function(err,info){
      if(err){
          console.log(err)
          return res.status(500).json({msg:"Something went wrong while sending email"})
      }
      else{
          return res.status(200).json({msg:"Password Reset Link sent to your registered email"})
      }
  });

}

else{
    return res.status(500).json({msg:"Something went wrong"})
}

})




app.post('/resetpassword/:user_id/:token',async (req, res) => {
    const token = req.params.token;
    const user_id = req.params.user_id;
    const {password} =  req.body;
     
    const user = await User.findById(user_id);
    
    if(!user){
        return res.status(400).json({msg:'user not found'})
    }
    
    await jwt.verify(token,secret,async (err,decoded)=>{
      if(err){
        return res.status(400).json({msg:'invalid token or expired'}) 
      }
      else{

     //update password inside the database
    const encPass = await bcrypt.hash(password,10)
    await User.findByIdAndUpdate(user_id,{password:encPass},(err,newuser)=>{
      if(!err){
        return res.status(200).json({msg:'password updated successfully'})
      }
      else{
        return res.status(500).json({msg:'something went wrong, please try once again'})
      }
    })
      }
    }) 
})


app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})
