const jwt = require('jsonwebtoken');
const User = require('./userSchema');

const Auth = async (req, res, next)=>{
    try{
        const token = req.cookies.tasktoken;
        const verify = jwt.verify(token, 'thisistasktokencredentialencryptedbyjwt');
        
        const oldUser = await User.findOne({_id:verify._id, "token":token});
       
        if(!oldUser){
            throw new Error("user not found")
        }else{
            req.token = token;
            req.oldUser = oldUser;
            req.userId = oldUser._id;
            res.render('index', {user:req.oldUser.uid});
            next();
        }
        
    }catch(err) {
        res.render('index');
    }
}

module.exports = Auth;