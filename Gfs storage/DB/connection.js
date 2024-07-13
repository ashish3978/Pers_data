const mongoose = require('mongoose');

const connections = {}; // Cache for database connections

const getUserDatabaseConnection = (databaseName) => {
    console.log(databaseName);
    if (connections[databaseName]) {
        return connections[databaseName];
    }

    const uri = `mongodb://localhost:27017/${databaseName}`;
    const connection = mongoose.createConnection(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    connection.on('error', console.error.bind(console, `MongoDB connection error for ${databaseName}:`));
    connection.once('open', () => {
        console.log(`Connected to MongoDB database: ${databaseName}`);
    });

    connections[databaseName] = connection;
    return connection;
};

module.exports = getUserDatabaseConnection;
