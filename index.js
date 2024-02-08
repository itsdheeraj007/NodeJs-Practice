import express from 'express';
import path from 'path';
import jwt from 'jsonwebtoken'
import cookieParser  from 'cookie-parser';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
const app = express();


app.use(express.urlencoded({ extended:true }));
// app.use(express.static(path.join(path.resolve(),'./public')));

app.use(cookieParser());

//connecting the Data base
mongoose.connect("mongodb+srv://itsdheeraj00:9kk0bElVVZli0u91@backend.pmv2kdi.mongodb.net/", {
    dbName:"backend",
}).then(() => {console.log("database connection established")}).catch(err => console(err));

// creating schema for database
const userSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String,

})
const User = mongoose.model("user", userSchema);




app.set("view engine", "ejs");

//bacicall ye ek middleware create kia hai jiska matlb ye hai ki agat tokena hai yani authenticated hai ..
//
const isAuthenticated = async(req , res,next) => {
    const {token} = req.cookies;
    if(token){

       const decoded =   jwt.verify(token, "hduhihisdhilkdhi")// yha hum token ko decode kr rahe taki user secure rahe 
        req.user = await User.findById(decoded._id);// is line ki help se hum user ki sari information ko req.user me store kr lete hai taki hum use thorughout use kar sake

        next()
    }
    else{
        res.render('register');
    }
}

app.get('/',isAuthenticated,(req, res)=>{
    
    
    res.render('logout');
    //ye next() call ho gya hai or logout wala page aa gya hai 
})

app.post('/login',async (req, res)=>{
    //ab kyuki isi se hum login kara rahe hai to yhi se hume data b lena hai jo b form me dalega
    const{name,email,password} = req.body;

   let user = await User.findOne({email})
    if(!user){
        return res.redirect('/register');
    }
    //ab niche jo password encrypt kia hai wo ese to match hoga ni to use liye we use propert of bcryt is compare(),
    const isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch){
        return res.render('login',{email,message:'INCORRECT PASSWORD'});
    }
    const token = jwt.sign({_id:user._id},'hduhihisdhilkdhi');

    res.cookie("token",token,{
        httpOnly:true,
        expires:new Date(Date.now() + 15 * 60 *  1000)
    });
    res.redirect('/');   
    // but we can not access the cookie by consoling it and we need token to be accessed.so for that 
    // reasons we use a package called coolie-parser.
})

app.post('/register',async(req,res)=>{
    const{name,email,password} = req.body;

    let user = await User.findOne({email})
    if(user){
        return res.redirect('/login');
    }
    // to abhi passwords can be seen in databse to so fot that we wull encypt it (for that we have package called {bcrypt})
    const hashedPass = await bcrypt.hash(password,10);
       user = await User.create({
        name,
        email,
        password:hashedPass,
    })
    const token = jwt.sign({_id:user._id},'hduhihisdhilkdhi');

    res.cookie("token",token,{
        httpOnly:true,
        expires:new Date(Date.now() + 15 * 60 *  1000)
    });
    res.redirect('/');  
})
app.get('/logout',(req, res)=>{
    res.cookie("token", null,{
        httpOnly:true,
        expires:new Date(Date.now())
    })
    res.redirect('/login');
})
app.get('/login',(req, res)=>{
   
    res.render('login');
})
app.get('/register',(req,res)=>{
    res.render('register');
})


// app.get('/add',(req, res)=>{

//  messge.create({name:"dheeraj", number:35465}).then(()=>{
//     res.send("nice");
//  })
// })
// app.post('/',(req,res)=>{
//     const token = req.cookies.token;
//     res.render('login.ejs');
//     if(token){
//         res.render("logout");
//     }
//     else{
//         res.render('login');
//     }
// })





app.listen(5051,()=>{
    console.log('app is listening');
})

