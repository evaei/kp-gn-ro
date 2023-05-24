const router = require("express").Router();
const ProductCon = require("../../../controllers/v1/Product.controller");
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
        cb(null, 'kaspy2/' + `product-${Date.now()}.${ext}`);
      },
    }),
  });
  
  const imageUpload = upload.fields([
      { name: 'image', maxCount: 4 },
    ]);
/********************** S3 IMAGE UPLOAD ************************/

/********************** CATEGORY ************************/
/**
 * Get Product in category
 * /api/v1/product/category/:category_id
 */
router.get("/category/:category_id", ProductCon.getProductInCategory);
/********************** CATEGORY ************************/

/********************** PRODUCT ************************/
/**
 * Get Product detail
 * /api/v1/product/detail/:product_id
 */
router.get("/back-detail/:product_id", ProductCon.getBackProductDetailDataFromId);

/**
 * Get Product detail
 * /api/v1/product/detail/:sku
 */
router.get("/front-detail/:product_id", ProductCon.getFrontProductDetailDataFromProdId);

/**
 * Create Product
 * /api/v1/product/cr-product
 */
router.post("/cr-product",auth.isAuth,imageUpload, ProductCon.crProduct);


/**
 * Update Product
 * /api/v1/product/ud-product
 */
router.put("/ud-product/:id",auth.isAuth,imageUpload, ProductCon.udProduct);
/********************** PRODUCT ************************/

/**
 * Update Product enabled
 * /api/v1/product/ud-product-enabled/{productId}
 */
router.put("/ud-product-enabled/:id",ProductCon.changeEnabledProduct);

/**
 * Update Product deleted
 * /api/v1/product/ud-product-delete/{productId}
 */
router.delete("/ud-product-delete/:id",ProductCon.deleteProduct);

/********************** PRODUCT ************************/



module.exports = router;

