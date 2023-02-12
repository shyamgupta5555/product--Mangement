const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

const cardCreate = mongoose.Schema({
  
    userId: {type :ObjectId, ref: "users",required: true,trim:true},
    items: [{
      productId: {type :ObjectId, ref: "products",required: true,trim:true},
      quantity: {type :Number,required: true,trim:true},
      _id:false
    }],
    totalPrice: {type :Number,required: true},
    totalItems: {type :Number,required: true},
    
    
},{ timestamps: true })

module.exports =mongoose.model("carts" ,cardCreate)