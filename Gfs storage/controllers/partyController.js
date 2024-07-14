// controllers/partyController.js
const { decrypt } = require('../utils/encryptionUtil'); // Adjust path as necessary 
const getUserDatabaseConnection = require('../DB/connection');
const {PartySchema} = require('../models/partySchema'); // Adjust the path as necessary
// const User = require('../models/User'); // Adjust the path as necessary
// const State = require('../models/State'); // Adjust the path as necessary

const partyAdd = async (req, res) => {
    const encryptedData = req.headers['x-encrypted-data'];
    const iv = req.headers['x-iv'];

    try {
        if (!encryptedData || !iv) {
            return res.status(400).json({ message: 'Missing encrypted data or IV' });
        }

        const decryptedData = decrypt(encryptedData, iv);
        const userData = JSON.parse(decryptedData);

        const userDbConnection = getUserDatabaseConnection(`db_${userData.username}`);

        const Party = userDbConnection.model('Party', PartySchema);

        const {
            partyName,
            MobileNo,
            GSTIN,
            GSTType,
            AsOfDate,
            BillingAddress,
            Email,
            ShippingAddress,
            OpeningBalance,
            creditLimitToggle,
            creditLimit
        } = req.body;

        const newParty = new Party({
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
        res.status(500).json({ message: 'An error occurred while adding the party' });
    }
};

module.exports = {
    partyAdd,
};
