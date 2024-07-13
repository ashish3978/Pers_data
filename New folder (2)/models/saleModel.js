const mongoose = require('mongoose');
const { Schema } = mongoose;


const SaleSchema = new Schema({
    Item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item', // Reference to the Item model
    },
    SaleId: { type: Number, unique: true },
    InvoiceNo: Number,
    PartyId: Number,/////
    PartyName: String,////
    InvoiceDate: Date,
    PaymentTerms: String,
    DueDate: Date,
    SateOfSupply: String,
    Discount: Number,
    DissTik: Number,
    ShippingCharge: Number,
    ShippingTax: Number,
    NetTotalAmount: Number,
    PaymentType: String,
    PaymentTypeName: String,
    ReceivedAmount: Number,
    PaidTik: Number,
    Balance: Number,
    Status: { type: String, default: 'Unpaid' },
    TotalAmount: Number,
    subdata: [
        {
            SaleTrnId: {type: Number, unique: true},
            ItemId: Number,
            Pcs: Number,
            SaleRate: Number,
            SaleDiscPer: Number,
            WholesaleRate: Number,
            WholesaleDisPer: Number,
            GSTPer: Number,
            TotalAmount: Number,
            Discount: Number,
            NetAmount: Number
        }
    ]
});



SaleSchema.pre('save', async function (next) {
    const sale = this;

    // Generate SaleTrnId for each subdata entry
    if (sale.isNew) {
        sale.subdata.forEach((subdata, index) => {
            subdata.SaleTrnId = index + 1;
        });

        // Auto-increment SaleId logic remains the same
        const lastSale = await mongoose.model('Sale').findOne().sort({ SaleId: -1 });
        sale.SaleId = lastSale ? lastSale.SaleId + 1 : 1;

        // Update Item's subdata array if Item ID is provided
        const Item = mongoose.model('Item');
        await Item.findByIdAndUpdate(sale.Item, {
            $addToSet: { subdata: sale._id }
        });
    }

    next();
});

module.exports = {SaleSchema};