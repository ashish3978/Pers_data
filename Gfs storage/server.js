const express = require('express');
const bodyParser = require('body-parser');
const registerRoutes = require('./routes/routes');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/userRoutes');
const app = express();
const port = process.env.PORT || 3000;
// const crypto = require('crypto');

// // Generate a random 32-byte (256-bit) key
// const key = crypto.randomBytes(32).toString('hex'); // Converts to a hexadecimal string
// console.log('Generated Encryption Key:', key);

const { encrypt, decrypt } = require('./utils/encryptionUtil');

// Example data
const dataToEncrypt = "Sensitive User Data";

// Encrypt the data
const encrypted = encrypt(dataToEncrypt);
console.log('Encrypted:', encrypted);

// Decrypt the data
const decrypted = decrypt(encrypted.encryptedData, encrypted.iv);
console.log('Decrypted:', decrypted);

// Middleware
app.use(express.json());
app.use(bodyParser.json());

// Routes
app.use('/api', registerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);




// Connect to MongoDB
// mongoose.connect('mongodb://127.0.0.1:27017/Acco', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// }).then(() => {
//   console.log('MongoDB connected');
// }).catch(err => {
//   console.error(err);
// });

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
