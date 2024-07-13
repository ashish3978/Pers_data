// controllers/partyController.js
const { decrypt } = require('../utils/encryptionUtil'); // Adjust path as necessary 
const getUserDatabaseConnection = require('../DB/connection');
const {PartySchema} = require('../models/partySchema'); // Adjust the path as necessary
// const User = require('../models/User'); // Adjust the path as necessary
// const State = require('../models/State'); // Adjust the path as necessary

const partyAdd = async (req, res) => {
    const encryptedData = req.headers['x-encrypted-data']; // Ensure correct header key
    const iv = req.headers['x-iv']; // Ensure correct header key

    try {
        if (!encryptedData || !iv) {
            return res.status(400).json({ message: 'Missing encrypted data or IV' });
        }

        const decryptedData = decrypt(encryptedData, iv);
        const userData = JSON.parse(decryptedData);
        
        const userDbConnection = getUserDatabaseConnection(`db_${userData.username}`); // Use the username to get the correct database

        const Party = userDbConnection.model('Party', PartySchema);

        const newParty = new Party({
            partyId,
            partyName,
            MobileNo,
            GSTIN,
            GSTType,
            AsOfDate: new Date(AsOfDate),
            BillingAddress,
            Email,
            ShippingAddress,
            OpeningBalance,
            creditLimit: creditLimitToggle ? creditLimit : 0,
        });

        const savedParty = await newParty.save();
        res.status(201).json(savedParty);
    } catch (error) {
        console.error('Error adding party:', error);
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    partyAdd,
};
