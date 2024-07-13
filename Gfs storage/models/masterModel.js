const mongoose = require('mongoose');
const { Schema } = mongoose;

const MasterSchema = new Schema({
    email: String,
    mobileNo: String,
    fullname: String,
    databaseName: String,
    dbUser: String,
    dbPassword: String
});

module.exports = {MasterSchema};
