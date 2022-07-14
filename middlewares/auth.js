const jwt = require('jsonwebtoken');
const secret = process.env.SECRET_KEY


const auth = (req,res,next)=>{
    const token = req.headers.authorization.split(" ")[1];
 
    if(!token){
        return res.status(401).json({"msg":"please provide a token"})
    }

  jwt.verify(token,secret,function(err,decoded){
       if(err){
           return res.status(401).json({msg:"Invalid token given"})
       }

       return next();


  })
  

}

module.exports = auth;