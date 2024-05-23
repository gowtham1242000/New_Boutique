const Order =require('../models/Orders');
//const PaymentDetail = require('../models/PaymentDetails');
const ProductDiscount = require('../models/ProductDiscount');
const UserOrderDetail = require('../models/UserOrderDetails');
const CompainAttribute = require('../models/CompainAttribute');
const AttributeVariation = require('../models/AttributeVariations')
const Product = require('../models/Products');
const ProductLike = require('../models/ProductLikes');
const UserProductLike = require('../models/UserProductLikes');
const Categorie = require('../models/Categories');
const {Sequelize,Op,literal} = require('sequelize');
const express = require('express');
const app = express();
const server = require('http').createServer(app); // Create HTTP server using Express app
const io = require('socket.io')(server); 

exports.createOrder = async (req, res) => {
    try {
        const userId  = req.params.userId;
        console.log("----------",userId);
	const {product_Id,quantity,paymentMethod,price,subPrice,tax,discount,transactionId,paymentStatus,shippingAddress,phoneNumber,addressLable,colour,size} = req.body;

        // Assuming you have the logic to calculate price, tax, and discount based on product details
//        const price = calculatePrice(product_Id);
  //      const tax = calculateTax(product_Id);
    //    const discount = calculateDiscount(product_Id);

	const com_Attribute = await CompainAttribute.findAll({where:{colour_Value_Id:colour,size_Value_Id:size}});
	console.log("com_Attribute------------",com_Attribute.id);

	//if(order_Type == 'COD'){ // cod cash on delivery
        // Create order record
        const order = await Order.create({
            order_Status: 'Pending',
            user_Id: userId,
            product_Id: product_Id,
            price: price,
            quantity: quantity,
//            status: 1, // Assuming 1 represents an active order
            subPrice: subPrice,
            tax: tax,
            discount: discount,
	    compainAttribute_Id:com_Attribute[0].dataValues.id
        });

	const userOrder = await UserOrderDetail.create({
		order_Id: order.id,
		user_Id: userId,
		product_Id: product_Id,
		price: price,
		shippingAddress:shippingAddress,
		phoneNumber:phoneNumber,
		addressLable:addressLable,
		paymentMethod:paymentMethod,
            	transactionId: transactionId,
           	 paymentStatus: paymentStatus
	}) 
	
	
        // Create payment record
/*        await PaymentDetails.create({
            user_Id: userId,
            order_Id: order.id, // Assuming the ID of the created order
            paymentMethod: paymentMethod,
            transactionId: transactionId,
            paymentStatus: paymentStatus
        });
*/
        // Update product discount details if applicable
        const productDiscount = await ProductDiscount.findOne({ where: { ProductId: product_Id } });
        if (productDiscount) {
            // Update discount details
            // Assuming you have the logic to update the discount details based on the order
        };
/*	}else{
		payment();	
	}*/

        res.status(201).json({ message: 'Order created successfully' });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


//getOrders
/*exports.getOrders = async (req,res)=>{
	const userId = req.params.userId;
	try{
		const order = await Order.findAll({where:{user_Id:userId}});
		console.log("order--------",order);
		order.map(async function(orders){
			console.log("orders--------",orders.id)
			const compainAttribute =await  CompainAttribute.findAll({where:{id:orders.compainAttribute_Id}});
			console.log("compainAttribute---",compainAttribute)
		});
		res.status(200).json({message:'Get the order details',order})
	}catch (error){
		console.log("error----",error)
		res.status(500).json({message:'Internal Server Error'})

	}
}*/

exports.getOrders = async (req, res) => {
    const userId = req.params.userId;
    try {
        const orders = await Order.findAll({ where: { user_Id: userId } });

        const ordersWithCompain = await Promise.all(orders.map(async (order) => {
            const compainAttribute = await CompainAttribute.findAll({ where: { id: order.compainAttribute_Id } });
            return {
                id: order.id,
                order_Status: order.order_Status,
                // Add other order properties as needed
                compainAttribute: compainAttribute
            };
        }));

        res.status(200).json({ message: 'Get the order details', orders: ordersWithCompain });
    } catch (error) {
        console.error("error----", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

//getBooking
exports.getBooking = async (req, res) => {
    const userId = req.params.userId;
    try {
        const orders = await Order.findAll({ where: { user_Id: userId,order_Status:'PreBook' } });

        const ordersWithCompain = await Promise.all(orders.map(async (order) => {
            const compainAttribute = await CompainAttribute.findAll({ where: { id: order.compainAttribute_Id } });
            return {
                id: order.id,
                order_Status: order.order_Status,
                // Add other order properties as needed
                compainAttribute: compainAttribute
            };
        }));

        res.status(200).json({ message: 'Get the order details', orders: ordersWithCompain });
    } catch (error) {
        console.error("error----", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}


exports.getInterest = async (req, res) => {
    const userId = req.params.userId;
    try {
        const orders = await Order.findAll({ where: { user_Id: userId,order_Status:'Enquiry' } });

        const ordersWithCompain = await Promise.all(orders.map(async (order) => {
            const compainAttribute = await CompainAttribute.findAll({ where: { id: order.compainAttribute_Id } });
            return {
                id: order.id,
                order_Status: order.order_Status,
                // Add other order properties as needed
                compainAttribute: compainAttribute
            };
        }));

        res.status(200).json({ message: 'Get the order details', orders: ordersWithCompain });
    } catch (error) {
        console.error("error----", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.getCategories = async(req,res)=>{
try{ 
const categories = await Categorie.findAll();
res.status(200).json(categories)
}catch(error){
console.log("error",error)
}
}

/*exports.getProducts = async (req,res)=>{

	try{
		const product =await Product.findAll({});
		console.log("products==========",product);
		res.status(200).json({message:'get product list',product})
	}catch(error){
	console.log("error",error)
	}
}*/

/*exports.getProducts = async (req, res) => {
    try {
        // Fetch all products
        const products = await Product.findAll({});

        // Use Promise.all to fetch related details for each product
        const productDetails = await Promise.all(products.map(async (product) => {
            const productId = product.id;

            // Fetch related details from other tables
            const productDiscount = await ProductDiscount.findOne({ where: { productId:productId } });
            const campaignAttributes = await CompainAttribute.findAll({ where: { productId:productId } });
            const attributeVariation = await AttributeVariation.findAll({ where: { ProductId:productId } });
            // Combine the details for the current product
            return {
                product,
                discount: productDiscount,
                campaignAttributes,
                attributeVariation
            };
        }));

        // Send the combined details in the response
        res.status(200).json({
            message: 'Product list fetched successfully',
            productDetails
        });
    } catch (error) {
        console.log("error", error);
        res.status(500).json({ message: 'An error occurred', error });
    }
};*/

exports.getProducts = async (req,res) =>{
	try{
		const products = await Product.findAll();
		products.map(function(data){
			console.log("data",data.id)
	return
		})
		res.status(200).json({products})
	}catch(error){
		console.log(error)
		res.status(500).json({message:'Internal Server Error'})
	}
}


//getProductDetails
exports.getProductDetails =async (req,res)=>{
	try{
		const product_Id =req.params.productId;
		const products = await Product.findAll({where:{id:product_Id}});
console.log("products--",products);
console.log("products--",products[0].dataValues.id)
        // Use Promise.all to fetch related details for each product
        //const productDetails = await Promise.all(products.map(async (product) => {
            const productId = products[0].dataValues.id;


            // Fetch related details from other tables
            const productDiscount = await ProductDiscount.findOne({ where: { productId:productId } });
            const campaignAttributes = await CompainAttribute.findAll({ where: { productId:productId } });
            const attributeVariation = await AttributeVariation.findAll({ where: { ProductId:productId } });
            // Combine the details for the current product
            /*return {
                products,
                discount: productDiscount,
                campaignAttributes,
                attributeVariation
            };*/
        //}));

        // Send the combined details in the response
        res.status(200).json({
            message: 'Product list fetched successfully',
            products,productDiscount,campaignAttributes,attributeVariation
        });

	}catch(error){
		console.log("error", error);
	        res.status(500).json({ message: 'An error occurred', error });

	}
}

//like
/*
exports.likeProduct = async (req, res) => {
    try {
        const productId = req.params.id;
console.log("Like-------",productId)	
	const product = Product.findAll({where:{id:productId}})
	if(!product){
		return res.status(500).json({meaasge:'No product Found'})
	}
        // Find or create the like entry for the product
        const [likeEntry, created] = await ProductLike.findOrCreate({
            where: { productId },
            defaults: { likeCount: 1 }
        });

        // Increment the like count if the entry already exists
        if (!created) {
            likeEntry.likeCount += 1;
            await likeEntry.save();
        }

        res.status(200).json({ message: 'Product liked successfully', likeEntry });
    } catch (error) {
        console.log("error", error);
        res.status(500).json({ message: 'An error occurred', error });
    }
}
*/



exports.likeProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const userId = req.body.userId; // Assuming the user ID is sent in the request body

        // Check if the product exists
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Find or create the like entry for the product
        const [likeEntry, created] = await ProductLike.findOrCreate({
            where: { productId },
            defaults: { likeCount: 1 }
        });

        if (!created) {
            likeEntry.likeCount += 1;
            await likeEntry.save();
        }

        // Check if the user already liked the product
        const userProductLike = await UserProductLike.findOne({ where: { productId, userId } });

        if (userProductLike) {
            // If the user already liked the product, remove the like (dislike)
            await userProductLike.destroy();
            likeEntry.likeCount -= 1; // Decrease the like count
            await likeEntry.save();
            return res.status(200).json({ message: 'Product disliked successfully', likeCount: likeEntry.likeCount });
        } else {
            // If the user didn't like the product yet, add the like
            await UserProductLike.create({ userId, productId, productLikeId: likeEntry.id });
            return res.status(200).json({ message: 'Product liked successfully', likeCount: likeEntry.likeCount });
        }
    } catch (error) {
        console.log("error", error);
        res.status(500).json({ message: 'An error occurred', error });
    }
};




exports.likeCounts = async(req,res)=>{
	try{
		const popular = await UserProductLike.findAll({
            	attributes: [
                'productId',
                [Sequelize.fn('COUNT', Sequelize.col('productId')), 'count']
            	],
            	group: 'productId',
            	order: [[Sequelize.fn('COUNT', Sequelize.col('productId')), 'DESC']],
            	limit: 5
	})
	const productIds = popular.map(data => data.productId);

        // Fetch product details
        const products = await Product.findAll({
            where: {
                id: productIds
            }
        });

        // Map product details to the popular results
        const result = popular.map(data => {
            const product = products.find(p => p.id === data.productId);
            return {
                productId: data.productId,
                count: data.get('count'),
                productDetails: product // assuming product is found
            };
        });

	res.status(200).json(result)

	}catch(error){
		console.log("error",error);
		res.status(500).json({message:'Internal Server Error'});
	}
};



function payment(){

	const crypto = require('crypto');
	const axios = require('axios');
// const { merchant_id, salt_key } = require('../../secret');
	require("dotenv").config();

	const { merchant_id, salt_key } = process.env;

	const newPayment = async (req, res) => {
    		try {
        		const { name, merchantTransactionId, merchantUserId, amount } = req.body

        		const data = {
            			merchantId: merchant_id,
            			merchantTransactionId,
            			merchantUserId,
            			name,
            			amount: amount * 100,
            			// redirectUrl: `http://localhost:8080/scriptview/payment/gateway/status/${merchantTransactionId}`,
            			redirectMode: 'POST',
            			paymentInstrument: {
                		type: 'PAY_PAGE'
            		}
        	};
        	const payload = JSON.stringify(data);
        	const payloadMain = Buffer.from(payload).toString('base64');
        	const keyIndex = 1;
        	const string = payloadMain + '/pg/v1/pay' + salt_key;
        	const sha256 = crypto.createHash('sha256').update(string).digest('hex');
        	const checksum = sha256 + '###' + keyIndex;

        	const prod_URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay"
        	const options = {
            		method: 'POST',
            		url: prod_URL,
            		headers: {
                	accept: 'application/json',
                	'Content-Type': 'application/json',
                	'X-VERIFY': checksum
            	},
            	data: {
                	request: payloadMain
            	}
        };

        axios.request(options).then(function (response) {
            console.log(response.data)
            return res.redirect(response.data.data.instrumentResponse.redirectInfo.url)
        })
            .catch(function (error) {
                console.error(error);
            });

    } catch (error) {
        res.status(500).send({
            message: error.message,
            success: false
        })
    }
}

const checkStatus = async (req, res) => {

    const {merchantTransactionId, merchantId} = res.req.body

    const keyIndex = 1;
    const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + salt_key;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = sha256 + "###" + keyIndex;

    const options = {
        method: 'GET',
        url: `https://api.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${merchantTransactionId}`,
        headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            'X-VERIFY': checksum,
            'X-MERCHANT-ID': `${merchantId}`
        }
    };

    axios.request(options).then(async (response) => {
        if (response.data.success === true) {
            const url = `http://localhost:3000/success`
            return res.redirect(url)
        } else {
            const url = `http://localhost:3000/failure`
            return res.redirect(url)
        }
    })
        .catch((error) => {
            console.error(error);
        });
};


//module.exports = { newPayment, checkStatus }

}






