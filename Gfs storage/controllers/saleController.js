const Sale = require('../models/saleModel');
const Party = require('../models/partySchema');
const Item = require('../models/itemSchema');
// const User = require('../../Models/UserModel');

// Create a new party
const saleAdd = async (req, res) => {

    const {
        SaleId,
        PartyId: partyId,
        PartyName: partyName,
        InvoiceNo,
        InvoiceDate,
        PaymentTerms,
        DueDate,
        SateOfSupply,
        Discount,
        DissTik,
        ShippingCharg,
        ShippingTax,
        NetTotalAmount,
        PaymentType,
        PaymentTypeName,
        ReceivedAmount,
        PaidTik,
        Balance,
        Status,
        TotalAmount,
        SaleTrnId,
        ItemCode
    } = req.body;

    try {
        // Fetch party data by partyId
        const party = await Party.findOne({ partyId }, 'partyId partyName').exec();
        if (!party) {
            return res.status(404).json({ message: 'Party Id not found' });
        }

        // Check if the partyName matches
        if (party.partyName !== partyName) {
            console.log(`Mismatch: Party Name from request (${partyName}) does not match Party Name from database (${party.partyName})`);
            return res.status(400).json({ message: `Party Name does not match for Party ID ${partyId}`});
        }

        // Fetch item data using ItemCode (assuming ItemCode is the item ID)
        const itemData = await Item.findOne({ });
        console.log();
        if (!itemData) {
            return res.status(404).json({ message: 'Item data not found' });
        }

        // Construct subdata array
        const saleDetails = {
            SaleTrnId,
            ItemId: itemData.ItemCode, // Assuming ItemCode is the item ID
            Pcs,
            SaleRate: itemData.saleRate,
            SaleDiscPer: itemData.saleDiscPer,
            WholesaleRate: itemData.WholesaleRate,
            GSTPer: itemData.GSTPer,
            TotalAmount,
            Discount,
            NetAmount: NetTotalAmount
        };

        // Update existing item's subdata with saleDetails
        itemData.subdata.push(saleDetails);

        // Save the updated item with new subdata
        const updatedItem = await itemData.save();

        // Create a new Sale object
        const newSale = new Sale({
            SaleId,
            PartyId: party.partyId,
            PartyName: party.partyName,
            InvoiceNo,
            InvoiceDate,
            PaymentTerms,
            DueDate,
            SateOfSupply,
            Discount,
            DissTik,
            ShippingCharg,
            ShippingTax,
            NetTotalAmount,
            PaymentType,
            PaymentTypeName,
            ReceivedAmount,
            PaidTik,
            Balance,
            Status,
            TotalAmount,
            subdata: [saleDetails] // Pass saleDetails directly to subdata in new sale document
        });

        // Save the new sale document
        const newSales = await newSale.save();
        res.status(201).json(newSales);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
// const saleAdd = async (req, res) => {
//     const userId = req.user._id
//     console.log(userId)
//     // const user = await User.findByIdAndUpdate(userId, { $inc: { partyId: 1 } }, { new: true });

//     const {

//         SaleId,
//         PartyId: partyId,
//         PartyName: partyName,
//         InvoiceNo,
//         InvoiceDate,
//         PaymentTerms,
//         DueDate,
//         SateOfSupply,
//         Discount,
//         DissTik,
//         ShippingCharg,
//         ShippingTax,
//         NetTotalAmount,
//         PaymentType,
//         PaymentTypeName,
//         ReceivedAmount,
//         PaidTik,
//         Balance,
//         Status,
//         TotalAmount,
//         SaleTrnId,
//         // ItemCode
//     } = req.body;
// console.log(req.body);
//     console.log(partyName)

//     const party = await Party.findOne({ partyId: partyId }, 'partyId partyName').exec();
//        console.log(party);
//     if (!party) {
//         return res.status(404).json({ message: 'Party Id not found' });
//     }

//     // Check if the partyName matches
//     if (party.partyName !== partyName) {
//         console.log(Mismatch: Party Name from request (${partyName}) does not match Party Name from database (${party.partyName}));
//         return res.status(400).json({ message: Party Name does not match for Party ID ${partyId} });
//     }
//     // Ensure partyId and partyName are correctly set
//     console.log('Party ID:', party.partyId);
//     console.log('Party Name:', party.partyName);

//     const itemData = await Item.findOne({});
//     if (!itemData) {
//         return res.status(404).json({ message: 'Item data not found' });
//     }
//     const {ItemCode, Pcs, SaleRate, SaleDiscPer, WholesaleRate, WholesaleDisPer, GSTPer} = itemData
// console.log('Item Data:', itemData)
//     const newSale = new Sale({
//         userId,
//         SaleId,
//         PartyId: party.partyId,
//         PartyName: party.partyName,
//         InvoiceNo,
//         InvoiceDate,
//         PaymentTerms,
//         DueDate,
//         SateOfSupply,
//         Discount,
//         DissTik,
//         ShippingCharg,
//         ShippingTax,
//         NetTotalAmount,
//         PaymentType,
//         PaymentTypeName,
//         ReceivedAmount,
//         PaidTik,
//         Balance,
//         Status,
//         TotalAmount,
//         subdata: [
//         {
//             SaleTrnId,
//             ItemId : ItemCode,
//             Pcs,
//             SaleRate,
//             SaleDiscPer,
//             WholesaleRate,
//             WholesaleDisPer,
//             GSTPer,
//             TotalAmount : TotalAmount,
//             Discount : Discount,
//             NetAmount: NetTotalAmount,
//         }
//     ] 
//     });

//     try {
//         const newSales = await newSale.save();
//         res.status(201).json(newSales);
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// };
// // Get all parties
// const getAllSales = async (req, res) => {
//     try {
//         const userId = req.user._id; // Get the authenticated user ID from the token
//         console.log(userId);
//         // Retrieve party data from the database using the user ID
//         const partyData = await Party.find({ userId }).select('-_id -userId');

//         if (!partyData) {
//             return res.status(404).json({ message: 'Party data not found' });
//         }

//         res.json(partyData);
//     } catch (error) {
//         console.error('Error retrieving party data:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// }

module.exports = {
    saleAdd,
    // getAllSales
};