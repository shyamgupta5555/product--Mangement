const { isValidObjectId } = require("mongoose")
const CartModel = require("../models/cartModel")
const ProductModel = require("../models/productModel")
const UserModel = require('../models/userModel')
const { validObjectId } = require('../validations/validator1')


const createCart = async function (req, res) {
  try {

    const userId = req.params.userId;
    const data = req.body;
    let quantity = data.quantity;
    const { productId, cartId } = data;

    if (Object.keys(data).length == 0) { return res.status(400).send({ status: false, message: "Put the productId you want to add to Cart" }) }
    if (!validObjectId(productId)) { return res.status(400).send({ status: false, message: "product id not valid id" }) }
    
    { quantity = 1 }
    const productDetails = await ProductModel.findOne({ _id: productId, isDeleted: false })
    if (!productDetails) return res.status(404).send({ status: false, message: "No product Found" })
    let newCart = false

    if (!cartId) {
      let theCarts = await CartModel.findOne({ userId: userId });
      if (theCarts) { return res.status(409).send({ status: false, message: `Cart is Already exists, put ${theCarts._id} this cartId in the body` }) };
      let cartCreate = {
        userId: userId,
        items: [],
        totalPrice: 0,
        totalItems: 0
      }
      var cartDetails = await CartModel.create(cartCreate)
      newCart = true
    }
    else {
      
      if (!isValidObjectId(cartId)) { return res.status(400).send({ status: false, message: "cart id not valid id" }) };
      var cartDetails = await CartModel.findOne({ _id: cartId })
      if (!cartDetails) { return res.status(404).send({ status: false, message: `Cart does not found, try with right cartId` }) };
      if (cartDetails.userId != userId) { return res.status(400).send({ status: false, message: `You are not owner of this Cart, please try with ${cartDetails._id} this cartId` }) };
    }
    for (var i = 0; i < cartDetails.items.length; i++) {
      if (cartDetails.items[i].productId == productId) {
        cartDetails.items[i].quantity = cartDetails.items[i].quantity + quantity
        break;
      }
    }
    if (cartDetails.items.length == (i || 0)) {
      cartDetails.items.push({ productId: productId, quantity: quantity })
    }
    cartDetails.totalPrice = cartDetails.totalPrice + (productDetails.price * quantity)
    cartDetails.totalItems = cartDetails.items.length

    let cartData = await CartModel.findOneAndUpdate({ userId: userId }, { ...cartDetails }, { new: true }).select({ __v: 0 })
    if (newCart) {
      return res.status(201).send({ status: true, message: "Success", data: cartData })
    } else {
      return res.status(201).send({ status: true, message: "Success", data: cartData })

    }

  } catch (err) {
    return res.status(500).send({ status: false, message: err.message })
  }
}


const updateCart = async (req, res) => {
  try {
    let userId = req.params.userId

    if (Object.keys(userId).length === 0) {
      return res.status(400).send({ status: false, message: "please enter userId on param!" })
    }
    if (!isValidObjectId(userId)) {
      return res.status(400).send({ status: false, message: "please enter valid userId!" })
    }
    let checkUser = await UserModel.findById({ _id: userId })
    if (!checkUser) {
      return res.status(404).send({ status: false, message: "user is not exist!" })
    }
    let data = req.body

    if (Object.keys(data).length === 0) {
      return res.status(400).send({ status: false, message: "please enter data for updation" })
    }

    //destructuring body
    const { productId, cartId, removeProduct } = data

    if (!productId) {
      return res.status(400).send({ status: false, message: "please enter productId" })
    }
    if (!isValidObjectId(productId)) {
      return res.status(400).send({ status: false, message: "please insert valid productId!" })
    }
    let checkProduct = await ProductModel.findById({ _id: productId, isDeleted: false })
    if (!checkProduct) {
      return res.status(404).send({ status: false, message: "product is not exist" })
    }
    if (!cartId) {
      return res.status(400).send({ status: false, message: "please enter cartId" })
    }
    if (!isValidObjectId(cartId)) {
      return res.status(400).send({ status: false, message: "please insert valid cartId" })
    }
    let checkCart = await CartModel.findOne({ _id: cartId })
    if (!checkCart) {
      return res.status(404).send({ status: false, message: "cart does not exist" })
    }

    if (checkCart.items.length === 0) {
      return res.status(404).send({ status: false, message: "you have not added any product in your cart!" })
    }

    if (!(removeProduct == 0 || removeProduct == 1)) {
      return res.status(400).send({ status: false, message: "please enter valid number it can be only 0 & 1" })
    }

    let cart = checkCart.items

    for (let i = 0; i < cart.length; i++) {
      if (cart[i].productId == productId) {
        let finalPrice = cart[i].quantity * checkProduct.price

        //When removeProduct is 0
        if (removeProduct == 0) {
          let proRemove = await CartModel.findOneAndUpdate({ _id: cartId },
            {
              $pull: { items: { productId: productId } },
              totalPrice: checkCart.totalPrice - finalPrice,
              totalItems: checkCart.totalItems - 1
            },
            { new: true }
          );
          return res.status(200).send({ status: true, message: "Success", data: proRemove })
        }
        if (cart[i].quantity == 1 && removeProduct == 1) {
          let proRemove1 = await CartModel.findOneAndUpdate({ _id: cartId },
            {
              $pull: { items: { productId: productId } },
              totalPrice: checkCart.totalPrice - finalPrice,
              totalItems: checkCart.totalItems - 1
            }, { new: true }
          )
          return res.status(200).send({ status: true, message: "Success", data: proRemove1 })
        }

        cart[i].quantity = cart[i].quantity - 1
        let updatePro = await CartModel.findOneAndUpdate({ _id: cartId },
          {
            items: cart,
            totalPrice: checkCart.totalPrice - checkProduct.price
          }, { new: true }
        )
        return res.status(200).send({ status: true, message: "Success", data: updatePro })
      }
    }
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }

}

const getCart = async function (req, res) {
  try {
    let userId = req.params.userId
    if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "Invalid userId" })

    const getCart = await CartModel.findOne({ userId: userId }).populate({ path: "items.productId" })
    if (!getCart) {
      return res.status(404).send({ status: false, message: "Your cart is not found" })
    }
    return res.status(200).send({ status: true, message: "Success", data: getCart });
  }
  catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
}

const deleteCart = async function (req, res) {
  try {
    let userId = req.params.userId;

    let userCheck = await UserModel.findById({ _id: userId })
    if (!userCheck) {
      return res.status(404).send({ status: false, message: "User not exist" })
    };

    let noCart = await CartModel.findOne({ userId: userId });
    if (!noCart) {
      return res.status(404).send({ status: true, message: "Cart not found for the user  " })
    };

    let a = [];
    if (noCart.totalItems > 0) {
      let deleted = await CartModel.findOneAndUpdate({ userId: userId },
        { items: a, totalPrice: 0, totalItems: 0 }, { new: true }).select({ __v: 0, createdAt: 0, updatedAt: 0 });

      return res.status(200).send({ status: true, message: 'Cart deleted', data: deleted });

    }

    return res.status(204).send({ status: true, message: "Data of this cart has already been deleted !" })

  } catch (err) {
    return res.status(500).send({ status: false, message: err.message })
  }
}

module.exports = { createCart, updateCart, getCart, deleteCart }

