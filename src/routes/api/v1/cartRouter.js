const router = require("express").Router();
const CartCon = require("../../../controllers/v1/Cart.controller");
const auth = require("../../../utils/auth");

/**
 * Add product into user cart
 * /api/v1/users/add-product
 */
router.post("/add-product", auth.isAuth, CartCon.addProduct);

/**
 * Get all product in cart
 * /api/v1/users/cart-data
 */
router.post("/cart-data", auth.isAuth, CartCon.getCart);

/**
 * Update quantity of product in cart
 * /api/v1/users/update-cart-product
 */
router.put("/update-cart-product", auth.isAuth, CartCon.updateCart);

/**
 * Delete product in cart
 * /api/v1/users/del-cart-product
 */
router.delete("/del-cart-product", auth.isAuth, CartCon.delProdCart);

/**
 * Delete all product in cart
 * /api/v1/users/del-all-cart
 */
router.delete("/del-all-cart", auth.isAuth, CartCon.delAllProdCart);

module.exports = router;
