const mongoose =  require('mongoose');

const productSchema = new mongoose.Schema({
    pname:{
        type: String
    },
    pprice:{
        type: String
    },
    pdec:{
        type: String
    },
    pcnt:{
        type: String
    },
    pid:{
        type: String
    }
})

const Product = mongoose.model("products", productSchema);

module.exports = Product;