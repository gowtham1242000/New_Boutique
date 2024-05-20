const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');


router.post('/createOrder/:userId', userController.createOrder);
router.get('/getOrders/:userId', userController.getOrders);
router.get('/getBooking/:userId', userController.getBooking);
router.get('/getInterest/:userId', userController.getInterest);
router.get('/getProducts', userController.getProducts);
router.post('/likeProduct/:id', userController.likeProduct);
router.get('/getProductDetails/:productId', userController.getProductDetails);
router.get('/getCategories', userController.getCategories);
router.get('/likeCounts',userController.likeCounts);
//router.get('/popularProducts', userController.popularProducts);
//router.get('/getOrders', userController.getOrder);


// router.post('/categories', adminController.createCategorie);
// router.post('/products', adminController.createProduct);
// router.post('/colours',adminController.createColour);
// router.post('/banners',adminController.createBanner);
// router.put('/categories/:id', adminController.updateCategorie);
// router.put('/products/:id', adminController.updateProduct);
// router.put('/banners/:id', adminController.updateBanner);
// router.delete('/products/:id', adminController.deleteProduct);
// router.delete('/categories/:id', adminController.deleteCategorie);
// router.delete('/banners/:id', adminController.deleteBanner);
// router.get('/getAll', adminController.getAllDetails);
// router.get('/search', adminController.search);


module.exports = router;

