// src/controllers/controller.js

import Razorpay from "razorpay";
import prisma from '../DB/db.config.js';


const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});


export const createOrderpayment = async (req, res) => {
  try {
    const { amount, currency = "INR", receipt = "receipt_001" } = req.body;

    const order = await razorpayInstance.orders.create({
      amount, // in paise
      currency,
      receipt,
    });

    res.status(200).json(order);
  } catch (error) {
    console.error("Razorpay Error:", error);
    res.status(500).json({ error: "Order creation failed" });
  }
};

// ============================== PRODUCT ROUTES ==============================

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        productImages: true,
      },
    });
    res.status(200).json({ success: true, message: "Products fetched successfully", data: products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Error fetching products", devError: error.message });
  }
};

export const getCartItem = async(req,res)=>{
  try{
    const Item = await prisma.cartItem.findMany({
      include:{
        cart:true,
        product:true,
      },
    })
    res.status(200).json({success:true,message:"cartItem add succesfully", data: Item})
  }
  catch(error)
  {
    res.status(500).json({success:false,error:"cartItem fail to add",devError:error.message})
  }   
}

// Get product by ID
export const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        productImages: true,
      },
    });

    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    res.status(200).json({ success: true, message: "Product fetched successfully", data: product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Error fetching product", devError: error.message });
  }
};

export const addProduct = async (req, res) => {
  const { name, description, price, images, categoryId, stock, discountPrice } = req.body;

  // 1. Validate required fields
  if (!name || !price || !categoryId || stock === undefined) {
    return res.status(400).json({ success: false, message: "Name, Price, Stock, and CategoryId are required." });
  }

  try {
    // 2. Create product
    const product = await prisma.product.create({
      data: {
        name,
        description: description || "",
        price: parseFloat(price),
        stock: parseInt(stock),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        categoryId,
      },
    });

    // 3. Create images (if provided)
    if (Array.isArray(images) && images.length > 0) {
      await prisma.productImage.createMany({
        data: images.map((imageUrl) => ({
          productId: product.id,
          imageUrl,
        })),
      });
    }

    // 4. Send success response
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });

  } catch (error) {
    console.error("Error adding product:", error);

    if (error.code === 'P2003') {
      // Foreign key constraint failed (invalid categoryId)
      return res.status(400).json({ success: false, message: "Invalid Category ID." });
    }

    res.status(500).json({
      success: false,
      message: "Something went wrong while creating the product.",
      devError: error.message, // Optional detailed error
    });
  }
};


// Edit existing product
export const editProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, images, categoryId } = req.body;
  try {
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { name, description, price, categoryId },
    });

    await prisma.productImage.deleteMany({ where: { productId: id } });

    if (Array.isArray(images) && images.length > 0) {
      await prisma.productImage.createMany({
        data: images.map((imageUrl) => ({
          productId: updatedProduct.id,
          imageUrl,
        })),
      });
    }

    res.status(200).json({ success: true, message: "Product updated successfully", data: updatedProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Edit product failed", devError: error.message });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.productImage.deleteMany({ where: { productId: id } }); // ✅ Also delete related images
    await prisma.product.delete({ where: { id } });

    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Delete product failed", devError: error.message });
  }
};

// ============================== ORDER ROUTES ==============================

// Create new order
export const createOrder = async (req, res) => {
  const { userId, items, totalAmount } = req.body;
  try {
    const order = await prisma.order.create({
      data: {
        userId,
        totalAmount,
        orderItems: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAtPurchase: item.price,
          })),
        },
      },
    });
    res.status(201).json({ success: true, message: "Order created successfully", data: order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Order creation failed", devError: error.message });
  }
};

// Get all orders for a user
export const getUserOrders = async (req, res) => {
  const { id } = req.params;
  try {
    const orders = await prisma.order.findMany({
      where: { userId: id },
      include: {
        orderItems: { include: { product: true } },
      },
    });
    res.status(200).json({ success: true, message: "Orders fetched successfully", data: orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Error fetching user orders", devError: error.message });
  }
};

// Get all orders (admin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        orderItems: { include: { product: true } },
        user: true,
      },
    });
    res.status(200).json({ success: true, message: "Orders fetched successfully", data: orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Error fetching all orders", devError: error.message });
  }
};

// ============================== CART ROUTES ==============================

// Add to cart
export const addToCart = async (req, res) => {
  const { name,email,userId, productId, quantity } = req.body;

  if (!userId || !productId || !quantity) {
    return res.status(400).json({
      success: false,
      error: "Missing userId, productId, or quantity",
    });
  }

  try {
    let user = await prisma.user.findUnique({
      where: { firebaseUid: userId },
    });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          firebaseUid: userId,
          name: name || "Unknown User",
          email: email || "null",
        },
      });
    }

    const userCart = await prisma.cart.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });

    const cartId = userCart.id;

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId,
        productId,
      },
    });

    let cartItem;
    if (existingItem) {
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: { increment: quantity } },
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          cartId,
          productId,
          quantity,
        },
      });
    }

    res.status(201).json({
      success: true,
      message: "Item added to cart",
      data: cartItem,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({
      success: false,
      error: "Add to cart failed",
      devError: error.message,
    });
  }
};

// Remove from cart
export const removeFromCart = async (req, res) => {
  const { userId, productId } = req.body;

  try {
    const userCart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!userCart) {
      return res.status(404).json({ success: false, error: "Cart not found" });
    }

    await prisma.cartItem.delete({
      where: {
        cartId_productId: {
          cartId: userCart.id,
          productId,
        },
      },
    });

    res.status(200).json({ success: true, message: "Item removed from cart" });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({
      success: false,
      error: "Remove from cart failed",
      devError: error.message,
    });
  }
};


// ============================== CATEGORY ROUTES ==============================

// Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.status(200).json({ success: true, message: "Categories fetched successfully", data: categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Error fetching categories", devError: error.message });
  }
};

// (Optional) Add new category
export const addCategory = async (req, res) => {
  const { name } = req.body;
  try {
    const category = await prisma.category.create({
      data: { name },
    });
    res.status(201).json({ success: true, message: "Category created successfully", data: category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Add category failed", devError: error.message });
  }
};

//////////////////////ADDRESESS//////////////////////////

// ✅ Add Address
export const addAddress = async (req, res) => {
  console.log("📩 Incoming request to add address", req.body);
  try {
    const {
      userId,
      name,
      phone,
      street,
      city,
      state,
      zipCode,
      country,
      isDefault,
    } = req.body;

    if (!userId || !name || !phone || !street || !city || !state || !zipCode || !country) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    let user = await prisma.user.findUnique({ where: { firebaseUid: userId } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          firebaseUid: userId,
          name: "Unknown User",
          email: `${userId}@noemail.com`,
        },
      });
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId: user.id,
        name,
        phone,
        street,
        city,
        state,
        zipCode,
        country,
        isDefault: !!isDefault,
      },
    });

    res.status(201).json({ success: true, message: "Address added", data: newAddress });
  } catch (error) {
    console.error("💥 Add address error:", error);
    res.status(500).json({ success: false, message: "Server error", devError: error.message });
  }
};

// ✅ Get User Addresses
export const getUserAddresses = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await prisma.user.findUnique({ where: { firebaseUid: userId } });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: { isDefault: "desc" },
    });

    res.status(200).json({ success: true, data: addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch", devError: error.message });
  }
};

// ✅ Update Address
export const updateAddress = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    phone,
    street,
    city,
    state,
    zipCode,
    country,
    isDefault,
  } = req.body;

  try {
    const existingAddress = await prisma.address.findUnique({ where: { id } });
    if (!existingAddress) return res.status(404).json({ success: false, message: "Not found" });

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: existingAddress.userId },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id },
      data: {
        name,
        phone,
        street,
        city,
        state,
        zipCode,
        country,
        isDefault: !!isDefault,
      },
    });

    res.status(200).json({ success: true, message: "Updated", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Update failed", devError: error.message });
  }
};

// ✅ Delete Address
export const deleteAddress = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await prisma.address.delete({ where: { id } });
    res.status(200).json({ success: true, message: "Deleted", data: deleted });
  } catch (error) {
    res.status(500).json({ success: false, message: "Delete failed", devError: error.message });
  }
};