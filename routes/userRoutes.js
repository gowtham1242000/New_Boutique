const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');


router.post('/createOrder/:productId', userController.createOrder);




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

