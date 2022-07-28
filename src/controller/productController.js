const mongoose = require("mongoose")
const productModel = require("../model/productModel")
const jwt = require('jsonwebtoken')
//const bcrypt = require('bcrypt')
const aws = require('aws-sdk')
const validator = require("../validator/validator")

aws.config.update({
    accessKeyId: "AKIAY3L35MCRVFM24Q7U",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFile = async (file) => {
    return new Promise(function (resolve, reject) {
        // this function will upload file to aws and return the link
        let s3 = new aws.S3({ apiVersion: '2006-03-01' }); // we will be using the s3 service of aws

        var uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",  //HERE
            Key: "neha/" + file.originalname, //HERE 
            Body: file.buffer
        }


        s3.upload(uploadParams, function (err, data) {
            console.log(3)
            if (err) {
                return reject({ "error": err })
            }
            console.log(data)
            console.log("file uploaded succesfully")
            return resolve(data.Location)
        })
        console.log(1)

        // let data= await s3.upload( uploadParams)
        // if( data) return data.Location
        // else return "there is an error"

    })
}
//----------------------------------------createProduct-----------------------------------------------//

const createProduct = async function (req, res) {
    try {
        const products = req.body
        // products.availableSizes = JSON.parse(products.availableSizes)
        // return res.send(products)
        if (!validator.isValidObject(products)) {
            return res.status(400).send({ status: false, message: "Please Provide all required field" })
        }
        const { title, description, style, price } = products
        let availableSizes = products.availableSizes
        if (!validator.isValid(title)) {
            return res.status(400).send({ status: false, message: "Please Provide Title" })
        }

        const titleInUse = await productModel.findOne({ title: title })
        if (titleInUse) {
            return res.status(400).send({ status: false, message: "enter different Title" })
        }
        if (!validator.isValid(description)) {
            return res.status(400).send({ status: false, message: "Please Provide Description" })
        }

        if (!validator.isValid(style)) {
            return res.status(400).send({ status: false, message: "Please Provide style" })
        }
        if (!validator.isValidString(style)) {
            return res.status(400).send({ status: false, message: "Please Provide a valid style" })
        }
        if (!validator.isValid(price)) {
            return res.status(400).send({ status: false, message: "Please Provide Price" })
        }
        if (!/^[0-9.]*$/.test(price)) {
            return res.status(400).send({ status: false, message: "Please Provide Valid Price" })

        }
        if (!/^[0-9]*$/.test(products.installments)) {
            return res.status(400).send({ status: false, message: "Please Provide Valid Installments" })

        }
        if (!validator.isValid(availableSizes)) {
            return res.status(400).send({ status: false, message: "Please Provide Available Sizes" })
        }

        availableSizes = JSON.parse(availableSizes)
        // return res.send({data: availableSizes})
        for (let i of availableSizes) {
             //console.log(i)
            if (!validator.isValidSize(i)) {
                return res.status(400).send({ status: false, message: 'Please Provide Available Sizes from S,XS,M,X,L,XXL,XL' })
            }
        }
        products.availableSizes = availableSizes
        let files = req.files
        if (files && files.length > 0) {
            let uploadedFileURL = await uploadFile(files[0])
            products.productImage = uploadedFileURL
        } else {
            return res.status(400).send({ status: false, message: "plz enter a product Img" })
        }

        // return res.send({data: products})
        const product = await productModel.create(products)
        return res.status(201).send({ status: true, message: 'Success', data: product })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

//-----------------------------------------------------------------------------------------------------//

const getAllProduct = async function (req, res) {
    try{
        let data = {
            isDeleted: false
        }
        let queryDataSize = req.query.size;
        if (queryDataSize) {
            if (!(validator.isValid(queryDataSize)) && (validator.isValidSize(queryDataSize))) {
                return res.status(400).send({status: false, message:"plz Enter a valid Size"})
            }
            if(!(validator.isValidSize(queryDataSize))) {
                return res.status(400).send({status:false, message:"Please Provide Available Sizes from S,XS,M,X,L,XXL,XL"})
            }
            data["availableSizes"] = queryDataSize.trim();
        }
        let name = req.query.name;
        if (name) {
            if (!validator.isValid(name)) {
                return res.status(400).send({status: false, message:"plz enter a valid name"})
            }
            data["title"] = {$regex: name.trim()}
        }
        let priceGreaterThan = req.query.priceGreaterThan;
        if (priceGreaterThan) {
            if (!validator.isValid(priceGreaterThan)) {
                return res.status(400).send({status: false, message:"plz enter a valid name"})
            }
            data["price"] = {
                $gte: priceGreaterThan
            }
        }
        let priceLessThan = req.query.priceLessThan;
        if (priceLessThan) {
            if (!validator.isValid(priceLessThan)) {
                return res.status(400).send({status: false, message:"plz enter a valid name"})
            }
            data["price"] = {
                $lte: priceLessThan
            }
        }
        if( priceLessThan && priceGreaterThan){
            if(!validator.isValid(priceLessThan)){
                return res.status(400).send({status: false, message:"plz enter a valid price"})
            }
            if(!validator.isValid(priceGreaterThan)){
                return res.status(400).send({status: false, message:"plz enter a valid price"})
            }
            data["price"] = {$lte:priceLessThan,$gte:priceGreaterThan}
    
        }
        let filerProduct = await productModel.find(data).sort({price: req.query.priceSort});
        // let filerProduct = await productModel.find({title: {$regex: name}});
        if (filerProduct.length === 0) {
            return res.status(400).send({
                status: true,
                message: "No product found"
            })
        }
        return res.status(200).send({
            status: true,
            message: "products you want",
            data: filerProduct
        })
    }catch(error){
        return res.status(500).send ({status:false, message: error.message})
    }
}


//--------------------------getbyId---------------------------------------------------------------------//

const getProductById = async (req, res) => {
    try {
        const query = req.query

        if (Object.keys(query) != 0) {
            return res.status(400).send({ status: false, message: "Invalid params present in URL" })
        }

        const productId = req.params.productId

        if (!validator.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: `${productId} is not valid type Product Id` });
        }

        const findProduct = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!findProduct) {
            return res.status(404).send({ status: false, message: 'Product does not exists or has been deleted' })  //Validate: The Product Id is valid or not.
        }
        return res.status(200).send({ status: true, message: 'Product found successfully', data: findProduct })
    }
    catch (error) {
        console.log(err)
        res.status(500).send({ message: err.message })
    }
}

module.exports = { createProduct, getAllProduct, getProductById}