const router = require("express").Router();

router.use("/healthCheck", require("./healthCheck"));
router.use("/users", require("./customerRouter"), require("./cartRouter"));
router.use("/product", require("./productRouter"));
router.use("/seller", require("./sellerRouter"));
router.use("/product", require("./productRouter"));
router.use("/category", require("./categoryRouter"));
router.use("/banner", require("./bannerRouter"));
router.use("/wishlist", require("./wishlistRouter"));
router.use("/review", require("./reviewRouter"));
router.use("/admin", require("./adminRouter"));

module.exports = router;
