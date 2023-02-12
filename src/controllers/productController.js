const ProductModel = require('../models/productModel')
const { uploadFile } = require('../aws/aws-connection')
const { validCity, validObjectId, validNumber, validFile } = require('../validations/validator1')



let numValid = (value) => /^[0-9]{1,9}(?:\.[0-9]{2})?$/.test(value.trim())
let isNum = (value) => /^[0-9]{1,2}$/.test(value)
const validRegex = (value) => /^[a-zA-Z., ]{3,100}$/.test(value.trim())

const createProduct = async function (req, res) {
  try {

    let productImage = req.files

    let data = req.body;

    const { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments, ...rest } = data;

    if (Object.keys(rest).length > 0) {
      return res.status(400).send({ status: false, message: "another key not acceptable" })
    }

    if (!title || title.trim() == "") return res.status(400).send({ status: false, message: "please enter title" })
    if (!validRegex(title)) return res.status(400).send({ status: false, message: "please enter valid title " })

    if (!description || description.trim() == "") return res.status(400).send({ status: false, message: "please enter description" })
    if (!validRegex(description)) return res.status(400).send({ status: false, message: "please enter valid description" })

    if (!price || price.trim() == "") return res.status(400).send({ status: false, message: "please enter price" })
    if (!numValid(price)) return res.status(400).send({ status: false, message: "please enter valid price" })
    if (!currencyId) return res.status(400).send({ status: false, message: "please enter currencyId" })
    if (!productImage) return res.status(400).send({ status: false, message: "please enter productImage" })
    if (!availableSizes) return res.status(400).send({ status: false, message: "please enter size" })

    if (installments) {
      if (!isNum(installments)) return res.status(400).send({ status: false, message: " installment only use number and two num use " })
    }

    let x = []
    let d = availableSizes.split(",")

    let sizeCheck = ["S", "XS", "M", "X", "L", "XXL", "XL"]
    for (let i = 0; i < d.length; i++) {
      if (!sizeCheck.includes(d[i])) return res.status(400).send({ status: false, message: "at least one size like = S, XS,M,X, L,XXL,XL" })
      if (!x.includes(d[i])) {
        x.push(d[i])
      }
    }

    data.availableSizes = x

    if (!(currencyId !== "INR" || currencyId !== "USD"))
      return res.status(400).send({ status: false, message: "please enter valid currencyId like INR or USD " })

    if (currencyId === "INR") {
      data.currencyFormat = "₹"
    }
    if (currencyId === "USD") {
      data.currencyFormat = "$"
    }


    let findTitle = await ProductModel.findOne({ title: title })
    if (findTitle) return res.status(400).send({ status: false, message: "title already exist our data base" })

    if (productImage && productImage.length === 0) {
      return res.status(400).send({ status: false, message: "please insert product image!" })
    }
    if (productImage.length > 0) {

      if (productImage.length > 1)
        return res.status(400).send({ status: false, message: 'please select only one product image' })
      if (!validFile(productImage[0].originalname))
        return res.status(400).send({ status: false, message: 'please select valid  image like jpeg , png ,jpg' })
      let uploadedFileURL = await uploadFile(productImage[0]);
      data.productImage = uploadedFileURL;
    }

    data.title = title.toLowerCase()
    let create = await ProductModel.create(data);
    res.status(201).send({ status: true, message: "Success", data: create });

  }
  catch (error) {
    return res.status(500).send({ status: false, message: error.message })
  }
}


// get api for filter=========================

const getProductByFilter = async function (req, res) {
  try {
    let data = req.query;
    let { size, name, priceGreaterThan, priceLessThan, priceSort } = data;
    let x = { isDeleted: false };
    let s = {};
    if (size || size != undefined) {
      size = size.toUpperCase().trim()

      if (size.trim() != "" && ["S", "XS", "M", "X", "L", "XXL", "XL"].includes(size.trim())) {

        x.availableSizes = size;

      } else {
        return res.status(400).send({ status: false, message: "Size does not exists or Invalid size" })
      }
    };


    if (name || name != undefined) {

      if (name.trim() != "" || validRegex(name)) {
        name = name.toLowerCase().trim();
        x.title = { $regex: name };

      } else {
        return res.status(400).send({ status: false, message: "Name is invalid " })
      }

    };



    if ((priceGreaterThan && priceLessThan) || (priceGreaterThan != undefined && priceLessThan != undefined)) {

      priceGreaterThan = priceGreaterThan.trim();
      priceLessThan = priceLessThan.trim();

      if (priceGreaterThan != "" && priceLessThan != "" && numValid(priceGreaterThan) && numValid(priceLessThan)) {

        x.price = { $gt: priceGreaterThan, $lt: priceLessThan }
      } else {

        return res.status(400).send({ status: false, message: "Price must contain both the  range to filter data ." })
      }
    } else if (priceGreaterThan || priceGreaterThan != undefined) {

      priceGreaterThan = priceGreaterThan.trim();

      if (priceGreaterThan != "" && numValid(priceGreaterThan)) {

        x.price = { $gt: priceGreaterThan }
      } else {

        return res.status(400).send({ status: false, message: "Please provide range in price-greater than to filter data!" })
      }
    } else if (priceLessThan || priceLessThan != undefined) {

      priceLessThan = priceLessThan.trim();

      if (priceLessThan == "" && !numValid(priceLessThan)) { return res.status(400).send({ status: false, message: "Please provide range in price-less than to filter data!" }) }

      x.price = { $lt: priceLessThan };
    };


    if (priceSort || (priceSort != undefined)) {//{price:-1/1}

      priceSort = priceSort.trim();

      if (priceSort == "" || (priceSort != -1 && priceSort != 1)) {

        return res.status(400).send({ status: false, message: "Please provide -1 OR 1 for Price sort !" })
      }
      s.price = priceSort;


    }

    let Data = await ProductModel.find(x).sort(s).select({ __v: 0 });

    if (Data.length == 0) {
      return res.status(400).send({ status: false, message: "Out of stock !!" })
    };

    return res.send({ status: true, message: "Success", data: Data });

  } catch (err) {
    return res.status(500).send({ status: false, message: err.message })
  }
}

// ================================







const getProduct = async (req, res) => {
  try {
    let productId = req.params.productId

    let getData = await ProductModel.findOne({ _id: productId, isDeleted: false })
    if (!getData) {
      return res.status(404).send({ status: false, message: "product not found" })
    }
    return res.status(200).send({ status: true, message: "Success", data: getData })
  }
  catch (error) {
    return res.status(500).send({ status: false, message: error.message })
  }
}



let updateProduct = async (req, res) => {
  try {
    const productId = req.params.productId
    const dataForUpdates = req.body
    const productImage = req.files

    const updateData = {}
    if (!validObjectId(productId)) return res.status(400).send({ status: false, message: "Please enter valid productId" })

    //  CHECK : if there is no data for updatation

    if (!dataForUpdates || !productImage) return res.status(400).send({ status: false, message: 'please provide some data for updating' })

    let { title, description, isFreeShipping, style, installments, price, availableSizes, ...rest } = dataForUpdates

    if (Object.keys(rest).length > 0) {
      return res.status(400).send({ status: false, message: "another key not acceptable" })
    }


    if (title || title !== undefined) {
      title = title.toLowerCase().trim()
      if (!validRegex(title)) return res.status(400).send({ status: false, message: 'please provide valid title ' })
      const isTitleAlreadyUsed = await ProductModel.findOne({ title })
      if (isTitleAlreadyUsed) return res.status(400).send({ status: false, message: "This  is title already in use,please provide another title" })
      updateData.title = title
    }

    if (description || description !== undefined) {
      if (description.trim() == "" || !validRegex(description)) return res.status(400).send({ status: false, message: 'please provide valid description' })
      updateData.description = description
    }

    if (isFreeShipping || isFreeShipping !== undefined) {

      if (!(isFreeShipping == "true" || isFreeShipping == "false")) return res.status(400).send(
        { status: false, message: 'please provide valid isFreeShipping(true / false)' })
      updateData.isFreeShipping = isFreeShipping
    }


    if (style || style !== undefined) {
      if (!validRegex(style)) return res.status(400).send({ status: false, message: 'please provide style' })
      updateData.style = style
    }

    if (installments || installments !== undefined) {
      let installments = (+installments)
      if (!installments) return res.status(400).send({ status: false, message: 'please provide installments in digits' })
      updateData.installments = installments
    }


    if (price || price !== undefined) {
      let price = +dataForUpdates.price
      if (!price) return res.status(400).send({ status: false, message: 'please provide price in digits' })
      updateData.price = price
    }

    if (productImage.length > 0) {
      console.log(productImage[0].originalname)
      if (productImage.length > 1) return res.status(400).send({ status: false, message: 'please select only one product image' })
      if (!validFile(productImage[0].originalname)) return res.status(400).send({ status: false, message: 'please select valid  image like jpeg , png ,jpg' })
      var updateFileURL = await uploadFile(productImage[0])
      updateData.productImage = updateFileURL
    }
    if (availableSizes) {
      let x = []
      let d = availableSizes.split(",")

      let sizeCheck = ["S", "XS", "M", "X", "L", "XXL", "XL"]
      for (let i = 0; i < d.length; i++) {
        d[i] = d[i].trim()
        if (!sizeCheck.includes(d[i])) return res.status(400).send({ status: false, message: "at least one size like = S, XS,M,X, L,XXL,XL" })
        if (!x.includes(d[i])) {
          x.push(d[i])
        }
      }

      updateData.availableSizes = x
    }
    
    const updatedProduct = await ProductModel.findOneAndUpdate({ _id: productId, isDeleted: false }, { $set: { ...updateData } }, { new: true })
    if (!updatedProduct) return res.status(404).send({ status: false, message: "Product not found to update" })
    return res.status(200).send({ status: true, message: "Success", data: updatedProduct })

  }
  catch (err) {
    return res.status(500).send({ status: false, message: err.message })
  }
}




//delete product
const deleteProduct = async (req, res) => {
  try {
    let productId = req.params.productId
    if (Object.keys(productId).length === 0) {
      return res.status(400).send({ status: false, message: "please enter product Id on param!" })
    }
    if (!validObjectId(productId)) {
      return res.status(400).send({ status: false, message: "please enter valid product Id!" })
    }
    let delData = await ProductModel.findByIdAndUpdate({ _id: productId, isDeleted: false },
      { $set: { isDeleted: true, deletedAt: Date.now() } }, { new: true })

    if (!delData) {
      return res.status(404).send({ status: false, message: "product not found to be deleted" })
    }
    if (delData.isDeleted === "true") {
      return res.status(400).send({ status: false, message: "product is already deleted!" })
    }
    return res.status(200).send({ status: true, message: "Success", data: delData })
  }
  catch (error) {
    return res.status(500).send({ status: false, message: error.message })
  }
}

module.exports = { createProduct, getProduct, updateProduct, deleteProduct, getProductByFilter }



