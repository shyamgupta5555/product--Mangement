const ProductModel = require("../models/productModel")
const CartModel = require("../models/cartModel")
const OrderModel = require("../models/orderModel")
const { validObjectId } = require('../validations/validator1')


//=====================================// CREATE ORDER //==================================//

const createOrder = async function (req, res) {
      try {
            let data = req.body
            let id = req.params.userId
            let { cartId, cancellable, ...rest } = data

            if (Object.keys(rest).length > 0) return res.status(400).send({ status: false, message: "only provide cardId not any key" })
            if (!validObjectId(cartId)) return res.status(400).send({ status: false, message: "not valid card id " })

            let cardDetails = await CartModel.findById({ _id: cartId })
            if(!cardDetails){
                  return res.status(400).send({ status: false, message: "please enter cartId" })
            }
            if ((cardDetails.items).length == 0) return res.status(400).send({ status: false, message: "to add items in product" })
            let items = cardDetails.items

            let sum = 0
            for (let i = 0; i < items.length; i++) {
                  sum = sum + items[i].quantity
            }
            if (cancellable) {
                  if (cancellable || cancellable != "") {
                        if (typeOf(cancellable) != "boolean") {
                              return res.status(400).send({ status: false, message: "please enter boolean value" })
                        }
                  }
            }

            let obj = {
                  userId: cardDetails.userId, items: cardDetails.items,
                  totalItems: cardDetails.totalItems,
                  totalPrice: cardDetails.totalPrice, totalQuantity: sum,
                  cancellable: data.cancellable
            }
            let f = []
            let createData = await OrderModel.create(obj)
            let d = await CartModel.findByIdAndUpdate({ _id: cardDetails._id }, { $set: { items: f } }, { new: true })
            res.status(200).send({ status: true, data: createData })
      }
      catch (err) {
            return res.status(500).send({ status: false, message: err.message })

      }
}

//=====================================// UPDATE ORDER //==================================//

const updateOrder = async function (req, res) {
      try {
            const userId = req.params.userId;
            const data = req.body;

            if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: 'Please provide Data in request body' })

            const { orderId, status } = data
            if (status != "pending" && status != "completed" && status != "cancelled") {
                  return res.status(400).send({ status: false, message: "order status can only be pending,completed and canceled" })
            }
            const findOrder = await OrderModel.findById({ _id: orderId })
            if (!findOrder) return res.status(404).send({ status: false, message: "oder Not found" })

            if (findOrder.status == "completed")
                  return res.status(400).send({ status: false, message: "Can Not Update This Order, Because It's Completed Already" })

            if (findOrder.status == "cancelled")
                  return res.status(400).send({ status: false, message: "Can Not Update This Order, Because It's Cancelled Already" })


            if (findOrder.status == "pending") {
                  if (findOrder.cancellable == false)
                        if (!findOrder.cancellable) return res.status(400).send({ status: false, message: "This order is not cancellable" })

                  const updateOrder = await OrderModel.findOneAndUpdate({ _id: orderId }, { $set: { status: status } }, { new: true })

                  return res.status(200).send({ status: true, message: "Success", data: updateOrder })
            }

      } catch (err) {
            return res.status(500).send({ status: false, message: err.message })
      }

}


module.exports = { createOrder, updateOrder }