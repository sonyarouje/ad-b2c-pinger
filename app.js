var express = require('express');

//config should be called to initialize the app configuration
var config = require('./config');
var fileManager = require('./fileManager');
const scheduler = require('./scheduledApiCaller');
const log = require('./log');
const checkConfig = require('./testEnvironment');

var app = express();
app.use(express.json());
var port = process.env.PORT || 8080;

const checkHeaderAndInvoke = (req, res, callback) => {
	if (process.env.API_KEY && process.env.API_KEY !== req.get('api_key')) {
		res.status(401).send('unauthorized request, invalid api_key in header');
		log.err(`unauthorized request to ${req.originalUrl}`, 'app.js');
		return;
	} else {
		callback();
	}
};

/**
 * API to test whether an ad b2c secured end point can be invoked.
 */
app.get('/test', function(req, res) {
	checkHeaderAndInvoke(req, res, () => {
		checkConfig.checkConfigs(response => {
			res.send(response);
		});
	});
});

/**
 * Save the refresh tokens and details collected when creating a token, this refresh token helps to renew the token when its required. 
 * JSON structure to pass
 * {
	"access_token": "xyx",
	"token_type": "Bearer",
	"not_before": 1577787724,
	"expires_in": 3600,
	"expires_on": 1577791324,
	"resource": "d7e22576-9f4c-494d-b89f-d252e67e2aea",
	"profile_info": "",
	"refresh_token": "<refresh token received when logging using ad b2c>",
	"refresh_token_expires_in": 1209600
  }
 */
app.post('/save/login/tokens', function(req, res) {
	checkHeaderAndInvoke(req, res, () => {
		fileManager.saveLoginCredentials(req.body, (err, data) => {
			if (err) {
				log.err('error in saving tokens', 'app.js', err);
				res.send(err);
			} else {
				res.send(data);
			}
		});
	});
});

/**
 * Saves the urls the scheduler needs to ping.
 * JSON Structure to pass
 * [
	"https://function122324.azurewebsites.net/ping",
	"https://function122323.azurewebsites.net/ping"
   ]
 */
app.post('/save/urls', function(req, res) {
	checkHeaderAndInvoke(req, res, () => {
		fileManager.saveUrls(req.body, (err, data) => {
			if (err) {
				log.err('error in saving urls', 'app.js', err);
				res.send(err);
			} else {
				res.send(data);
			}
		});
	});
});

/**
 * Save azure ad b2c configuration, these are the config details required to connect to ad b2c to get access tokens
 * JSON Structure
	{
		"client_id": "<client id provided by azure ad b2c>",
		"client_secret": "",
		"user_flow_policy": "B2C_1_signupsignin",
		"token_uri": "https://contoso.b2clogin.com/contoso.onmicrosoft.com/oauth2/v2.0/token",
		"authority_host": "https://contoso.b2clogin.com/contoso.onmicrosoft.com/oauth2/v2.0/authorize",
		"redirect_uri": "https://functionapp1201901567.azurewebsites.net/.auth/login/aad/callback",
		"resources": ["https://contoso.b2clogin.com"],
		"prompt": "login",
		"scope": ["https://contoso.onmicrosoft.com/api/offline_access", "offline_access"]
	}
 
 */
app.post('/save/b2cconfig', function(req, res) {
	checkHeaderAndInvoke(req, res, () => {
		fileManager.saveB2CConfigs(req.body, (err, data) => {
			if (err) {
				res.send(err);
				log.err('error in saving b2c config', 'app.js', err);
			} else {
				res.send(data);
			}
		});
	});
});

app.listen(port);

const job = scheduler.start();

log.log(`Listening on port ${port}...`, 'app.js');

const exitHandler = () => {
	job.cancel();
	log.log('exitting pinger');
	process.exit();
};

process.on('SIGINT', exitHandler);
