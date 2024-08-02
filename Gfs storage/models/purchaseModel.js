const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubdataSchema = new Schema({
    PurchaseTrnId: Number,
    ItemId: Number,
    Pcs: Number,
    BuyRate: Number,
    BuyDiscPer: Number,
    WholesaleRate: Number,
    WholesaleDisPer: Number,
    GSTPer: Number,
    TotalAmount: Number,
    Discount: Number,
    NetAmount: Number
});

const PurchaseSchema = new Schema({
    PurchaseId: { type: Number },
    BillNo: { type: String },
    BillDate: Date,
    PartyId: Number,
    PartyName: String,
    PaymentTerms: String,
    DueDate: Date,
    Status: { type: String, default: 'Unpaid' },
    StateOfSupply: String,
    TotalAmount: Number,
    Discount: Number,
    ShippingCharge: Number,
    ShippingTax: Number,
    NetTotalAmount: Number,
    PaymentType: String,
    PaidAmount: Number,
    Balance: Number,
    SubData: [SubdataSchema],
    EUser: Number,
    EDevice: String,
    Type: String,
});

// Middleware to handle changes
PurchaseSchema.pre('save', async function (next) {
    const purchase = this;

    if (purchase.isNew) {
        // Generate PurchaseId
        const lastPurchase = await this.constructor.findOne().sort({ PurchaseId: -1 });
        purchase.PurchaseId = lastPurchase ? lastPurchase.PurchaseId + 1 : 1;

        // Generate BillNo
        const today = new Date();
        const year = today.getFullYear().toString().slice(-2);
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');

        const prefix = `${year}${month}${day}`;
        const lastBill = await this.constructor.findOne({ BillNo: new RegExp(`^${prefix}`) }).sort({ BillNo: -1 });

        const lastBillNumber = lastBill ? parseInt(lastBill.BillNo.slice(-4), 10) : 0;
        const nextBillNumber = (lastBillNumber + 1).toString().padStart(4, '0');

        purchase.BillNo = `${prefix}${nextBillNumber}`;
    }

    next();
});

module.exports = { PurchaseSchema, SubdataSchema };
