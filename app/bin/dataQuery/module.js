// init
var methods = {};

// HAFAS Client
const createHafas = require('hafas-client')
const withThrottling = require('hafas-client/throttle')
const withRetrying = require('hafas-client/retry')
const nahsh = require('hafas-client/p/nahsh')
const hafas = createHafas(withRetrying(withThrottling(nahsh, 5, 1000), {
	retries: 4,
	minTimeout: 2 * 1000,
	factor: 3
}), 'monitor-departures-uzl')
const debug = require('debug')('dataQuery:module');

// pad function
pad = (x, n) => x.toString().padStart(n, '0');

/**
 * connects to db
 * @author Ruben Meyer
 * @async
 */
methods.connect = async () => {
	if(typeof db !== "undefined") return;

	// connect
	mongoose.connect(process.env.DB_URL, {
		
	});


	db = mongoose.connection;
	db = await db.useDb(process.env.DB_NAME);
	models = mdls(db);

	// connection error handling
	db.on('error', (data) => {
		log.error('MongoDB connection error:\n', data);
		process.exit(); // exit on connection error
	});
}

methods.getRadar = async (obj) => {
	promise = new Promise((resolve, reject) => {
		try {
			hafas.radar(obj.query, obj.filter)
			.then((journeys) => {
				console.log(new Date().toGMTString() + " - Anzahl Trips: " + journeys.length);
	
				// create file prefix
				d = new Date(),
				prefix = pad(d.getFullYear(), 4)+"-"+pad(d.getMonth()+1, 2)+"-"+pad(d.getDate(), 2)+"-"+pad(d.getHours(), 2)+"-"+pad(d.getMinutes(), 2);
	
				// filter journeys and remove specific parameters
				for(var j in journeys) {
					delete journeys[j]["polyline"];
				}
				resolve(journeys)
			})
			.catch(reject)
		} catch(e) {
			console.error(e);
			resolve([])
		}
	})
	return promise
};

methods.getTrips = async (journeys) => {

	promise = new Promise((resolve, reject) => {
		// for each trip
		promises = []

		for(journey of journeys) {
			promises.push(new Promise((res, rej) => {
				try {
					hafas.trip(journey.tripId, journey.line.name).then((trip) => {
						res(trip)
					}).catch(rej)
				} catch(e) {
					console.error(e);
					res({})
				}
			}))
		}

		Promise.all(promises).then(resolve)
	})
	return promise
}


module.exports = methods;
