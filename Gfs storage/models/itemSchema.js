const mongoose = require('mongoose');
const { Schema } = mongoose;

const ItemSchema = new Schema({
    ItemCode: Number,
    ItemName: String,
    Category: Number,
    CatName:  String,
    // ItemPhotos: String,
    saleRate : Number,
    saleDiscAmt: Number,
    saleDiscPer : Number,
    WholesalePcs: Number,
    WholesaleRate: Number,
    PurchasePrice: Number,
    GstPer: Number,
    Pcs: Number,
    MinStockPcs: Number,
    MinStockDate: Date,
    StockLocation : String,
    subdata: [{
        InvoiceDate: Date,
        InvoiceNo: String,
        ItemId: Number,
        PartyName: String,
        Pcs: Number,
        saleRate : Number,
    }]
});



module.exports =  {ItemSchema};