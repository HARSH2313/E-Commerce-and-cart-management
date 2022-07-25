// const userModel = require('../models/userModel');

// const registerUser = async function (req, res){
//   try{

//   }catch(err){
//     res.status(500).send({status: false, message: err.message});
//   }
// }

// const loginUser = async function (req, res){
//   try{

//   }catch(err){
//     res.status(500).send({status: false, message: err.message});
//   }
// }

// const getProfile = async function (req, res){
//   try{

//   }catch(err){
//     res.status(500).send({status: false, message: err.message});
//   }
// }

// const updateProfile = async function (req, res){
//   try{
//     let dataToUpdate = req.body;
//     let {fname, lname, email, profileImage, phone, password, address, billing} = dataToUpdate;

//     res.status(200).send({status: true, message: 'Updated Successfully', data: dataToUpdate});
//   }catch(err){
//     res.status(500).send({status: false, message: err.message});
//   }
// }

// module.exports = {registerUser, loginUser, getProfile, updateProfile};

const userModel = require("../models/userModel")
//const jwt = require("jsonwebtoken")
const uploadFile = require('../awsS3/aws');
const chekEmail = require("email-validator")


const isValid = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  if (typeof value === "number") return false;
  return true;
};





const createUser = async function(req, res){
  try {
    let getUsersData = req.body
    getUsersData.profileImage = uploadFile;
    if(!Object.keys(getUsersData).length > 0) return res.status(404).send({
        status:false,
        message:"Please Enter Data To Create User"
    })
    getUsersData = JSON.parse(JSON.stringify(getUsersData).replace(/"\s+|\s+"/g,'"'))
    let {fname,lname,phone,email,password,address} =getUsersData
   
    const regexValidator = function(val){
        let regx = /^[a-zA-z]+([\s][a-zA-Z]+)*$/;
        return regx.test(val);
    }
    if(!(isValid(fname))) return res.status(400).send({
        status:false,
        message:"First Name is Missing"
    });
    if(!(regexValidator(fname))) return res.status(400).send({
        status:false,
        message:"Plaese Enter Valid Name with Only alphabet"
    });

    if(!(isValid(lname))) return res.status(400).send({
      status:false,
      message:"Last Name is Missing"
  });

  if(!(regexValidator(lname))) return res.status(400).send({
      status:false,
      message:"Plaese Enter Valid Name with Only alphabet"
  });



    const phoneRegex = /^[6-9]\d{9}$/gi;
    let usedPhone = await userModel.findOne({phone:phone})
    if(usedPhone){
        return res.status(400).send({
            status:false , message: " Phone is allready Used Please Use Another Phone"
    })
    }

    if(!(isValid(phone))) return res.status(400).send({
        status:false,
        message:"Phone number is missing "
    });
    if(!(phoneRegex.test(phone))) return res.status(400).send({
        status:false,
        message:"Please Enter Valid phone Number"
    });


    let usedEmail = await userModel.findOne({email:email})
    if(usedEmail){
        return res.status(400).send({status:false, message:"email already in use"})
    }

    if(!(isValid(email))) return res.status(400).send({
        status:false,
        message:"Email is Missing "
    });
    if(!(chekEmail.validate(email))) return res.status(400).send({
        status:false,
        message:" Please Enter Valid Email"
    });

    const checkPassword = /^[a-zA-Z0-9!@#$%^&*]{8,15}$/;

    if(!(isValid(password))) return res.status(400).send({
        status:false,
        message:"Password is missing or Please Enter Valid Password Minumum 8 Character and Maximum 15 "
    });
    if(!(checkPassword.test(password))) return res.status(400).send({
        status:false,
        message:"Password is missing or Please Enter Valid Password Minumum 8 Character and Maximum 15 "
    });

    if(address){
        let key= Object.keys (address)

for(let i=0; i<key.length; i++){
   if(address[key[i]].length==0)
  return res.status(400).send({status: false, message: "Enter valid inforamtion in address "})
}

    if (!/^([a-zA-Z0-9 ]{2,50})*$/
    .test(address.billing.street)) {
        return res.status(400).send({
          status: false,
          message: "Street should be Valid and Its alphabetic and Number",
        });
      }

    let cityRegex = /^[a-zA-z]+([\s][a-zA-Z]+)*$/;
    if (!cityRegex.test(address.billing.city)) {
        return res.status(400).send({status:false, message:"city name should be valid. contain only alphabets"})
    }
    if (!/^\d{6}$/.test(address.billing.pincode)) {
        return res.status(400).send({
          status: false,
          message: "Pincode should have only 6 digits. No alphabets",
        });
      }

      if (!/^([a-zA-Z0-9 ]{2,50})*$/
      .test(address.shipping.street)) {
          return res.status(400).send({
            status: false,
            message: "Street should be Valid and Its alphabetic and Number",
          });
        }
      
      if (!cityRegex.test(address.shipping.city)) {
          return res.status(400).send({status:false, message:"city name should be valid. contain only alphabets"})
      }
      if (!/^\d{6}$/.test(address.shipping.pincode)) {
          return res.status(400).send({
            status: false,
            message: "Pincode should have only 6 digits. No alphabets",
          });
        }

}

    let savedData = await userModel.create(getUsersData);
    res.status(201).send({
        status:true,  message:"User Created Successfully", data: savedData
    })

} 
catch (error) {
    console.log(error)
    return res.status(500).send({status:false, message:error.message})
    
}
};


const userLogin = async (req,res)=>{
    try {
        let data= req.body
        let {email,password}= data        
        if(!isValidRequestBody(data)){
            return res.status(400).send({status:false,msg:"Please enter email and Password"})
        }
        if(!isValid(email)) return res.status(400).send({ status:false,msg:"Please enter email"});
        const emailValidator = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/
        if (!emailValidator.test(email)) {
            return res.status(400).send({ status: false, message: "Email should be a valid email address" })
        }
       
        if(!isValid(password))return res.status(400).send({ status:false,msg:"Please enter Password"});
        let user = await userModel.findOne({email:email});
        if(!user){
            return res.status(404).send({status:false,msg:"InvalidEmail Found"})
        };

        const token = jwt.sign({
            userId: user._id,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 10 * 60 
        }, 'functionup-project-5')
        res.header('Authorisation', token)
        return res.status(200).send({ status: true,
             message: "User successfully loggedin",
              data: token });
    } catch (error) {
        res.status(500).send({status:false,msg:error.message})
    }
 }


const getUser = async (req, res) => {
  try {
    let userId = req.params.userId;
    if (!isValidObjectId(userId))
      return res
        .status(400)
        .send({ status: false, msg: `Oops! ${userId} This Not Valid UserId ` });
    let userDetail = await userModel.findById({ userId });
    if (!userDetail) {
      return res.status(404).send({ status: false, msg: "User you are searching for is not here" });
    } else {
      res.status(200).send({
        status: true,
        msg: "Your details is here",
        data:userDetail
      });
    }
  } catch (error) {
    res.status(500).send({ status: false, msg: error.message });
  }
};




 module.exports={createUser,getUser,userLogin}
