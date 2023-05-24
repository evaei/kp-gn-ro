const router = require("express").Router();
const AuthCon = require("../../../controllers/v1/Auth.controller");
const CusCon = require("../../../controllers/v1/Customer.controller");
const auth = require("../../../utils/auth");

/**
 * Register user
 * /api/v1/users/register
 */
router.post("/register", AuthCon.userRegister);

/**
 * Login user
 * /api/v1/users/login
 */
router.post("/login", AuthCon.userLogin);

/**
 * logout user
 * /api/v1/users/logout
 */
router.post("/logout", AuthCon.userLogout);

/**
 * Get customer data
 * /api/v1/users/customer-data/:id
 */
router.post("/customer-data/:id", auth.isAuth, CusCon.getCustomerData);

/**
 * Update customer data
 * /api/v1/users/customer-update/:id
 */
router.post("/customer-update/:id", auth.isAuth, CusCon.udCustomerData);

/**
 * Change customer password
 * /api/v1/users/customer-change-pwd/:id
 */
router.post("/customer-change-pwd/:id", auth.isAuth, CusCon.udCustomerPwd);

/**
 * Create customer address
 * /api/v1/users/customer-create-address
 */
router.post("/customer-create-address", auth.isAuth, CusCon.crCusAddress);

/**
 * Getting customer address
 * /api/v1/users/customer-address/:id
 */
router.post("/customer-address", auth.isAuth, CusCon.getCusAddress);

/**
 * Update customer address
 * /api/v1/users/customer-address-update/:id
 */
router.put("/customer-address-update/:id", auth.isAuth, CusCon.udCusAddress);

/**
 * Delete customer address
 * /api/v1/users/customer-address-del/:id
 */
router.delete("/customer-address-del/:id", auth.isAuth, CusCon.delCusAddress);

/**
 * Update customer address default billing or default shipping
 */
router.put(
  "/customer-address-default/:id/:type",
  auth.isAuth,
  CusCon.udDefaultBillShip
);


/**
 * Update Customer
 * /api/v1/users/ud-enabled
 */
router.post("/ud-enabled",auth.isAuth, CusCon.udCustomerIsEnabled);



module.exports = router;
