const mongoose = require('mongoose');
const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

/********************************FEATURE-I APIS*************************************/
router.post('/register', userController.createUser);

 router.post('/login', userController.userLogin);

router.get('/user/:userId/profile', userController.getUser);

// router.put('/user/:userId/profile', userController.updateProfile);

/********************************FEATURE-II APIS************************************/
/********************************FEATURE-III APIS***********************************/
/********************************FEATURE-IV APIS************************************/
module.exports = router;