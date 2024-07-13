const mongoose = require('mongoose');
const { Schema } = mongoose;

const PartySchema = new Schema({
    partyId: {type: Number,unique: true},
    partyName: {type: String, required: true},
    MobileNo: Number,
    GSTIN: String,
    GSTType:String,
    AsOfDate: Date,
    BillingAddress: String,
    creditLimit: {type: Number,default: 0},
    Email: String,
    ShippingAddress : String,
    OpeningBalance : Number,
});

module.exports =  {PartySchema};



// // Middleware to auto-increment the partyId field
// PartySchema.pre('save', async function (next) {
//     if (this.isNew) {
//         const lastParty = await mongoose.model('Party').findOne().sort({ partyId: -1 });
//         this.partyId = lastParty ? lastParty.partyId + 1 : 1;
//     }
//     next();
// });