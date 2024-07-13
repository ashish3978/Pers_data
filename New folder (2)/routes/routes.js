// routes.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { generateToken } = require('../utils/jwt');
const User = require('../models/userSchema');
const auth = require('../middleware/auth');

const partyController = require('../controllers/partyController');
const itemController = require('../controllers/itemController');
const saleController = require('../controllers/saleController');

router.post('/itemAdd', itemController.itemAdd);
router.post('/partyAdd', partyController.partyAdd);
router.post('/saleadd', saleController.saleAdd);
const Company = require('../models/companySchema');


router.post('/companyRegister', async (req, res) => {
  const { companyCode, companyName, companyDatabaseName } = req.body;

  try {
    // Check if the company code already exists
    const existingCompany = await Company.findOne({ companyCode });
    if (existingCompany) {
      return res.status(400).json({ message: 'Company code already exists' });
    }

    const newCompany = new Company({
      companyCode,
      companyName,
      companyDatabaseName,
    });

    await newCompany.save();
    res.status(201).json({ message: 'Company registered successfully', company: newCompany });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Verify company code
router.post('/verify', async (req, res) => {
  const { companyCode } = req.body;

  try {
    const company = await Company.findOne({ companyCode });

    if (company) {
      res.status(200).json({ message: 'Company code verified', company });
    } else {
      res.status(400).json({ message: 'Invalid company code' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
// Register user
// router.post('/register', async (req, res) => {
//   const { companyCode, username, password } = req.body;

//   try {
//     console.log(`Registering user: ${username} for company: ${companyCode}`);

//     const company = await Company.findOne({ companyCode });
//     if (!company) {
//       console.error(`Invalid company code: ${companyCode}`);
//       return res.status(400).json({ message: 'Invalid company code' });
//     }

//     console.log(`Found company: ${company.companyName}`);

//     // Check if the user limit is reached
//     // const userCount = await User.countDocuments({ companyCode });
//     // console.log(`Current user count for company ${companyCode}: ${userCount}`);
//     // if (userCount >= company.userLimit) {
//     //   return res.status(400).json({ message: 'User limit reached for this company' });
//     // }

//     const user = new User({ companyCode, username, password });
//     await user.save();

//     res.status(201).json({ message: 'User registered successfully' });
//   } catch (error) {
//     console.error(`Error registering user: ${error.message}`, error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });




// Get user details (protected route)
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;
