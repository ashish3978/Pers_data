const getUserDatabaseConnection = require('../DB/connection');
const {ItemSchema} = require('../models/itemSchema');

const itemAdd = async (req, res) => {
    try {
        const { ItemCode, ItemName, PartyName, CatName, saleRate, saleDiscAmt, GstPer, saleDiscPer, WholesalePcs, WholesaleRate, PurchasePrice, Pcs, MinStockPcs, MinStockDate, StockLocation } = req.body;

        const userDbConnection = await getUserDatabaseConnection(req);

        // Define the Item model using the ItemSchema for the user's database
        const Item = userDbConnection.model('Item', ItemSchema);

        // Create a new item object
        const newItem = new Item({
            ItemCode,
            ItemName,
            CatName,
            saleRate,
            saleDiscAmt,
            saleDiscPer,
            WholesalePcs,
            WholesaleRate,
            PurchasePrice,
            GstPer,
            Pcs,
            MinStockPcs,
            MinStockDate: new Date(MinStockDate), // Ensure correct date format
            StockLocation,
            subdata: [] // Initialize subdata as empty array
        });

        // Save the new item to the database
        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {itemAdd};





