const Joi = require("joi");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const BaseController = require("../Base.controller");
const auth = require("../../utils/auth");
const RequestHandler = require("../../utils/RequestHandler");
const Logger = require("../../utils/logger");
const { v4: uuidv4 } = require("uuid");
const Sequelize = require("sequelize");

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

class CartController extends BaseController {
  /**
   * Add product into cart
   */
  static async addProduct(req, res) {
    try {
      const tokenFromHeader = auth.getJwtToken(req);
      const tokenUser = jwt.decode(tokenFromHeader);
      const userId = tokenUser.payload.id;
      const { productId, quantity } = req.body;

      /**
       * Check user if user was exist and isEnabled = false
       */
      const chkUserOptions = {
        attributes: ["id"],
        where: { id: userId, isEnabled: true },
      };
      const isUserExist = await super.getByCustomOptions(
        req,
        "users",
        chkUserOptions
      );
      if (!isUserExist) {
        requestHandler.throwError(404, "bad request", "user doesn't exist")();
      }

      /**
       * Check if product was exist in the database and isPublish (seller) / isEnabled (admin) / isDeleted (seller)
       **/
      const chkProdOptions = {
        attributes: ["id", "sellerId", "name", "weight", "price"],
        where: {
          id: productId,
        },
      };
      const isProdExist = await super.getByCustomOptions(
        req,
        "products",
        chkProdOptions
      );
      if (!isProdExist) {
        requestHandler.throwError(
          404,
          "bad request",
          "product doesn't exist"
        )();
      }
      const { id, sellerId, name, weight, price } = isProdExist.dataValues;

      /**
       * Check cart if it was exist and isDeleted is false
       */
      const chkCartOptions = { where: { userId, isDeleted: false } };
      const isCartExist = await super.getByCustomOptions(
        req,
        "users_carts",
        chkCartOptions
      );
      if (!isCartExist) {
        const crCart = {
          id: uuidv4(),
          userId,
          itemCount: 0,
          itemQuantityCount: 0,
          isDeleted: false,
        };
        await super.create(req, "users_carts", crCart);
      }

      /**
       * Get product thumbnail image
       */
      const getProdImgOptions = { where: { productId: id, isThumbnail: true } };
      const prodImgData = await super.getByCustomOptions(
        req,
        "product_images",
        getProdImgOptions
      );

      /**
       * Get cart id where user_id = userId and isDeleted = false
       */
      const getCartOptions = {
        attributes: ["id", "itemCount", "itemQuantityCount"],
        where: { userId, isDeleted: false },
      };
      const cartData = await super.getByCustomOptions(
        req,
        "users_carts",
        getCartOptions
      );

      if (isUserExist && isProdExist && cartData) {
        /**
         * Check for existing product in cart.
         */
        const chkOptions = {
          attributes: ["cartId", "userId", "sellerId", "productId", "quantity"],
          where: {
            userId,
            sellerId,
            productId,
            isCheckedOut: false,
            isDeleted: false,
          },
        };
        const chkSameProd = await super.getByCustomOptions(
          req,
          "users_cart_items",
          chkOptions
        );

        /**
         * Update users_carts options
         */
        const { itemCount, itemQuantityCount } = cartData;
        const udCartOptions = {
          where: {
            userId,
            isDeleted: false,
          },
        };

        if (!chkSameProd) {
          /**
           * Add new product to cart
           */
          const addData = {
            id: uuidv4(),
            cartId: cartData.dataValues.id,
            userId,
            sellerId,
            productId: id,
            productName: name,
            productWeight: weight,
            productImage: prodImgData.dataValues.url,
            productPrice: price,
            quantity,
            totalPrice: price * quantity,
            isCheckedOut: false,
            isDeleted: false,
          };
          await super.create(req, "users_cart_items", addData);

          /**
           * Update data in users_carts
           */
          const udCartData = {
            itemCount: itemCount + 1,
            itemQuantityCount: itemQuantityCount + quantity,
          };
          await super.updateByCustomWhere(
            req,
            "users_carts",
            udCartData,
            udCartOptions
          );
        } else {
          /**
           * Updating exist product in cart
           */
          const udOptions = {
            where: {
              userId,
              sellerId,
              productId,
              isCheckedOut: false,
              isDeleted: false,
            },
          };
          const newQuan = chkSameProd.dataValues.quantity + quantity;
          const udData = {
            quantity: newQuan,
            totalPrice: price * newQuan,
            updatedAt: new Date(),
          };
          await super.updateByCustomWhere(
            req,
            "users_cart_items",
            udData,
            udOptions
          );

          /**
           * Update data in users_carts
           */
          const udCartData = {
            itemCount: itemCount,
            itemQuantityCount: itemQuantityCount + quantity,
          };
          await super.updateByCustomWhere(
            req,
            "users_carts",
            udCartData,
            udCartOptions
          );
        }

        /**
         * Send success
         */
        requestHandler.sendSuccess(res, "Product added to cart!", 200)();
      } else {
        /**
         * Send error if isUserExist && isProdExist && cartData not exist
         */
        requestHandler.throwError(404, "bad request", "Can't add to cart!")();
      }
    } catch (err) {
      requestHandler.sendError(req, res, err);
    }
  }

  /**
   * Get cart information and product in cart
   */
  static async getCart(req, res) {
    try {
      const tokenFromHeader = auth.getJwtToken(req);
      const tokenUser = jwt.decode(tokenFromHeader);
      const userId = tokenUser.payload.id;

      /**
       * Check cart if it was exist and isDeleted is false
       */
      const chkCartOptions = {
        attibutes: ["id", "userId", "itemCount", "itemQuantityCount"],
        where: { userId, isDeleted: false },
      };
      const isCartExist = await super.getByCustomOptions(
        req,
        "users_carts",
        chkCartOptions
      );
      if (!isCartExist) {
        requestHandler.sendSuccess(
          res,
          "Cart is empty, no product found!",
          200
        )([]);
      }

      if (isCartExist) {
        const cartOptions = {
          attributes: ["id", "itemCount", "itemQuantityCount"],
          where: {
            id: isCartExist.dataValues.id,
            userId,
          },
          include: [
            {
              model: req.app.get("db")["users_cart_items"],
              as: "cartItems",
              attributes: {
                exclude: [
                  "isCheckedOut",
                  "isDeleted",
                  "createdAt",
                  "updatedAt",
                ],
              },
              include: [
                {
                  model: req.app.get("db")["sellers"],
                  attributes: ["id", "storeName"],
                },
              ],
            },
          ],
        };
        const cardValue = await super.getByCustomOptions(
          req,
          "users_carts",
          cartOptions
        );

        // Group items by store
        const groupedItem = new Map();
        for (const item of cardValue.cartItems) {
          const storeName = item.seller.storeName;
          if (groupedItem.has(storeName)) {
            groupedItem.get(storeName).push(item);
          } else {
            groupedItem.set(storeName, [item]);
          }
        }

        // Create output object
        const cartData = {
          cartId: cardValue.id,
          itemCount: cardValue.itemCount,
          itemQuantityCount: cardValue.itemQuantityCount,
          cartItems: Array.from(groupedItem, ([storeName, items]) => ({
            sellerId: items[0].sellerId,
            storeName,
            items: items.map(
              ({
                productId,
                productName,
                productWeight,
                productImage,
                productPrice,
                quantity,
                totalPrice,
              }) => ({
                productId,
                productName,
                productWeight,
                productImage,
                productPrice,
                quantity,
                totalPrice,
              })
            ),
          })),
        };

        requestHandler.sendSuccess(
          res,
          "Cart data retrieved successfully!"
        )(cartData);
      }
    } catch (err) {
      requestHandler.sendError(req, res, err);
    }
  }

  /**
   * Update quantity product in cart
   */
  static async updateCart(req, res) {
    try {
      const tokenFromHeader = auth.getJwtToken(req);
      const tokenUser = jwt.decode(tokenFromHeader);
      const userId = tokenUser.payload.id;
      const { cartId, productId, newQuantity } = req.body;

      /**
       * Check parameter if productId, quantity was null
       */
      if (!cartId || !productId || !newQuantity) {
        requestHandler.throwError(
          404,
          "bad request",
          "Please review the parameters before sending the request."
        )();
      }

      /**
       * Check if cartId was exist and isDeleted = false in database
       */
      const chkCartOptions = { where: { id: cartId, isDeleted: false } };
      const isCartExist = await super.getByCustomOptions(
        req,
        "users_carts",
        chkCartOptions
      );
      if (!isCartExist) {
        requestHandler.throwError(
          404,
          "bad request",
          "Cart not found. Please double-check your cart ID and try again."
        )();
      }

      /**
       * Get current data of this product in cart
       * op = option
       */
      const opGetCartData = {
        attributes: ["productPrice", "quantity"],
        where: {
          cartId,
          userId,
          productId,
          isCheckedOut: false,
          isDeleted: false,
        },
      };
      const cartData = await super.getByCustomOptions(
        req,
        "users_cart_items",
        opGetCartData
      );

      if (!cartData) {
        requestHandler.throwError(
          404,
          "bad request",
          "Item in cart not found. Please double-check your product id and try again."
        )();
      }

      const { productPrice, quantity } = cartData.dataValues;

      /**
       * Update quantity of users_cart_items
       * op = option
       */
      const opUpdate = {
        where: {
          cartId,
          userId,
          productId,
          isCheckedOut: false,
          isDeleted: false,
        },
      };
      const newQuan = quantity + newQuantity;
      const newPrice = productPrice * newQuan;
      const udCartItem = {
        quantity: newQuan,
        totalPrice: newPrice,
        updatedAt: new Date(),
      };
      await super.updateByCustomWhere(
        req,
        "users_cart_items",
        udCartItem,
        opUpdate
      );

      requestHandler.sendSuccess(
        res,
        "Updated quantity of product successfully!",
        200
      )();
    } catch (err) {
      requestHandler.sendError(req, res, err);
    }
  }

  /**
   * Delete product in cart
   */
  static async delProdCart(req, res) {
    try {
      const tokenFromHeader = auth.getJwtToken(req);
      const tokenUser = jwt.decode(tokenFromHeader);
      const userId = tokenUser.payload.id;
      const { cartId, productId } = req.body;

      const delOptions = {
        where: {
          userId,
          productId,
          cartId,
          isDeleted: false,
        },
      };
      const delData = {
        isDeleted: true,
        updatedAt: new Date(),
      };
      const checkDel = await super.updateByCustomWhere(
        req,
        "users_cart_items",
        delData,
        delOptions
      );

      if (checkDel[0] === 1) {
        requestHandler.sendSuccess(
          res,
          "successfully deleted product in cart",
          200
        )();
      } else {
        requestHandler.throwError(
          404,
          "bad request",
          "product doesn't exist in cart"
        )();
      }
    } catch (err) {
      requestHandler.sendError(req, res, err);
    }
  }

  /**
   * Delete all product in cart
   */
  static async delAllProdCart(req, res) {
    try {
      const tokenFromHeader = auth.getJwtToken(req);
      const tokenUser = jwt.decode(tokenFromHeader);
      const userId = tokenUser.payload.id;
      const { cartId } = req.body;

      /**
       * Check parameter if cartId was null
       */
      if (!cartId) {
        requestHandler.throwError(
          404,
          "bad request",
          "Please review the parameters before sending the request."
        )();
      }

      /**
       * Check if cartId was exist and isDeleted = false in database
       */
      const chkCartOptions = { where: { id: cartId, isDeleted: false } };
      const isCartExist = await super.getByCustomOptions(
        req,
        "users_carts",
        chkCartOptions
      );
      if (!isCartExist) {
        requestHandler.throwError(
          404,
          "bad request",
          "Cart not found. Please double-check your cart ID and try again."
        )();
      }

      const curDate = new Date();
      /**
       * users_carts
       * op = options
       * us = user
       */
      const opCart = {
        where: {
          id: cartId,
          userId,
          isDeleted: false,
        },
      };

      /**
       * users_cart_items
       * op = options
       * us = user
       */
      const opCartItem = {
        where: { cartId, userId, isDeleted: false },
      };

      /**
       * Using for both table users_carts and users_cart_items
       */
      const usCartItemData = {
        isDeleted: true,
        updatedAt: curDate,
      };

      await super.updateByCustomWhere(
        req,
        "users_carts",
        usCartItemData,
        opCart
      );
      await super.updateByCustomWhere(
        req,
        "users_cart_items",
        usCartItemData,
        opCartItem
      );

      requestHandler.sendSuccess(res, "Deleted all product in cart!", 200)();
    } catch (err) {
      requestHandler.sendError(req, res, err);
    }
  }
}

module.exports = CartController;
