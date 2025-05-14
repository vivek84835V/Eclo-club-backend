import express from 'express';
import {
  getAllProducts,
  getProductById,
  addToCart,
  removeFromCart,
  createOrder,
  getUserOrders,
  addProduct,
  editProduct,
  deleteProduct,
  getAllOrders,
  getAllCategories,
  addCategory, 
  getCartItem,
  addAddress,
  getUserAddresses,
  updateAddress,
  deleteAddress,
  createOrderpayment
} from '../controllers/controller.js';
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// ============================== PUBLIC ROUTES ==============================

// Product Routes (Public)
router.get('/products', getAllProducts); 
router.get('/products/:id', getProductById);

// Cart Routes (Public for logged-in users, ideally should verify user later)
router.post('/cart/add', addToCart);
router.post('/cart/remove', removeFromCart);
router.get('/cart/cartItem', getCartItem);

// Order Routes (Public for logged-in users, ideally should verify user later)
router.post('/orders', createOrder);
router.get('/orders/user/:id', getUserOrders);

// ============================== ADMIN ROUTES (Protected) ==============================

// Product Management (Admin Only)
router.get('/admin/products', authenticate, getAllProducts);
router.post('/admin/products', authenticate, addProduct);
router.put('/admin/products/:id', authenticate, editProduct);
router.delete('/admin/products/:id', authenticate, deleteProduct);

// Order Management (Admin Only)
router.get('/admin/orders', authenticate, getAllOrders);

//category
router.get('/categories', getAllCategories);
router.post('/categories', addCategory); // optional for admin to add new categories

// 📬 Address routes
router.post("/address/add", addAddress);
router.get("/address/:userId", getUserAddresses);
router.put("/address/update/:id", updateAddress);
router.delete("/address/delete/:id", deleteAddress);


///razorpay
router.post("/create-order", createOrderpayment);

export default router;
