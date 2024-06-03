const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const fileUpload          = require('express-fileupload');
const util =require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
const path = require('path');
const Categorie = require('../models/Categories');
const Product = require('../models/Products');
const Colour = require('../models/Colours');
const Size = require('../models/Size');
const Age = require('../models/Age');
const Banner = require('../models/Banners');
const User =require('../models/Users');
const Attribute =require('../models/Attributes');
const AttributeVariations=require('../models/AttributeVariations');
const CompainAttributes=require('../models/CompainAttribute');
const Order= require('../models/Orders');
const AdminUser = require('../models/AdminUsers');
const ProductDiscounts = require('../models/ProductDiscount');
const sharp = require('sharp');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const CategoriePath='/etc/ec/data/Categorie/';
const ProductPath='/etc/ec/data/Product/';
const ColourPath='/etc/ec/data/Colour/';
const BannerPath='/etc/ec/data/Banner/';
const URLpathc ='/Categorie';
const URLpathp ='/Product';
const URLpathclr ='/Colour';
const URLpathb ='/Banner';


router.use(bodyParser.json());
router.use(fileUpload());

//const TwoFactor =require('TwoFactor');

const axios = require('axios');
//const speakeasy = require('speakeasy');

function generateOTP() {
  // Generate a time-based OTP
  const secret = speakeasy.generateSecret({ length: 20 });
  const otp = speakeasy.totp({
    secret: secret.base32,
    encoding: 'base32',
  });
  return otp;
}


exports.createAdmin = async (req,res) => {
console.log("req.body---------",req.body);
	try{

		const {emailId,password}=req.body;
		//hash the password

		const hashedPassword = await bcrypt.hash(password, 10);
		const user  = await AdminUser.create({
            emailId: emailId,
            password: hashedPassword,
            role: 'admin' // Assuming the role is 'admin' for now
        });
 //       const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '360d' });
		res.status(201).send({ message: 'Admin user created successfully' });
	}catch(error){
		console.log("error-------",error)
		res.status(500).json({ error:"Error of creating admin user"});
	}

}



exports.signUser = async (req,res) => {
console.log(req.body)
	try{
		const { emailId, password } = req.body;
		const user =await AdminUser.findOne({ where: { emailId:emailId}});
		console.log("user----------",user)
		if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
//        console.log("secretKey------",secretKey)
		//const token = jwt.sign({ userId: user.id }, secretKey,{ expiresIn:'360d'});
		res.status(200).json({ message: 'Signin successful' });	
	}catch(error){
		res.status(500).json({message:"No User found"})
	}

}

exports.loginRequestOtp = async (req, res) => {
  try {
    const { mobilenumber } = req.body;

    // Call the 2Factor.in API to send OTP
    const response = await axios.get(`http://2factor.in/API/V1/9e880f4a-7dc5-11ec-b9b5-0200cd936042/SMS/${mobilenumber}/AUTOGEN2`);
   const user =await User.create({ mobilenumber,otp:response.data.OTP,otpTimestamp:new Date()});
console.log("user------",user);
    console.log('Response from 2Factor.in API:', response.data);

    // Check the response and handle accordingly
    if (response.data.Status === "Success") {
      res.status(200).json({ message: 'OTP sent successfully',user });
    } else {
      res.status(500).json({ message: 'Failed to send OTP' });
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Verify OTP endpoint
exports.loginVerifyOtp = async (req, res) => {
  try {
    const { mobilenumber, otp } = req.body;
    // Find user by mobile number
    const user = await User.findOne({ where: { mobilenumber } });
    if (!user) {
      return res.status(404).json({ message: 'Mobile number not found' });
    }
     if(otp === user.otp){
        // await user.destroy();
      return res.status(200).json({ message: 'OTP verified successfully' });
    } else {
      return res.status(400).json({ message: 'Invalid OTP or expired' });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



//create categorie
exports.createCategorie = async (req, res) => {
        try{
                const categoriesName = req.body.categoriesName;
        var finalName =categoriesName.replace(/\s+/g, '_');
                const desImageDir = `${CategoriePath}${finalName}`;
                if (!fs.existsSync(desImageDir)) {
                fs.mkdirSync(desImageDir, { recursive: true });
        }

        console.log("finalName--------",finalName)
        var desImageUrl = '';
        fs.writeFileSync(`${desImageDir}/${req.files.image.name}`,req.files.image.data, 'binary');
        destinationImgUrl = `https://salesman.aindriya.co.in${URLpathc}/${finalName}/${req.files.image.name}`;
        const categorie = await Categorie.create({
                categoriesName:categoriesName,
                image:destinationImgUrl,
                status:req.body.status,
		description:req.body.description,
                createdAt: new Date(),
                updatedAt: new Date()
        });
        res.status(201).json({message:"created successfully"});
        }catch(error){
                console.log("error----------",error)
                res.status(500).json({ message: 'Internal server error' });
        }
}




//update categorie
exports.updateCategorie = async (req, res) => {
    /*try {
        const id = req.params.id;

        const categorie = await Categorie.findOne({ where: { id: id } });
        if (!categorie) {
            return res.status(404).json({ message: 'Category not found' });
        }
        var finalName =categorie.categoriesName.replace(/\s+/g, '_');
        const desImageDir = `${CategoriePath}${finalName}`;
        console.log("desImageDir---------", desImageDir);

        // Check if the directory exists
        if (!fs.existsSync(desImageDir)) {
            console.log("Directory does not exist");
            return res.status(404).json({ message: 'Directory does not exist' });
        }

        // Get the path of the existing image file
//        console.log("req.files.image.name---------",req.files.image.name)
        // return

        const imagePath = `${desImageDir}/${req.files.image.name}`;
        console.log("imagePath----------", imagePath);

        // Check if the image file exists
        if (fs.existsSync(imagePath)) {
            // Delete the old image file
            fs.unlinkSync(imagePath);
        }

        // Write the new image file
        fs.writeFileSync(imagePath, req.files.image.data, 'binary');
	if(req.files.image){
        // Update the category's image URL
        categorie.image = `https://salesman.aindriya.co.in${URLpathc}/${finalName}/${req.files.image.name}`;	
}
	if (req.body.description) {
        categorie.description = req.body.description;
    }

    // Update status if provided
    if (req.body.status !== undefined) {
        categorie.status = req.body.status;
    }
        // Save the updated category
        await categorie.save();

        res.status(200).json({ message: 'Category image updated successfully', categorie });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ message: 'Internal server error' });
    }*/
	try {
    const id = req.params.id;

    // Fetch the category by ID
    const categorie = await Categorie.findOne({ where: { id: id } });
    if (!categorie) {
        return res.status(404).json({ message: 'Category not found' });
    }

    // Replace spaces with underscores in the category name for directory naming
    var finalName = categorie.categoriesName.replace(/\s+/g, '_');
    const desImageDir = `${CategoriePath}${finalName}`;
    console.log("desImageDir---------", desImageDir);

    // Check if the directory exists
    if (!fs.existsSync(desImageDir)) {
        console.log("Directory does not exist");
        return res.status(404).json({ message: 'Directory does not exist' });
    }

    if (req.files && req.files.image) {
        // Get the path of the existing image file
        const imagePath = `${desImageDir}/${req.files.image.name}`;
        console.log("imagePath----------", imagePath);

        // Check if the image file exists and delete it if so
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        // Write the new image file
        fs.writeFileSync(imagePath, req.files.image.data, 'binary');

        // Update the category's image URL
        categorie.image = `https://salesman.aindriya.co.in${URLpathc}/${finalName}/${req.files.image.name}`;
    }

    // Update description if provided
    if (req.body.description) {
        categorie.description = req.body.description;
    }

    // Update status if provided
    if (req.body.status !== undefined) {
        categorie.status = req.body.status;
    }

    // Save the updated category
    await categorie.save();

    res.status(200).json({ message: 'Category updated successfully', categorie });
} catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Internal server error' });
}

};

//create product

/*exports.createProduct = async (req, res) => {
    try {
        const { name, size, age, colourId, categoriesId, price, description } = req.body;
      console.log("-----------",req.body)
      var requestBody =req.body;
      console.log("@@@@@@@@@@",requestBody)
      const sizeArray = requestBody['size[]'].split(',');
      const ageArray = requestBody['age[]'].split(',');
      console.log("-------",sizeArray)

        var finalName =name.replace(/\s+/g, '_');
        const desImageDir = `${ProductPath}${finalName}`;

        const categorie = await Categorie.findOne({ where: { id: categoriesId } });
        const colour = await Colour.findOne({where: { id: colourId} });
        if (!categorie) {
            return res.status(404).json({ message: 'Category not found' });
        }
        if (!colour) {
            return res.status(404).json({ message: 'Colour not found' });
        }

        if (!fs.existsSync(desImageDir)) {
            console.log("checking------");
            fs.mkdirSync(desImageDir, { recursive: true });
        }


        var desImageUrl = '';
        fs.writeFileSync(`${desImageDir}/${req.files.img.name}`, req.files.img.data, 'binary');
        const destinationImgUrl = `http://localhost${URLpathp}/${finalName}/${req.files.img.name}`;
        console.log("destinationImgUrl-----------", destinationImgUrl);

        const product = await Product.create({
            name,
            size:sizeArray,
            age:ageArray,
            colourId,
            categoriesId,
            price,
            description,
            img: destinationImgUrl,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        console.log("product--------------", product);
        res.status(201).json({ message: "created successfully" });

    } catch (error) {
        console.log("error--------",error)
        res.status(500).json({ message: 'There is an issue in creating Product' });
    }
}
*/
//update product

exports.createProduct = async (req, res) => {
    console.log("req.body--------",req.body);

    try {
        // Extract data from request body
        const { name,code,categoriesId,description,sellingPrice,status,
            discountPercentage, gstTaxPercentage,
            minimumQuantityWholesale, wholesalePrice } = req.body;
//console.log("categories--------",categorie)
  //          const categories = await Categorie.findAll({where:{id:categorie}})
        //const  categoriesName= categories[0].dataValues.categoriesName;
        //console.log("categoriesName",categoriesName);
        // Create the product
	 var finalName =name.replace(/\s+/g, '_');
        const desImageDir = `${ProductPath}${finalName}`;
	
	 if (!fs.existsSync(desImageDir)) {
            console.log("checking------");
            fs.mkdirSync(desImageDir, { recursive: true });
        }


	 var desImageUrl = '';
        fs.writeFileSync(`${desImageDir}/${req.files.image.name}`, req.files.image.data, 'binary');
        const destinationImgUrl = `https://salesman.aindriya.co.in${URLpathp}/${finalName}/${req.files.image.name}`;
        console.log("destinationImgUrl-----------", destinationImgUrl);

	
	const product = await  Product.create({ name,code,categoriesId,description,sellingPrice,status,image:destinationImgUrl });
console.log("product-------",product)
console.log("productId---",product.id)
const productId = product.id
console.log("productId---",productId)
	
        // Create the product discount
        await ProductDiscounts.create({
            minimum_Quantity_Discount:minimumQuantityWholesale, discount_Percentage:discountPercentage, tax_Percentage:gstTaxPercentage,
            minimum_Quantity_Wholesale:minimumQuantityWholesale, wholesale_Price:wholesalePrice,
            productId: productId // Assign the product ID to the discount
        });

        // Respond with success message
        res.status(201).json({ message: 'Product created successfully', product });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getAllOrders = async (req,res)=>{
        try{
                 const orders = await Order.findAll();
                res.status(200).json(orders)
        }catch (error){
                res.status(500).json({ message: 'Internal Server Error' });
        }
}

/*exports.createCompainAttribute = async (req, res) => {
    try {
        const productId = req.params.productId;
        const { size, colour } = req.body;

        // Create arrays of integers for colour and size values
        const colourIds = Array.isArray(colour) ? colour : [colour];
        const sizeIds = Array.isArray(size) ? size : [size];

        // Create a single CompainAttribute entry with arrays of colour and size IDs
        const compainAttribute = await CompainAttributes.create({
            productId: productId,
            colour_Value_Id: colourIds,
            size_Value_Id: sizeIds
        });

        // Log the created CompainAttribute
        console.log(compainAttribute);

        // Return success response
        res.status(201).json({ message: "CompainAttribute created successfully" });
    } catch (error) {
        console.error("Error creating CompainAttribute:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
*/
//createAttributeVariations
exports.createAttributeVariation = async (req, res) => {
/*try {
    const productId = req.params.productId;
    const variations = req.body.variations;

    // Check if productId is empty or undefined
    if (!productId) {
        return res.status(400).json({ error: 'Product ID is required' });
    }

    for (const variation of variations) {
        const { ColourId, SizeId } = variation;

        const colourIds = Array.isArray(ColourId) ? ColourId : [ColourId];
        const sizeIds = Array.isArray(SizeId) ? SizeId : [SizeId];

        for (const colourId of colourIds) {
            for (const sizeId of sizeIds) {
                await AttributeVariations.create({
                    ProductId: productId, // Use the productId retrieved from request parameters
                    colourId: colourId,
                    sizeId: sizeId
                });
            }
        }
    }
    // Fetch and return the created attribute variations
    res.status(200).json({ message: 'Attribute variations created successfully'  });
} catch (error) {
    console.error('Error creating attribute variations:', error);
    res.status(500).json({ error: 'Internal server error' });
}*/
/*try {
    const productId = req.params.productId;
    const variations = req.body.variations;

    // Check if productId is empty or undefined
    if (!productId) {
        return res.status(400).json({ error: 'Product ID is required' });
    }

    // Iterate over each variation
    for (const variation of variations) {
        const { ColourId, SizeId } = variation;

        // Convert ColourId and SizeId to arrays if they are not already arrays
        const colourIds = Array.isArray(ColourId) ? ColourId : [ColourId];
        const sizeIds = Array.isArray(SizeId) ? SizeId : [SizeId];

        // Create attribute variations for each combination of colour and size
        for (const colourId of colourIds) {
            for (const sizeId of sizeIds) {
                // Create the attribute variation
                await AttributeVariations.create({
                    ProductId: productId,
                    colourId: colourId,
                    sizeId: sizeId
                });
            }
        }
    }

    // Return success response
    res.status(200).json({ message: 'Attribute variations created successfully' });
} catch (error) {
    console.error('Error creating attribute variations:', error);

    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ error: 'Validation error: ' + error.message });
    }

    // Handle other Sequelize errors
    res.status(500).json({ error: 'Internal server error' });
}
*/
const productId = req.params.productId;
const variations = req.body.variations;

// Check if productId is empty or undefined
if (!productId) {
    return res.status(400).json({ error: 'Product ID is required' });
}

try {
    // Iterate over each variation
    for (const variation of variations) {
        const { ColourId, SizeId } = variation;

        // Convert ColourId and SizeId to arrays if they are not already arrays
        const colourIds = Array.isArray(ColourId) ? ColourId : [ColourId];
        const sizeIds = Array.isArray(SizeId) ? SizeId : [SizeId];

        // Retry the creation operation if it fails
        await retry(async () => {
            // Use Promise.all to await all create operations within the loop
            await Promise.all(colourIds.map(async (colourId) => {
                await Promise.all(sizeIds.map(async (sizeId) => {
                    // Create the attribute variation
                    await AttributeVariations.create({
                        ProductId: productId,
                        colourId: colourId,
                        sizeId: sizeId
                    });
                }));
            }));
        });
    }

    // Return success response
    res.status(200).json({ message: 'Attribute variations created successfully' });
} catch (error) {
    console.error('Error creating attribute variations:', error);
    res.status(500).json({ error: 'Internal server error' });
}

// Retry function to handle retries with exponential backoff
async function retry(operation, maxRetries = 3, delay = 1000) {
    let retries = 0;
    while (true) {
        try {
            await operation();
            break; // Operation succeeded, exit loop
        } catch (error) {
            retries++;
            if (retries >= maxRetries) {
                throw error; // Max retries exceeded, throw error
            }
            await sleep(delay * Math.pow(2, retries)); // Exponential backoff
        }
    }
}

// Function to sleep for a specified duration
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


};

//getAttributeVariations
exports.GetAttributeVariations = async (req,res)=>{
	try{
console.log("--------------")
		const product_Id =req.params.productId;
		console.log("product_Id",product_Id);
		const GetAttributeVariation = await AttributeVariations.findAll({where:{id:product_Id}});
		 console.log("GetAttributeVariation---------",GetAttributeVariation)
	
	}catch(error){
		console.log("error--",error)
	}
}


exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the existing product by ID
        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Update only the fields provided in the request body
        const { name, size, age, colourId, categorieId, price, description } = req.body;


        if (name !== undefined) {
            product.name = name;
        }
        if (req.body['size[]']) {
            // if (size !== undefined) {
            sizeArray = req.body['size[]'].split(',');
            // console.log("req.body-----#######",req.body)

            product.size = sizeArray;
            // }
        }
        if (req.body['age[]']) {
             ageArray = req.body['age[]'].split(',');
             // const ageArray = requestBody['age[]'].split(',');
            product.age = ageArray;
        }
        if (colourId !== undefined) {
                const colour = await Colour.findOne({where: { id: colourId} });
                if (!colour) {
            return res.status(404).json({ message: 'Colour not found' });
                }

            product.colourId = colourId;
        }
        if (categorieId !== undefined) {
            product.categorieId = categorieId;
        }
        if (price !== undefined) {
            product.price = price;
        }
        if (description !== undefined) {
            product.description = description;
        }

        // Handle image update if provided in the request
            // Implement image update logic here as shown in the previous response
        var finalName =product.name.replace(/\s+/g, '_');
            if (req.files && req.files.image) {
            const desImageDir = `${ProductPath}${finalName}`;
            const imgPath = `${desImageDir}/${req.files.image.name}`;

            // Delete the previous image if it exists
            if (fs.existsSync(imgPath)) {
                fs.unlinkSync(imgPath);
            }

            // Create directory if it doesn't exist
            if (!fs.existsSync(desImageDir)) {
                fs.mkdirSync(desImageDir, { recursive: true });
            }

            // Save the new image
            fs.writeFileSync(imgPath, req.files.image.data, 'binary');
            product.image = `https://salesman.aindriya.co.in${URLpathp}/${finalName}/${req.files.image.name}`;
        }

        // Save the updated product
        await product.save();

        res.status(200).json({ message: 'Product updated successfully', product });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

//delete api call

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the product by ID
        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        var finalName =product.name.replace(/\s+/g, '_');
        // Delete the associated image file
        const desImageDir = `${ProductPath}${finalName}`;
        if (fs.existsSync(desImageDir)) {
            fs.rmdirSync(desImageDir, { recursive: true });
        }

        // Delete the product from the database
        await product.destroy();

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.deleteCategorie = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the category by ID
        const categorie = await Categorie.findByPk(id);
        if (!categorie) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Delete the associated image directory
        var finalName =categorie.categoriesName.replace(/\s+/g, '_')
        const desImageDir = `${CategoriePath}${finalName}`;
        if (fs.existsSync(desImageDir)) {
            fs.rmdirSync(desImageDir, { recursive: true });
        }

        // Delete the category from the database
        await categorie.destroy();

        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


exports.deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the category by ID
        const banner = await Banner.findByPk(id);
        if (!banner) {
            return res.status(404).json({ message: 'Category not found' });
        }
        var finalName =banner.name.replace(/\s+/g, '_')
        // Delete the associated image directory
        const desImageDir = `${BannerPath}${finalName}`;
        if (fs.existsSync(desImageDir)) {
            fs.rmdirSync(desImageDir, { recursive: true });
        }

        // Delete the category from the database
        await banner.destroy();

        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


exports.getAllDetails = async (req, res) => {
console.log("get call req")
        try{
                const categories = await Categorie.findAll();
                const products = await Product.findAll();
                const colour = await Colour.findAll();
        const banner =await Banner.findAll();
                const allDetails = {
                        categories,
                        products,
                        colour,
            banner
                }
                res.status(200).json(allDetails);
        }catch(error){
                console.error('Error fetching all details:', error);
        res.status(500).json({ message: 'Internal server error' });
        }
}

exports.createColour = async (req,res) =>{
        console.log("req.body----------",req.body);
        console.log("req.files------------",req.files);
        try{
                const {name,hexCode} = req.body;
        var finalName =name.replace(/\s+/g, '_')
                const desImageDir = `${ColourPath}${finalName}`;
                if(!fs.existsSync(desImageDir)){
                        console.log("entering the path")
                    fs.mkdirSync(desImageDir, {recursive: true});
                }
                var desImageUrl ='';
                fs.writeFileSync(`${desImageDir}/${req.files.image.name}`,req.files.image.data,`binary`);
                destinationImgUrl = `http://localhost${URLpathclr}/${finalName}/${req.files.image.name}`;
                const colour =await Colour.create({
                    name,
                    hexCode,
                    image:destinationImgUrl,
                    createdAt: new Date(),
                    updatedAt: new Date()

                })
                console.log("colour--------",colour)
                res.status(201).json({message:"created successfully",colour});
        }catch(error){
                res.status(500).json({ message: 'Internal server error' });
        }
}


exports.createBanner = async (req,res) =>{

        /*try{
                const {name,productId,description} = req.body;
        var finalName =name.replace(/\s+/g, '_')
                const desImageDir =`${BannerPath}${finalName}`;

                const product = await Product.findOne({ where: { id: productId } });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }


                if(!fs.existsSync(desImageDir)){
                        fs.mkdirSync(desImageDir, {recursive: true});
                }
                var desImageUrl ='';
                fs.writeFileSync(`${desImageDir}/${req.files.image.name}`,req.files.image.data,`binary`);
                destinationImgUrl = `http://localhost${URLpathb}/${finalName}/${req.files.image.name}`;
                const banner =await Banner.create({
                        name,
                        categoriesId:product.categoriesId,
                        productId,
                        description,
            image:destinationImgUrl
                })
                res.status(201).json({message:"created successfully",banner});
                }catch(error){
                        res.status(500).json({ message: 'Internal server error' });
                }*/

	try{
		const {name,percentage}=req.body;
		
		const finalName = name.replace(/\s+/g, '_')
		const desImageDir =`${BannerPath}${finalName}`;
		 if(!fs.existsSync(desImageDir)){
                        fs.mkdirSync(desImageDir, {recursive: true});
                }
                var desImageUrl ='';
                fs.writeFileSync(`${desImageDir}/${req.files.image.name}`,req.files.image.data,`binary`);
                destinationImgUrl = `https://salesman.aindriya.co.in${URLpathb}/${finalName}/${req.files.image.name}`;
		 const banner =await Banner.create({
                        name,
                        percentage,
	                image:destinationImgUrl
                })
		res.status(201).json({message:"created successfully",banner});

	}catch(error){
		res.status(500).json({ message: 'Internal server error' });	
	}
}

exports.updateBanner = async (req,res) =>{
    try{
        const { id } = req.params;
        const banner = await Banner.findByPk(id);
        if (!banner) {
            return res.status(404).json({ message: 'Banner not found' });
        }
        const { name, description} = req.body;
        if (name !== undefined) {
            banner.name = name;
        }
        if (description !== undefined) {
            banner.description = description;
        }
        if (req.files && req.files.image) {
            var finalName =banner.name.replace(/\s+/g, '_')

            const desImageDir =`${BannerPath}${finalName}`;
            const imgPath = `${desImageDir}/${req.files.image.name}`;

            if (fs.existsSync(imgPath)) {
                fs.unlinkSync(imgPath);
            }
            if(!fs.existsSync(desImageDir)){
                fs.mkdirSync(desImageDir, {recursive: true});
            }
            var desImageUrl ='';
            fs.writeFileSync(`${desImageDir}/${req.files.image.name}`,req.files.image.data,`binary`);
            destinationImgUrl = `http://localhost${URLpathb}/${finalName}/${req.files.image.name}`;
            banner.image =destinationImgUrl;

        }
        await banner.save();
        res.status(200).json({ message: 'Product updated successfully', banner });
    }catch(error){
        res.status(500).json({ message: 'Internal server error' });
    }
}


//search api
 // Import your Sequelize models

// Search API route
exports.search =async (req,res) =>{
    try {
        const keyword = req.query.keyword; // Get the keyword from query parameter

        // Search for products matching the keyword
        const product = await Product.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.iLike]: `%${keyword}%` } }, // Case-insensitive search
                    { description: { [Op.iLike]: `%${keyword}%` } }
                ]
            },
            include: [Categorie] // Include the associated category
        });

        // Search for categories matching the keyword
        const categorie = await Categorie.findAll({
            where: {
              categoriesName: { [Op.iLike]: `%${keyword}%` } // Case-insensitive search
            }
        });

        res.json({ product, categorie });
    } catch (error) {
        console.error('Error searching:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


exports.getBanner =async (req,res)=>{
try{
  const banner =await Banner.findAll();
res.status(200).json(banner)
}catch(error){
console.log("error",error)
}
}

//getAttribute

exports.getAttribute=async (req,res)=>{
	try{
	/*const getAttribute = await Attribute.findAll();
console.log("get---------",getAttribute);
	getAttribute.map(function(data){

	console.log(data.id)
	})
	const colour = await Colour.findAll();
	const size = await Size.findAll();
	var result =[getAttribute,colour,size];
	res.status(200).json(result);

		const getAttribute = await Attribute.findAll();
        console.log("get---------", getAttribute);

        // Use Promise.all to handle multiple asynchronous operations
        const attributeDetails = await Promise.all(
            getAttribute.map(async (data) => {
                console.log(data.id);

                // Fetch related colours and sizes for each attribute
                const colours = await Colour.findAll({ where: { attributeId: data.id } });
                const sizes = await Size.findAll({ where: { attributeId: data.id } });

                // Combine the attribute data with its related colours and sizes
                return {
                    ...data.dataValues,
                    colours,
                    sizes
                };
            })
        );

        res.status(200).json(attributeDetails);
*/

const attributes = await Attribute.findAll();
        console.log("get---------", attributes);
//return
        // Use Promise.all to handle multiple asynchronous operations
        const attributeDetails = await Promise.all(
            attributes.map(async (attribute) => {
                console.log("-------------attribute.id----------",attribute.id);
//console.log("attributeDetails=============",attributeDetails);
//return
                // Fetch related colours and sizes for each attribute
                const colours = await Colour.findAll({ where: { attributeId: attribute.id } });
                const sizes = await Size.findAll({ where: { attributeId: attribute.id } });
		const ages = await Age.findAll({ where: { attributeId: attribute.id } });
console.log("colours-------",colours);
console.log("sizes----------",sizes);
console.log("sizes----------",ages);
                // Only include non-empty values arrays in the response
                const response = {
                    id: attribute.id,
                    attribute: attribute.attribute,
		    status: attribute.status,
                    createdAt: attribute.createdAt,
                    updatedAt: attribute.updatedAt,
                };

	console.log("---------responce----------",response); 
//return       
        if (colours.length > 0) {
                    response.values = colours;
                }

                if (sizes.length > 0) {
                    response.values = sizes;
                }
		if (ages.length > 0) {
                    response.values = ages;
                }

                return response;
            })
        );

        res.status(200).json(attributeDetails);

	}catch(error){
		console.log(error)
		res.status(500).json({message:'Internal server Error'})
	}
}

//createAttribute

exports.createAttributes = async (req, res) => {
console.log("req.body---------",req.body)
    const attributeName = req.body.attributeName;
    const values = req.body.value;
    console.log("values",values);

    try {
        // Define a mapping between attribute names and table models
        const tableMappings = {
            Colour: Colour,
            Size: Size,
            Age: Age
            // Add more mappings as needed for other attributes
        };

        // Check if the attribute table exists in the mapping
        if (!tableMappings[attributeName]) {
            return res.status(400).json({ error: 'Invalid attribute name' });
        }

        // Get the corresponding table model based on the attribute name
        const TableModel = tableMappings[attributeName];

        // Create the attribute in the attribute table if it doesn't exist already
        let attribute = await Attribute.findOne({ where: { attribute: attributeName } });
        if (!attribute) {
            attribute = await Attribute.create({ attribute: attributeName });
        }

        // Iterate through the values and save them in the corresponding table
        const valuePromises = values.map(async (value) => {
            console.log("value",value)
	   
            // Save each value along with the attributeId in the corresponding table
        /*    await TableModel.create({
                value:value,
                attributeId: attribute.id
            });
        });

        // Wait for all value creations to complete
        await Promise.all(valuePromises);
	*/
	const existingValue = await TableModel.findOne({
        where: {
            value: value,
            attributeId: attribute.id
        }
    });

    // If the value does not exist, create a new record
    if (!existingValue) {
        await TableModel.create({
            value: value,
            attributeId: attribute.id
        });
    } else {
        console.log(`Value "${value}" already exists for attributeId ${attribute.id}`);
    }
	})
        res.status(200).json({ message: 'Attributes and values created successfully' });
    } catch (error) {
        console.error('Error creating attributes:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};




exports.createCompainAttribute = async (req, res) => {
console.log("req.params---",req.params)
    try {
	const productId =req.params.productId;
console.log("productId-----------",productId)
        const { colour_Value_Id, size_Value_Id, stock, pcs, description, variationPrice } = req.body;
        const image = req.file; // Assuming image is uploaded using multipart form-data
	
	const size = await Size.findAll({where:{id:size_Value_Id}})
	const colour  = await Colour.findAll({where:{id:colour_Value_Id}})
	const sizeName=size[0].dataValues.value;
	const colourName =colour[0].dataValues.value;
        // Check if productId is provided
        if (!productId) {
            return res.status(400).json({ error: 'Product ID is required' });
        }

        const originalImageDir = `/etc/ec/data/CompainAttributeImage/original`;

        if (!fs.existsSync(originalImageDir)) {
            fs.mkdirSync(originalImageDir, { recursive: true });
        }

        const thumbnailDir = `/etc/ec/data/CompainAttributeImage/thumbnails`;
        if (!fs.existsSync(thumbnailDir)) {
            fs.mkdirSync(thumbnailDir, { recursive: true });
        }

	if (req.files && req.files.image) {
	console.log("=========entering the if condition---------")
   		 const images = req.files.image;
console.log("----------",images)
    		const imageName = images.name.replace(/ /g, '_');
    		const originalImagePath = `${originalImageDir}/${imageName}`;

    		await images.mv(originalImagePath);
 
		//else {
    		//res.status(400).json({ error: 'No file uploaded or field name is incorrect' });
		//}
	console.log("images-------",images)
        const extension = path.extname(images.name).toLowerCase();
        const thumbnailImagePath = `${thumbnailDir}/${path.basename(imageName, extension)}.webp`;

        let pipeline;
        if (extension === '.png' || extension === '.jpg' || extension === '.jpeg') {
            pipeline = sharp(originalImagePath)
            .resize({ width: 200, height: 200 })
            .toFormat('webp') // Convert to WebP format
            .webp({ quality: 80 }) // Set WebP quality
            .toFile(thumbnailImagePath);
        } else {
            throw new Error('Unsupported file format');
        }
    
        await pipeline;

            const originalImageUrl = `https://salesman.aindriya.co.in/CompainAttributeImage/original/${imageName}`;
            const thumbnailImageUrl = `https://salesman.aindriya.co.in/CompainAttributeImage/thumbnails/${path.basename(imageName, extension)}.webp`;

        // Create the CompainAttribute record in the database
        const compainAttribute = await CompainAttributes.create({
            productId: productId,
            colour_Value_Id: colour_Value_Id,
            size_Value_Id: size_Value_Id,
            colour: colourName,
            size: sizeName,
            stock: stock,
            pcs: pcs,
            image: originalImageUrl, // Save the image path if provided
            description: description,
            variationPrice: variationPrice
        });

        // Return success response
        res.status(201).json({ message: 'CompainAttribute created successfully', compainAttribute });
	}
    } catch (error) {
        console.error('Error creating CompainAttribute:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


exports.getColour =async(req,res) =>{
	try{
		const colour =await Colour.findAll();
		console.log("colour-------",colour);
		res.status(200).json(colour)
	}catch(error){
		res.status(500).json({message:'Internal Server Error'})
	}

}

exports.getSize = async (req,res) =>{
	try{
		const size = await Size.findAll();
		res.status(200).json(size)
	}catch(error){
		res.status(500).json({message:'Internal Server Error'});
	}

}

