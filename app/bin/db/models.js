var mongoose = require('mongoose');
var models = {};

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;



// radar
models.radar = new Schema({
	time: {type: Date, default: Date.now},
	noTrips: Number,
	trips: []
}, {
	timeseries: {
		timeField: 'time',
		granularity: 'minutes'
	}
});

// trips
models.trips = new Schema({
	radar: Schema.Types.ObjectId, // reference to radar
	time: {type: Date, default: Date.now},
	trip: {}
}, {
	timeseries: {
		timeField: 'time',
		granularity: 'minutes'
	}
});

module.exports = (con) => {
	let mdls = {};

	// initialize models
	mdls.radar = con.model('Radar', models.radar);
	mdls.trips = con.model('Trips', models.trips);

	// return models for further processing
	return mdls;
};
