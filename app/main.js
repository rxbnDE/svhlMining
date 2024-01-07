// .env file
const dotenv = require('dotenv');
dotenv.config();

// moment.js - date objects
var moment = require('moment-timezone');
var tz = "Europe/Berlin";

// run start api
require('./bin/web/server');

const db = require('./bin/db/module');
db.connect();

const CronJob = require('cron').CronJob;
job = new CronJob(
	'* * * * *',
	function() {
		(async () => {
			console.log("cron job");
		})()
	},
	null,
	true
);
