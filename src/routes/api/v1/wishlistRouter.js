const router = require("express").Router();
const WishlistCon = require("../../../controllers/v1/Wishlist.controller");
const auth = require("../../../utils/auth");

/********************** CATEGORY ************************/
/**
 * Get Seller data
 * /api/v1/wishlist/list
 */
router.get("/list",auth.isAuth, WishlistCon.getProdWishList);

/**
 * Add product to wishlist
 * /api/v1/wishlist/add-prod
 */
router.post("/add-prod",auth.isAuth, WishlistCon.crWishlistProd);

/**
 * Delete product
 * /api/v1/wishlist/del-prod
 */
router.post("/del-prod",auth.isAuth, WishlistCon.delProdInWishlist);

/**
 * Delete multiple product
 * /api/v1/wishlist/del-prod
 */
router.post("/del-mul-prod",auth.isAuth, WishlistCon.delProdInWishlist);




/********************** CATEGORY ************************/


module.exports = router;
