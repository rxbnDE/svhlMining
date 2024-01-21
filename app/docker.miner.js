// .env file
const dotenv = require('dotenv');
dotenv.config();

// moment.js - date objects
var moment = require('moment-timezone');
var tz = "Europe/Berlin";

const db = require('./bin/db/module');
db.connect();

const hafas = require('./bin/dataQuery/module');

const CronJob = require('cron').CronJob;
job = new CronJob(
	'* * * * *',
	function() {
		(async () => {
			
			date = moment(new Date()).tz("Europe/Berlin");
			day = date.day();
			hour = date.hour();
			minute = Math.floor(date.minute()/5)*5;

			// TODO:
			// hafas.getData
			// db.addRadar
			// for trips: db.addTrip
			console.log("date", date);

			obj = {
				query: {
					north: 53.985320,
					west: 10.48835,
					south: 53.75898,
					east: 10.964140
				},
				filter: {
					results: 1000,
					language: 'en'
				}
			}

			try {
				hafas.getRadar(obj).then(async (radar) => {
					keys = Object.keys(radar)
					console.log("hafas.getRadar radar", keys)
	
					dbRadar = await db.addRadar({
						trips: radar
					})
					
					if(keys.length > 0) {
						if(dbRadar.reply) {
							hafas.getTrips(radar).then((trips) => {
								console.log("hafas.getTrips trips", Object.keys(trips))
								trips.forEach(async (trip) => {
									await db.addTrip({
										radar: dbRadar.id,
										trip: trip
									})
								})
							}).catch((err) => {
								console.log("hafas.getTrips err", err)
							})
						}
					}
				}).catch((err) => {
					console.log("hafas.getRadar err", err)
				})
			} catch(e) {
				console.error(e);
			}
		})()
	},
	null,
	true
);
