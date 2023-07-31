// const getQuantity = require('../../functions/functions');
const checkIfEmpty = require('../../functions/functions');
const cartModel = require("../models/cart.model")
const prodModel = require("../models/product.model")

class cartManager {
    fs = require('fs')


    //Constructor
    constructor() {
        this.carts = []
        this.path = "./files/carts.json"

        const fileData = this.fs.readFileSync(this.path, "utf-8");
        if (fileData.trim().length === 0) {
            this.fileCarts = [];
        } else {
            this.fileCarts = JSON.parse(fileData, null, 2);
            this.fileCarts.sort((a, b) => a.id - b.id)
        }
    }

    //------------------------------//
    //------------------------------//


    hasEmptyKey(obj) {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (obj[key].length === 0) {
                    return true
                }
                return false

            }
        }
    }


    //add new cart
    async addCart(cart) {
        const totalCarts = await cartModel.countDocuments().exec()

        const newCart = {
            code: totalCarts + 1,
            clientName: cart.clientName,
            products: cart.products
        }

        if (newCart.clientName.length === 0) {
            return ("empty")
        }

        cartModel.create(newCart)
        return ("success")
    }

    //------------------------------//
    //------------------------------//

    //show cart by id
    async getCart(code) {

        const cart = await cartModel.find({ code: code })
        console.log(cart)

        if (cart.length === 0) {
            return "inexistent"
        }
        return cart
    }

    //------------------------------//
    //------------------------------//


    async addProdToCart(cid, pid, quant) {
        //find the cart 
        const cart = await cartModel.findOne({ code: cid })
        const prod = await prodModel.find({ code: pid })

        console.log(prod)

        if (prod.length === 0) {
            return "no product"
        }

        const existingProduct = cart.products.findIndex(p => p.prodId === pid);

        if (existingProduct != -1) {
            cart.products[existingProduct].quantity += quant;

        }
        else{
            cart.products.push({ prodId: pid, quantity: quant });
        }

        console.log(cart)
        
        await cart.markModified("products")

        await cart.save()

        // return "added"

    }
}



module.exports = cartManager


