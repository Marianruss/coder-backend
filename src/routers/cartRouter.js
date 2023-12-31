const cartManager = require("../dao/managers/cartManager")
const admin = new cartManager
const axios = require("axios")
const { Router } = require("express")
const { validator } = require("validator")
const { prodRouter } = require("./prodRouter")
const prodModel = require("../dao/models/product.model")

const cartRouter = Router()

///---  add cart  ---///
cartRouter.post("/add", async (req, res) => {
    const cart = req.body


    const created = await admin.addCart(cart)

    switch (created) {

        case "empty":
            return res.status(400).json({
                msg: "empty keys"
            })
        default:
            return res.status(200).json({
                msg: "cart created"
            })
    }


})

//------------------------------//
//------------------------------//


///---  see carts  ---///
cartRouter.get("/:cid", async (req, res) => {
    const code = parseInt(req.params.cid)

    const cart = await admin.getCart(code)
    switch (cart) {
        case "inexistent":
            return res.status(404).json({
                msg: "not found"
            })

        default:
            return res.send(cart);
    }
})

//------------------------------//
//------------------------------//

///---  add item to selected cart  ---///
cartRouter.put("/:cid/products/:pid", async (req, res) => {
    const cartId = parseInt(req.params.cid)
    const prodId = parseInt(req.params.pid)
    let quant = parseInt(req.query.quant)
    let added = ""

    if (!quant) {
        added = await admin.addProdToCart(cartId, prodId, 1)
    }
    else {
        added = await admin.addProdToCart(cartId, prodId, quant)
    }

    switch (added) {
        case "no product":
            return res.status(404).json({
                msg: `There is no product with ID ${prodId}`
            })

        case "added":
            return res.status(200).json({
                msg: `Product with ID ${prodId} added to cart`
            })

        case "no cart":
            return res.status(404).json({
                msg: `There is no cart with ID ${cartId}`
            })
    }
})


//------------------------------//
//------------------------------//

///---  delete all items from selected cart  ---///
cartRouter.delete("/:cid", async (req, res) => {
    const cartId = parseInt(req.params.cid)


    const deleteItems = await admin.deleteItemsFromCart(cartId)

    switch (deleteItems) {
        case "no cart":
            return res.status(404).json({ msg: `There is no cart with id ${cartId}` })
            break;
        case "deleted":
            return res.status(200).json({ msg: `All items deleted from cart ${cartId}` })
    }


})


//------------------------------//
//------------------------------//

///---  delete certain item from selected cart  ---///
cartRouter.delete("/:cid/products/:pid", async (req, res) => {
    const cartId = req.params.cid
    const prodId = req.params.pid

    const deleted = await admin.deleteProductFromCart(cartId, prodId)

    switch (deleted) {
        case "no prod":
            return res.status(404).json({
                msg: `No existe el product con id ${prodId} en el carrito ${cartId}`
            })
            break;

        default:
            break;
    }

    return res.json({ deleted })
})


//------------------------------//
//------------------------------//

///---  add quantity to cart item, quantity is given in req body  ---///

cartRouter.post("/:cid/products/:pid", async (req, res) => {
    const cartId = req.params.cid
    const prodId = req.params.pid
    const quantity = req.body.quantity


    if (typeof (quantity) != "number") {
        return res.status(400).json({ msg: `Quantity only can be integer and you send ${typeof (quantity)}` })
    }

    try {
        const modified = await admin.modifyQuantityOfProduct(cartId,prodId,quantity)
        
        switch (modified) {
            case "no prod":
                return res.status(404).json({msg:`there is no product with id ${prodId}`})
                break;
            case "no cart":
                return res.status(404).json({msg:`there is no cart with id ${cartId}`})
            case "modified":
                return res.status(200).json({msg:`quantity of product with id ${prodId} setted to ${quantity}`})
            default:
                break;
        }
    } 
    catch (error) {

    }
})



//------------------------------//
//------------------------------//


///--- delete cart ---///
cartRouter.delete("/delete/:cid", (req, res) => {
    const cartId = parseInt(req.params.cid)
    const deleted = admin.deleteCart(cartId)

    switch (deleted) {
        case "deleted":
            return res.status(200).json({
                msg: `Se borró el carro con ID ${cartId}`
            })
        case "no cart":
            return res.status(404).json({
                msg: `No existe el carrito con ID ${cartId}`
            })
    }
})

module.exports = cartRouter