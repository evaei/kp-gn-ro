const router = require("express").Router();
const CategoryCon = require("../../../controllers/v1/Category.controller");
const auth = require("../../../utils/auth");

/********************** CATEGORY ************************/
/**
 * Get Catrgory List data
 * /api/v1/seller/detail/:customer_id
 */
router.get("/list",auth.isAuth, CategoryCon.getCategoryList);

/**
 * Create category
 * /api/v1/category/ud-seller-display
 */
router.post("/cr-category",auth.isAuth, CategoryCon.crCategory);

/**
 * Update category
 * /api/v1/category/ud-category/{categoryId}
 */
router.put("/ud-category/:categoryId",auth.isAuth, CategoryCon.udCategory);


/**
 * Update category
 * /api/v1/category/ud-seller-display
 */
router.post("/ud-display",auth.isAuth, CategoryCon.udCategoryIsdisplay);

/**
 * Update category
 * /api/v1/category/ud-seller-disable
 */
router.post("/ud-enabled",auth.isAuth, CategoryCon.udCategoryIsenabled);


/********************** CATEGORY ************************/


module.exports = router;
