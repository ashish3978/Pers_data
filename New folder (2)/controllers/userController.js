const mongoose = require('mongoose');
const { encrypt } = require('../utils/encryptionUtil');
const {MasterSchema} = require('../models/masterModel');  // Import MasterSchema directly
const {ItemSchema} = require('../models/itemSchema');
const {CompanySchema} = require('../models/companySchema');
const {UserSchema} = require('../models/userSchema');
const {PartySchema} = require('../models/partySchema');
const{SaleSchema} = require('../models/saleModel');
const bcrypt = require('bcrypt');

const masterDbUri = 'mongodb://localhost:27017/MasterDB'; // Replace with your master database URI

const registerUser = async (req, res) => {
    let masterDbConnection;

    try {
        const { username, password, email, mobileNo, fullname } = req.body;

        // Log incoming request
        console.log('Registering user with:', { username, password, email, mobileNo, fullname });

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate database name, user, and password
        const databaseName = `db_${username}`;
        const dbUser = 'ac';
        const dbPassword = '12345';

        // Connect to the master database
        masterDbConnection = await mongoose.createConnection(masterDbUri);

        // Define the MasterModel using the MasterSchema
        const MasterModel = masterDbConnection.model('MasterModel',MasterSchema);

        // Save the database info in the master database
        const masterEntry = new MasterModel({ email, mobileNo, fullname, databaseName, dbUser, dbPassword });
        await masterEntry.save();
        console.log('Master database entry saved successfully.');
        console.log('Master Entry:', masterEntry); // Log Master Entry

        // Create the new database connection
        const newDbUri = `mongodb://localhost:27017/${databaseName}`;
        console.log('Connecting to new database:', newDbUri);
        const newDbConnection = mongoose.createConnection(newDbUri);

        // Define models for the user-specific database
        const User = newDbConnection.model('User', UserSchema);
        const Company = newDbConnection.model('Company', CompanySchema);
        const Item = newDbConnection.model('Item', ItemSchema);
        const Party = newDbConnection.model('Item', PartySchema);
        const Sale = newDbConnection.model('Sale', SaleSchema);

        // Save the user info in the new database
        const userEntry = new User({ username, password: hashedPassword, email, mobileNo, fullname });
        await userEntry.save();
        console.log('User database entry saved successfully.');
        console.log('User Entry:', userEntry); // Log User Entry

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'An error occurred while registering the user' });
    } finally {
        // Close the master database connection
        if (masterDbConnection) {
            masterDbConnection.close();
        }
    }
}

const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const masterDbConnection = mongoose.createConnection(masterDbUri);
        const MasterModel = masterDbConnection.model('MasterModel', MasterSchema);
 
        const masterEntry = await MasterModel.findOne({ databaseName: `db_${username}` });
        if (!masterEntry) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newDbUri = `mongodb://localhost:27017/${masterEntry.databaseName}`;
        const newDbConnection = mongoose.createConnection(newDbUri);
        const User = newDbConnection.model('User', UserSchema);
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Encrypt user data to return
        const userData = { username: user.username, email: user.email }; // Adjust as needed
        const encryptedData = encrypt(JSON.stringify(userData));

        res.status(200).json({ 
            message: 'Login successful', 
            encryptedData: encryptedData.encryptedData,
            iv: encryptedData.iv
        });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};






module.exports = {
    registerUser,
    loginUser
};
