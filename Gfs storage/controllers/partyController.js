const { decrypt } = require('../utils/encryptionUtil'); 
const getUserDatabaseConnection = require('../DB/connection');
const { PartySchema } = require('../models/partySchema');
const moment = require('moment-timezone'); 

const partyAdd = async (req, res) => {
    const parseDateTime = (dateTimeString) => {
        if (!dateTimeString) {
            throw new Error('Date time string is not provided');
        }

        const [datePart, timePart = ''] = dateTimeString.split(' ');
        const [day, month, year] = datePart.split('/').map(Number);
        const [hours = 0, minutes = 0, seconds = 0] = timePart.split(':').map(Number);

        const now = new Date();
        const localDate = moment.tz({ year, month: month - 1, day, hour: hours, minute: minutes, second: seconds }, 'Asia/Kolkata');

        const utcDate = localDate.clone().utc().toDate();

        console.log('Parsed Date:', { year, month, day });
        console.log('Parsed Time:', { hours, minutes, seconds });
        console.log('Local Date Object:', localDate.format());
        console.log('UTC Date Object:', utcDate);

        return localDate;
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

        if (!AsOfDate) {
            return res.status(400).json({ message: 'AsOfDate is required' });
        }

        const dateTimeObject = parseDateTime(AsOfDate);

        console.log('Date-Time Object to Save:', dateTimeObject);

        const newParty = new Party({
            partyName,
            MobileNo,
            GSTIN,
            GSTType,
            AsOfDate: new Date(dateTimeObject),
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
    const { partyName } = req.body;

    try {
        const encryptedData = req.headers['x-encrypted-data'];
        const iv = req.headers['x-iv'];

        if (!encryptedData || !iv) {
            return res.status(400).json({ message: 'Missing encrypted data or IV' });
        }

        const decryptedData = decrypt(encryptedData, iv);
        const userData = JSON.parse(decryptedData);
        const userDbConnection = getUserDatabaseConnection(`db_${userData.username}`);
        const Party = userDbConnection.model('Party', PartySchema);

        if (partyName === 0) {
            const parties = await Party.find({});

            const formatDate = (date) => {
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                return `${day}/${month}/${year}`;
            };

            const formattedParties = parties.map(party => ({
                ...party.toObject(),
                AsOfDate: formatDate(party.AsOfDate)
            }));

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
