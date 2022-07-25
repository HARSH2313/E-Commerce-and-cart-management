const express = require('express');
const { createUser, doLogin, getdetails,updateuser } = require('../controllers/userController');
const{authentication,authorization}=require('../middlewares/authentication')


const router = express.Router();


//  USer api's

router.post("/register",createUser);

router.post("/login",doLogin );

router.get('/user/:userId/profile',authentication,authorization,getdetails)

router.put('/user/:userId/profile',authentication,authorization,updateuser)


module.exports = router;