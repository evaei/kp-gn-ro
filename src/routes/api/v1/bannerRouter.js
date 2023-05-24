const router = require("express").Router();
const BannerCon = require("../../../controllers/v1/Banner.controller");
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
        cb(null, 'kaspy2/' + `banner-${Date.now()}.${ext}`);
      },
    }),
  });
  
  const imageUpload = upload.fields([
      { name: 'image', maxCount: 1 },
    ]);
/********************** S3 IMAGE UPLOAD ************************/

/********************** SELLER ************************/

/**
 * Get Seller data
 * /api/v1/banner/list
 */
router.get("/list",auth.isAuth, BannerCon.getBannerList);


/**
 * Create Banner
 * /api/v1/banner/cr-banner
 */
router.post("/cr-banner",auth.isAuth,imageUpload, BannerCon.crBanner);

/**
 * Update Banner
 * /api/v1/banner/ud-banner
 */
router.post("/ud-banner",auth.isAuth,imageUpload, BannerCon.udBanner);

/**
 * Update Banner
 * /api/v1/banner/ud-enabled
 */
router.post("/ud-enabled",auth.isAuth, BannerCon.udBannerIsEnabled);

/********************** SELLER ************************/

module.exports = router;
