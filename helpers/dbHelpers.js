require('dotenv').config();

const constructMongoURI = () => {
    const username = process.env.MONGO_USERNAME;
    const password = process.env.MONGO_PASSWORD;
    const domain = process.env.MONGO_DOMAIN;
    const dbName = process.env.MONGO_DB_NAME;

    if (!username || !password || !domain || !dbName) {
        throw new Error('Missing required MongoDB environment variables');
    }

    return `mongodb+srv://${username}:${password}@${domain}/${dbName}?retryWrites=true&w=majority`;
};

module.exports = { constructMongoURI };