const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerUser = async(req,res) => {
    const {name,email,password} = req.body;

    try{
        //1. check if use alreaddy exists
        let user = await User.findOne({ email});
        if(user){
            return res.status(400).json({message: 'User with this email already exists'});
        }

        //2. If not, create a new use instance
        user = new User({
            name,
            email,
            password,
        });
        // 3. Hash the password before saving
        const salt = await bcrypt.genSalt(10); //Generate a salt with 10 rounds
        user.password = await bcrypt.hash(password,salt); //Hash the password

        //4. Save the user to database
        await user.save();

        //5. User is saved, now generate a token for immediate logic
        const payload = {
            user:{
                id: user.id,
                name: user.name,
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET, //secret key from .env
            { expiresIn: '30d'},
            (err,token) => {
                if(err) throw err;
                res.status(201).json( { token }); //Send token to the client
            }
        );
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }

};

//User Login contoller

const loginUser = async (req,res) =>{
    const {email,password } = req.body;

    try{
        //1. check if the user exists
        let user = await User.findOne({ email });
        if(!user){
            return res.status(400).json({ message: 'Invalid credentials'});
        }

        //2. Compare the provided password with the hashed password in the DB
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({ message: 'Invalid credentials'});
        }

        //3. If credentials are correct, create and sign a JWT
        const payload = {
            user: {
                id: user.id,
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '30d'},
            (err,token) =>{
                if (err) throw err;
                res.json({ token });
            }
        );
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    registerUser,
    loginUser,
};