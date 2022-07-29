const mongoose = require('mongoose');

async function makeConnection(mongodb_url) {
    try {
        await mongoose.connect(mongodb_url);
        console.log('Database connection established...');
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

module.exports = { makeConnection };