// init
var mongoose = require('mongoose');
var sanitize = require('mongo-sanitize');
var crypto = require('crypto');
var moment = require('moment-timezone');
var tz = "Europe/Berlin";
var methods = {};

var db;
var mdls = require('./models.js');
var models;

/**
 * connects to db
 * @author Ruben Meyer
 * @async
 */
methods.connect = async () => {
	if(typeof db !== "undefined") return;

	// connect
	mongoose.connect('mongodb://'+process.env.DB_USER+':'+process.env.DB_PASSWORD+'@mongodb:'+process.env.DB_PORT+'/admin', {
		
	});


	db = mongoose.connection;
	db = await db.useDb(process.env.MONGODB_DATABASE);
	models = mdls(db);

	// connection error handling
	db.on('error', (data) => {
		log.error('MongoDB connection error:\n', data);
		process.exit(); // exit on connection error
	});
}

/**
 * returns db instance
 * @author Ruben Meyer
 * @return {Object} mongoose
 */
methods.getConnection = () => {
	return db;
}

//
// RADAR
//
/**
 * @author Ruben Meyer
 * @async
 * @param {Object} obj data obj
 * @return {Object} async(bool, err)
 */
methods.addRadar = async(obj) => {
	if(typeof obj !== 'object') return {err: new TypeError('obj is not an object::database.addRadar('+JSON.stringify(obj)+')', module.filename)};

	let Radar = models.radar;

	let entry = new Radar();
	entry.trips = obj.trips;
	entry.noTrips = obj.trips.length;

	try {
		reply = await entry.save();

		return {reply: true, id: entry._id};
	} catch(err) {
		console.error(err);
		return {err: err};
	}

}

/**
 * @author Ruben Meyer
 * @async
 * @param {Object} obj data obj
 * @return {Object} async(bool, err)
 */
methods.addTrip = async(obj) => {
	if(typeof obj !== 'object') return {err: new TypeError('obj is not an object::database.addTrip('+JSON.stringify(obj)+')', module.filename)};

	let Trips = models.trips;

	let entry = new Trips();
	entry.radar = obj.radar;
	entry.trip = obj.trip;

	try {
		reply = await entry.save();

		return {reply: true, id: entry._id};
	} catch(err) {
		console.error(err);
		return {err: err};
	}

}

/**
 * @author Ruben Meyer
 * @async
 * @return {Object} async(bool, err)
 */
methods.getTripPlotData = async() => {
	let Trips = models.trips;

	start = new Date();
	start.setDate(start.getDate()-1);

	try {
		data = await Trips.find({
			time: {
				$gte: start
			}
		}, {'time': 1, 'trip.arrivalDelay': 1, 'trip.id': 1, 'trip.line.name': 1, 'trip.direction':1, '_id': 0}).exec();

		return {reply: data};
	} catch(err) {
		return {err: err};
	}
};

/**
 * @author Ruben Meyer
 * @async
 * @return {Object} async(bool, err)
 */
methods.getRadarPlotData = async() => {
	let Radar = models.radar;

	start = new Date();
	start.setDate(start.getDate()-1);

	try {
		data = await Radar.find({
			time: {
				$gte: start
			}
		}, {time: 1, noTrips: 1, _id: 0}).exec();

		return {reply: data};
	} catch(err) {
		return {err: err};
	}
};

/**
 * @author Ruben Meyer
 * @async
 * @param {Object} obj data obj
 * @return {Object} async(bool, err)
 */
methods.getRadar = async(obj) => {
	let Radar = models.radar;

	try {
		data = await Radar.find(obj).sort({ time: -1}).exec();

		return {reply: data};
	} catch(err) {
		return {err: err};
	}

};

/**
 * @author Ruben Meyer
 * @async
 * @param {Object} obj data obj
 * @return {Object} async(bool, err)
 */
methods.getLatestRadar = async(obj) => {
	let Radar = models.radar;

	try {
		data = await Radar.find().sort({ time: -1}).limit(1).exec();

		return {reply: data};
	} catch(err) {
		return {err: err};
	}

};


/**
 * @author Ruben Meyer
 * @async
 * @param {Object} obj data obj
 * @return {Object} async(bool, err)
 */
methods.getTrips = async(obj) => {
	let Radar = models.radar;
	let Trips = models.trips;

	try {
		data = await Trips.find({radar: obj.radar}).sort({ time: -1}).limit(obj.noTrips).exec();

		return {reply: data};
	} catch(err) {
		return {err: err};
	}
}

/**
 * @author Ruben Meyer
 * @async
 * @param {Object} obj data obj
 * @return {Object} async(bool, err)
 */
methods.getLatestTrips = async(obj) => {
	let Radar = models.radar;
	let Trips = models.trips;

	latestRadar = await methods.getLatestRadar()
	latestRadar = latestRadar.reply[0]

	try {
		data = await Trips.find({radar: latestRadar._id}).sort({ time: -1}).limit(latestRadar.noTrips).exec();

		return {reply: data};
	} catch(err) {
		return {err: err};
	}
}

/**
 * @author Ruben Meyer
 * @async
 * @param {Object} obj data obj
 * @return {Object} async(bool, err)
 */
methods.getTripById = async(obj) => {
	let Trips = models.trips;

	try {
		data = await Trips.find({_id: obj.id}).limit(1).exec();

		return {reply: data};
	} catch(err) {
		return {err: err};
	}
}

/**
 * @author Ruben Meyer
 * @async
 * @param {Object} obj data obj
 * @return {Object} async(bool, err)
 */
methods.getRadarById = async(obj) => {
	let Radar = models.radar;

	try {
		data = await Radar.find({_id: obj.id}).limit(1).exec();

		return {reply: data};
	} catch(err) {
		return {err: err};
	}
}


//  ////////  ////////  ////////  ////////  ////////
//  //           //     //    //     //     //
//  ////////     //     //    //     //     ////////
//        //     //     ////////     //           //
//  ////////     //     //    //     //     ////////
//
////////////////////////////////////////////////////////

/**
 * returns user count
 * @author Ruben Meyer
 * @async
 * @return {Object} async(int, err)
 */
methods.doorstateCount = async () => {
	let stateModel = models.doorstate;

	try {
		count = await stateModel.countDocuments({}).exec();
		return {reply: count};
	} catch(err) {
		return {err: err};
	}
};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////


module.exports = methods;
