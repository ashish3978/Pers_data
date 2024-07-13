const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  mobileNo: String,
  fullname: String,
});


module.exports = {UserSchema};
