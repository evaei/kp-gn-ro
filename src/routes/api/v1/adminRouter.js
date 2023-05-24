const router = require("express").Router();
const InterCon = require("../../../controllers/v1/InternalUser.controller");
const auth = require("../../../utils/auth");

/**
 * Admin Login
 * /api/v1/admin/login
 */
router.post("/login", InterCon.adminLogin);

/**
 * Add New Admin
 * /api/v1/admin/add-new
 */
router.post("/add-new", auth.isAuth, InterCon.addNewAdmin);

/**
 * Get List Employee
 *  
 */
router.get("/get-list-employee", auth.isAuth, InterCon.getListEmployee);

/**
 * Get Employee by id
 * /api/v1/admin/get-employee/:id
 */
router.get("/get-employee/:id", auth.isAuth, InterCon.getEmployeeById);

/**
 * Update detail admin
 * /api/v1/admin/update-detail
 */
router.put("/update-detail", auth.isAuth, InterCon.updateDetailAdmin);

/**
 * Update set disable admin
 * /api/v1/admin/update-disable/:id
 */
router.put("/update-disable/:id", auth.isAuth, InterCon.updateDisable);

/**
 * Change password of employee
 * /api/v1/admin/change-password/:id
 */
router.put("/change-password/:id", auth.isAuth, InterCon.changePassword);

/**
 * Admin Logout
 * /api/v1/admin/logout
 */
router.post("/logout", auth.isAuth, InterCon.adminLogout);

module.exports = router;
