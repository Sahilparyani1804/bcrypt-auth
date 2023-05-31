require("dotenv").config();
const express=require("express");

const bodyParser=require("body-parser");
const ejs=require("ejs");
const app=express();
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
const mongoose=require("mongoose");
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");


app.use(session({
    secret:"This is my little secret.",
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());




mongoose.connect("mongodb://127.0.0.1:27017/userDB",{useNewUrlParser:true})
.then(console.log("server connected to db"));

const userSchema=new mongoose.Schema({
    email:String,
    password:String
});
userSchema.plugin(passportLocalMongoose);




const User=mongoose.model("User",userSchema);

passport.use(User.createStrategy());
passport.serializeUser(function(user,done){
    done(null,user.id)
});
passport.deserializeUser(User.deserializeUser());




app.get("/",function(req,res){
          res.render("home");
})

app.get("/login",function(req,res){
    res.render("login");
})

app.get("/register",function(req,res){
    res.render("register");
})
app.post("/register",function(req,response){

      User.register({username:req.body.username},req.body.password,function(err,res){
        if(err){
            console.log(err);
            response.redirect("/register");
        }else{
            passport.authenticate("local")(req,res,function(){
                response.redirect("/secrets");
            });
        }
      });
       
   
    
    
})

app.get("/secrets",function(req,res){
    if (req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("/login");
    }
})





app.post("/login",function(req,response){
      const user=new User({
        username:req.body.username,
        password:req.body.password
      });

      req.login(user,function(err){
        if(err){
            console.log(err);

        }else{
            passport.authenticate("local")
            response.redirect("/secrets");
            
        }
      })
});















app.listen(3000,function(){
     console.log("server is listening on port 3000");
})
