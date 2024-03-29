// .env file
const dotenv = require('dotenv');
dotenv.config();

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

// filesystem access
const fs = require('fs')
const path = require('path')

// util functions
saveFile = (folder, prefix, data) => {
	fullFolderPath = process.env.STORAGE + path.sep + folder;
	if(!fs.existsSync(fullFolderPath)) fs.mkdirSync(fullFolderPath, { recursive: true });
	fs.writeFileSync(fullFolderPath + path.sep + prefix +"_"+Date.now()+".json", JSON.stringify(data));
}
pad = (x, n) => x.toString().padStart(n, '0');

hafas.radar({
	north: 53.985320,
	west: 10.48835,
	south: 53.75898,
	east: 10.964140
}, {
	results: 500,
	language: 'en'
})
.then((journeys) => {
	console.log(new Date().toGMTString() + " - Anzahl Trips: " + journeys.length);

	// create file prefix
	d = new Date(),
	prefix = pad(d.getFullYear(), 4)+"-"+pad(d.getMonth()+1, 2)+"-"+pad(d.getDate(), 2)+"-"+pad(d.getHours(), 2)+"-"+pad(d.getMinutes(), 2);

	// filter journeys and remove specific parameters
	for(var j in journeys) {
		delete journeys[j]["polyline"];
	}

	// save radar json
	saveFile('radar', prefix, journeys);

	// for each trip
	journeys.forEach(journey => {
		// query data
		//console.log(prefix + " - "+ journey.tripId + " - " + journey.line.name);
		hafas.trip(journey.tripId, journey.line.name).then((trip) => {
			// save trip json
			saveFile('trips', prefix, trip);
		}).catch(console.log)
	})
})
.catch(console.log)
