const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const fileUpload          = require('express-fileupload');
const util =require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');

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
const ProductDiscounts = require('../models/ProductDiscount');


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

// exports.createAttribute = async (req,res) =>{
//     //const {attribute,values,status} = req.body;
//     console.log("req.body-------",req.body)
//     try{
//         const {attribute,values,status} = req.body;
//         const createAttribute = await Attribute.create({attribute});
//         console.log("attribute----------",createAttribute);
//     }catch(error){
//         console.log("error-------",error)
//     }

// }

exports.loginRequestOtp = async (req, res) => {
  try {
    const { mobilenumber } = req.body;
    const otp = generateOTP();
    const otpTimestamp = new Date();

    // Create user record with mobile number and OTP
    await User.create({ mobilenumber, otp, otpTimestamp });

    // Send OTP via SMS
    await sendOTP(mobilenumber, otp);

    res.status(200).json({ message: 'OTP sent successfully', otp });
  } catch (error) {
    console.error('Error generating OTP:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


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
         await user.destroy();
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
        destinationImgUrl = `http://localhost${URLpathc}/${finalName}/${req.files.image.name}`;
        const categorie = await Categorie.create({
                categoriesName:categoriesName,
                image:destinationImgUrl,
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
    try {
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
        console.log("req.files.image.name---------",req.files.image.name)
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

        // Update the category's image URL
        categorie.image = `http://localhost${URLpathc}/${finalName}/${req.files.image.name}`;

        // Save the updated category
        await categorie.save();

        res.status(200).json({ message: 'Category image updated successfully', categorie });
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
        const { name, code, categorie, sellingPrice, status, description,
            minimumQuantity, discountPercentage, gstTaxPercentage,
            minimumQuantityWholesale, wholesalePrice } = req.body;
console.log("categories--------",categorie)
            const categories = await Categorie.findAll({where:{id:categorie}})
        const  categoriesName= categories[0].dataValues.categoriesName;
        console.log("categoriesName",categoriesName);
        // Create the product
        const product = await Product.create({ name, code, categories:categoriesName,categoriesId:categorie, sellingPrice, status, description });
const productId = product.dataValues.id
console.log("productId---",productId)

        // Create the product discount
        await ProductDiscounts.create({
            minimum_Quantity_Discount:minimumQuantity, discount_Percentage:discountPercentage, tax_Percentage:gstTaxPercentage,
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



exports.createCompainAttribute = async (req, res) => {
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


exports.createAttributeVariation = async (req, res) => {
    try {
        const productId = req.params.productId;
        const variationData = req.body;

        // Function to fetch colourName based on colourId
        const getColourName = async (colourId) => {
            const colour = await Colour.findByPk(colourId);
            return colour ? colour.colourName : null;
        };

        // Function to fetch size based on sizeId
        const getSize = async (sizeId) => {
            const size = await Size.findByPk(sizeId);
            return size ? size.size : null;
        };

        // Iterate over each variation object in the request body
        for (const variation of variationData) {
            const { colourId, sizeId, stock, pcs, image, description, price } = variation;

            // Fetch the colourName and size based on the colourId and sizeId
            const colourName = await getColourName(colourId);
            const size = await getSize(sizeId);

            // Create or update the AttributeVariation entry
            await AttributeVariation.create({
                colourId: colourId,
                sizeId: sizeId,
                colourName: colourName, // Add the fetched colourName
                size: size, // Add the fetched size
                stock: stock,
                pcs: pcs,
                image: image,
                description: description,
                variationPrice: price,
                ProductId: productId
            });
        }

        res.status(201).json({ message: 'Attribute variations created successfully' });
    } catch (error) {
        console.error('Error creating attribute variations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};




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
            if (req.files && req.files.img) {
            const desImageDir = `${ProductPath}${finalName}`;
            const imgPath = `${desImageDir}/${req.files.img.name}`;

            // Delete the previous image if it exists
            if (fs.existsSync(imgPath)) {
                fs.unlinkSync(imgPath);
            }

            // Create directory if it doesn't exist
            if (!fs.existsSync(desImageDir)) {
                fs.mkdirSync(desImageDir, { recursive: true });
            }

            // Save the new image
            fs.writeFileSync(imgPath, req.files.img.data, 'binary');
            product.img = `http://localhost${URLpathp}/${finalName}/${req.files.img.name}`;
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

        try{
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

exports.createAttributes = async (req, res) => {
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
            await TableModel.create({
                value:value,
                attributeId: attribute.id
            });
        });

        // Wait for all value creations to complete
        await Promise.all(valuePromises);

        res.status(200).json({ message: 'Attributes and values created successfully' });
    } catch (error) {
        console.error('Error creating attributes:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



exports.AttributeVariations = async (req, res) => {
    try {
        const { variations } = req.body; // Extract variations array from request body
        const { productId } = req.params; // Extract productId from request parameters

        if (Array.isArray(variations)) {
            // If variations is an array, it means multiple variations are being created
            for (const variation of variations) {
                await createSingleVariation(productId, variation);
            }
        } else {
            // If variations is not an array, it means a single variation is being created
            await createSingleVariation(productId, variations);
        }

        // Return success response
        res.status(201).json({ message: "Attribute variation(s) created successfully" });
    } catch (error) {
        console.error("Error creating attribute variation(s):", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

async function createSingleVariation(productId, variation) {
    const { colourId, sizeId, stock, pcs, image, description, price } = variation;

    // Create AttributeVariation entry for the current variation
    await AttributeVariations.create({
        colourId: colourId,
        sizeId: sizeId,
        pcs: pcs,
        ProductId: productId, // Associate with the provided productId
        Image: image,
        description: description,
        variationPrice: price,
        Stock: stock
    });
}


