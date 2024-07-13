const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  companyCode: { type: String, required: true, unique: true },
  companyName: { type: String, required: true },
  companyDatabaseName: { type: String, required: true },
});

module.exports = {CompanySchema};

