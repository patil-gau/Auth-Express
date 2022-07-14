const mongoose = require('mongoose');
const MongoUrl = process.env.MONGO_URL


exports.connection = ()=>{
  mongoose.connect(MongoUrl,{useNewUrlParser:true,useUnifiedTopology:true})
  .then((success)=>{
   console.log("Connected to the database")
}).catch(err=>{
    console.log(err)
})

}

