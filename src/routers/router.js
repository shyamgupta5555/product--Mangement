const router = require('express')()
const { login, register, updateUser, getUser } = require('../controllers/userController')
const { createProduct, getProduct, deleteProduct, updateProduct, getProductByFilter } = require('../controllers/productController')
const { authentication, authorization } = require('../middlewares/commnMiddle')
const { createCart, updateCart, getCart, deleteCart } = require('../controllers/cartController')
const {createOrder,updateOrder} = require('../controllers/orderController')



//Users
router.post('/register', register)
router.post("/login", login)
router.get('/user/:userId/profile', authentication, getUser)
router.put('/user/:userId/profile', authentication, authorization, updateUser)

//products    
router.post("/products", createProduct)
router.get("/products/:productId", getProduct)
router.get("/products", getProductByFilter)
router.put("/products/:productId", updateProduct)
router.delete("/products/:productId", deleteProduct)

// Carts
router.post("/users/:userId/cart",authentication,authorization,createCart)
router.put("/users/:userId/cart",authentication, authorization, updateCart)
router.get("/users/:userId/cart",authentication, authorization, getCart)
router.delete("/users/:userId/cart",authentication, authorization, deleteCart)

//Orders
router.post("/users/:userId/orders",authentication, authorization,createOrder )
router.put("/users/:userId/orders",authentication, authorization,updateOrder )


router.all('/*', function (req, res) {
      res.status(400).send({ status: false, message: "please send correct url" })
})


module.exports = router