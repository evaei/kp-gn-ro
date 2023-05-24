const router = require("express").Router();
const SellerCon = require("../../../controllers/v1/Seller.controller");
const SellerGroupCon = require("../../../controllers/v1/SellerGroup.controller");
const auth = require("../../../utils/auth");
const multer = require('multer');
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');

/********************** S3 IMAGE UPLOAD ************************/
aws.config.update({
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    region: 'ap-southeast-1',
  });
  
  const s3 = new aws.S3();
  
  const upload = multer({
    storage: multerS3({
      s3: s3,
      acl: 'public-read',
      bucket: process.env.AWS_S3_BUCKET_NAME,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: function (req, file, cb) {
        let extArray = file.mimetype.split('/');
        let ext = extArray[extArray.length - 1];
        cb(null, 'kaspy2/' + `seller-${Date.now()}.${ext}`);
      },
    }),
  });
  
  const imageUpload = upload.fields([
      { name: 'image', maxCount: 1 },{ name: 'coverImage', maxCount: 4 },
    ]);
/********************** S3 IMAGE UPLOAD ************************/

/********************** SELLER ************************/
/**
 * Get Seller data
 * /api/v1/seller/detail/:seller_id
 */
router.get("/detail/:id",auth.isAuth, SellerCon.getSellerData);


/**
 * Create Seller
 * /api/v1/seller/cr-seller
 */
router.post("/cr-seller",auth.isAuth,imageUpload, SellerCon.crSellerData);

/**
 * Update Seller
 * /api/v1/seller/ud-seller
 */
router.post("/ud-seller",auth.isAuth,imageUpload, SellerCon.udSellerData);

/**
 * Update Seller enabled
 * /api/v1/seller/ud-seller-isenabled
 */
router.post("/ud-seller-isenabled",auth.isAuth, SellerCon.udSellerIsEnabled);

/**
 * Update Seller banned
 * /api/v1/seller/ud-seller-isbanned
 */
router.post("/ud-seller-isbanned",auth.isAuth, SellerCon.udSellerIsBanned);

/**
 * Update Seller vacation
 * /api/v1/seller/ud-seller-isvacation
 */
router.post("/ud-seller-isvacation",auth.isAuth, SellerCon.udSellerIsVacation);

/**
 * Create Seller Address
 * /api/v1/seller/cr-seller-address
 */
router.post("/cr-seller-address",auth.isAuth, SellerCon.crSellerAddress);

/**
 * Create Seller Address
 * /api/v1/seller/ud-seller-address/{addressId}
 */
router.put("/ud-seller-address/:id",auth.isAuth, SellerCon.udSellerAddress);

/**
 * Get Seller data
 * /api/v1/seller/detail/:customer_id
 */
router.get("/seller-product/:limit/:page/:column/:orderby",auth.isAuth, SellerCon.getSellerProduct);

/********************** SELLER ************************/





/********************** SELLER GROUP ************************/
/**
 * Get Seller Group
 * /api/v1/seller/group-data
 */
router.get("/group-data",auth.isAuth, SellerGroupCon.getSellerGroupData);

/**
 * Create Seller group
 * /api/v1/seller/cr-seller-group
 */
router.post("/cr-seller-group",auth.isAuth, SellerGroupCon.crSellerGroupData);

/**
 * update Seller group display
 * /api/v1/seller/ud-seller-group-display
 */
router.post("/ud-seller-group-display",auth.isAuth, SellerGroupCon.udSellerGroupIsdisplay);

/********************** SELLER GROUP ************************/

module.exports = router;
