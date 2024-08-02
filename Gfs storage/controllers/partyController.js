// controllers/partyController.js
const { decrypt } = require('../utils/encryptionUtil'); // Adjust path as necessary 
const getUserDatabaseConnection = require('../DB/connection');
const { PartySchema } = require('../models/partySchema'); // Adjust the path as necessary
// const User = require('../models/User'); // Adjust the path as necessary
// const State = require('../models/State'); // Adjust the path as necessary

const partyAdd = async (req, res) => {
    const parseDateTime = (dateTimeString) => {
        const [datePart, timePart] = dateTimeString.split(' ');
        const [day, month, year] = datePart.split('/').map(Number);

        // Use current time if timePart is not provided
        const now = new Date();
        const [hours = now.getHours(), minutes = now.getMinutes(), seconds = now.getSeconds(), milliseconds = now.getMilliseconds()] =
            (timePart || `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}:${now.getMilliseconds()}}`).split(':').map(Number);

        // Surat, Gujarat (GMT+5:30) offset in milliseconds
        const localOffsetMillis = 390 * 60 * 1000; // 5 hours 30 minutes

        // Create a local Date object
        const localDate = new Date(year, month - 1, day, hours, minutes, seconds);

        // Convert local time to UTC
        const utcDate = new Date(localDate.getTime() - localOffsetMillis);

        // Log parsed values for debugging
        console.log('Parsed Date:', { year, month, day });
        console.log('Parsed Time:', { hours, minutes, seconds });
        console.log('Local Date Object:', localDate);
        console.log('UTC Date Object:', utcDate);

        return utcDate;
    };


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

        // Convert AsOfDate to a Date object
        const dateTimeObject = parseDateTime(AsOfDate);

        // Log the Date object before saving
        console.log('Date-Time Object to Save:', dateTimeObject);

        const newParty = new Party({
            partyName,
            MobileNo,
            GSTIN,
            GSTType,
            AsOfDate: dateTimeObject,
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

const partyList = async (req, res) => {
    const { partyName } = req.body; // Fetch the body parameter 'partyName'

    try {
        // Example: Retrieve user database connection based on authenticated user
        const encryptedData = req.headers['x-encrypted-data'];
        const iv = req.headers['x-iv'];

        if (!encryptedData || !iv) {
            return res.status(400).json({ message: 'Missing encrypted data or IV' });
        }

        const decryptedData = decrypt(encryptedData, iv);
        const userData = JSON.parse(decryptedData);
        const userDbConnection = getUserDatabaseConnection(`db_${userData.username}`);

        const Party = userDbConnection.model('Party', PartySchema);

        // Fetch all party data if partyName is 0
        if (partyName === 0) {
            const parties = await Party.find({});

            // Function to format date as DD/MM/YYYY
            const formatDate = (date) => {
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                return `${day}/${month}/${year}`;
            };

            // Format the AsOfDate field
            const formattedParties = parties.map(party => ({
                ...party.toObject(),
                AsOfDate: formatDate(party.AsOfDate) // Format date as DD/MM/YYYY
            }));

            // Log each AsOfDate in the desired format
            formattedParties.forEach(party => {
                console.log(party.AsOfDate);
            });

            return res.status(200).json(formattedParties);
        } else {
            return res.status(400).json({ message: 'Invalid value for partyName' });
        }
    } catch (error) {
        console.error('Error fetching party data:', error);
        res.status(500).json({ message: 'An error occurred while fetching party data' });
    }
};



module.exports = {
    partyAdd,
    partyList
};
