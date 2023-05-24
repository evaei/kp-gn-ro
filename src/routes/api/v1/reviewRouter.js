const router = require("express").Router();
const ReviewCon = require("../../../controllers/v1/Review.controller");
const auth = require("../../../utils/auth");

/**
 * Create review product
 * /api/v1/review/cr-review
 */
router.post("/cr-review", auth.isAuth, ReviewCon.crReviewProd);

/**
 * Get all product review
 * /api/v1/review/product-review/{productId}/{limit}/{page}
 */
router.get("/all-review/:id/:limit/:page", auth.isAuth, ReviewCon.getAllReviewList);

/**
 * Get all product review
 * /api/v1/review/product-review/{productId}/{limit}/{page}
 */
router.get("/product-review/:id/:limit/:page", auth.isAuth, ReviewCon.getProdReviewList);

/**
 * Get all seller product review
 * /api/v1/review/product-review/{sellerId}/{limit}/{page}
 */
router.get("/seller-product-review/:id/:limit/:page", auth.isAuth, ReviewCon.getSellerProdReviewList);

/**
 * Update review enabled
 * /api/v1/review/ud-review-enabled/{reviewId}
 */
router.put("/ud-review-enabled/:id", auth.isAuth, ReviewCon.enabledProdReview);


module.exports = router;
