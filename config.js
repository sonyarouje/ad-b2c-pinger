const config = require('./config.json');
const env = process.env.NODE_ENV || 'DEV';
const environmentConfig = config[env];

global.gConfig = environmentConfig;
