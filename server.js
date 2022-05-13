const express = require('express');
const exphbs  = require('express-handlebars');
const hbs = require('hbs');
const fetch = require('node-fetch');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
var bodyParser=require("body-parser");
const {v4 : uuidv4} = require('uuid');
const Handlebars = require('handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
//Schemas import.....
const User = require('./schema/userSchema');
const Product = require('./schema/productSchema');
const Auth = require('./schema/auth');



require("dotenv").config();

const app = express();
const path = require('path');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.json());

const PORT = process.env.PORT||4000;

// mongo DB connection...............

const DB = "mongodb+srv://admin:distro@cluster0.oo6yg.mongodb.net/distro?retryWrites=true&w=majority";
mongoose.connect(DB,{
    useNewUrlParser:true,
    useunifiedTopology:true,
}).then(()=>{
    console.log("connnection success")

}).catch((err)=>{
    console.log(err)
})
//

const static_path = path.join(__dirname, '../views');
const partials_path = path.join(__dirname, '../views/partials');

app.use(express.static(static_path));
hbs.registerPartials(partials_path);

app.engine('.hbs', exphbs.engine({extname: '.hbs', defaultLayout: false,  handlebars: allowInsecurePrototypeAccess(Handlebars) }));
app.set('view engine', '.hbs');



app.get('/', Auth,(req, res)=>{

});

app.post('/login', async(req, res)=>{
const { uid, upass} = req.body;


try{
    if(uid==="" || upass===""){
        res.render('index', {message:"fill all data first."});
        return;
    }
    
    const userr = await User.findOne({uid:uid});

    if(uid!=userr.uid || upass!=userr.upass){
        res.render('index', {message:"Did not match."});
        return;
    }else{
        const token = jwt.sign({_id:userr._id.toString()},  "thisistasktokencredentialencryptedbyjwt",{
            expiresIn: "365d",
        });
        
        res.cookie( 'tasktoken', token,
            { maxAge: 1000 * 60 * 10000000000, httpOnly: true });
        
        const addTokenDb = await User.findOneAndUpdate({ uid: uid },{$set: {token: token}});
        res.render('index', {user:uid});
    }
}catch(err){
    res.render('index', {message:"Something Error!"});
}


});
app.get('/register', (req, res)=>{
    res.render('register');
});
app.get('/create', (req, res)=>{
    res.render('create');
});
app.post('/create', (req, res)=>{
    const pname = req.body.pname;
    const pprice = req.body.pprice;
    const pdec = req.body.pdec;
    const pcnt = req.body.pcnt;
    
    const pid = uuidv4();
    
    try{
        if(pname==="" || pprice==="" || pdec==="" || pcnt===""){
            res.render('create', {message:"fill all data first."});
    }
   
    else{
        Product.findOne({pname:pname}).then(product => {
            if (product) {
                if (product.pname === pname) {
                    res.render('create', {message:"Product exists. Just update."});
                }
                return;
            } else {
                const newProduct = new Product({ 
                    pname :req.body.pname,
                   pprice : req.body.pprice,
                    pdec :req.body.pdec,
                   pcnt :req.body.pcnt,
                   pid: pid
                    });
        
               newProduct.save().then(product =>  res.render('create', {message:"Successfully saved."}))
               .catch(err => console.log(err));
             
            }
        })
        .catch(err => {
            res.render('create', {message:err});
        });
    }
   
    }catch(err){
        res.render('create', {message:err});
    }
});

app.get('/list', (req, res)=>{
    
    Product.find().lean().exec((err, docs) => {
        if (!err) {
            res.render("list", {
                product: docs,
                desg:'Admin'
            });
        }
        else {
            console.log('Error in retrieving emp list :' + err);
        }
    });
});


app.get('/update/:id', (req, res)=>{
  
    Product.findById(req.params.id, (err, doc) => {
        if (!err) {
         
            res.render("update", {
                product: doc,
            });
    }
    });
   
});
app.post('/update', (req, res)=>{
    Product.updateOne({ _id: req.body.ids }, req.body, { new: true }, (err, doc) => {

        res.render("update", {
            message: 'Updated',
            product: req.body
        });
})
})


app.get('/delete/:id', (req, res) => {
   Product.findByIdAndRemove(req.params.id, (err, doc) => {
        if (!err) {
            res.redirect('/list');
        }
        else {
            console.log('Error in product remove :' + err);
        }
    });
});

app.post('/register', async(req, res)=>{
    const uid = req.body.uids;
    const phone = req.body.phones;
    const email = req.body.emails;
    const upass = req.body.upasss;
    const desg = req.body.desgs;

   
    try{
    

        if(uid==="" || phone==="" || email==="" || upass===""){
            res.render('register', {message:"fill all data first."});

    }
   
    else{
        User.findOne({uid:uid}).then(user => {
            if (user) {
                if (user.uid === req.body.uids) {
                    res.render('register', {message:"User already exists."});
                }
                return;
            } else {
                const newUser = new User({
                    uid: req.body.uids,
                   phone: req.body.phones,
                   email: req.body.emails,
                    upass: req.body.upasss,
                    desg: req.body.desgs
                });
        
               newUser.save().then(user =>  res.render('register', {message:"Successfully saved."}))
               .catch(err => console.log(err));
             
            }
        })
        .catch(err => {
            res.render('register', {message:err});
        });
    }
       

        
    }catch(err){
        res.render('register', {message:err});
        console.log(err)
    }
       
});


app.get('/logout', (req,res)=>{
    res.clearCookie('tasktoken', { path: '/'});
    res.render('index');
});

app.listen(PORT, ()=>{
    console.log("Running at 4000");
})
