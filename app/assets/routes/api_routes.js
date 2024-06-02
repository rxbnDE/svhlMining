var express = require('express');
var router = express.Router();
var debug = require('debug')('app:routes:api');
var moment = require('moment-timezone');
var tz = "Europe/Berlin";


function timeSince(date) {
	var seconds = Math.floor((new Date() - date) / 1000);
	days = Math.floor(seconds / 86400);
	seconds -= days * 86400;
	hours = Math.floor(seconds / 3600);
	seconds -= hours * 3600;
	minutes = Math.floor(seconds / 60);
	seconds -= minutes * 60;

	str = "";
	if(days > 0) str += ` ${days}d`;
	if(hours > 0) str += ` ${hours}h`;
	if(minutes > 0 && days < 100) str += ` ${minutes}m`;
	if(seconds > 0 && days < 1) str += ` ${seconds}s`;

	return str;
}

let getRoutes = async () => {
	// mongooseConnection
	let db = require('../../bin/db/module');
	await db.connect();
	let con = db.getConnection();

	let cache = require('memory-cache');
	let duration = 40;

	router.get('/getRadarPlotData', async(req, res, next) => {
		key = "radar-plot-data";
		cached = cache.get(key);
		if(cached) {
			res.send(cached)
		} else {
			data = await db.getRadarPlotData();
			cache.put(key, JSON.stringify(data), duration*1000);
			res.send(JSON.stringify(data));
		}
	});
	router.get('/getTripPlotData', async (req, res, next) => {
		key = "trip-plot-data";
		cached = cache.get(key);
		if(cached) {
			res.send(cached)
		} else {
			data = await db.getTripPlotData();
			cache.put(key, JSON.stringify(data), duration*1000);
			res.send(JSON.stringify(data));
		}
	});

	router.get('/getRadar', async (req, res, next) => {
		data = await db.getLatestRadar();
		res.send(JSON.stringify(data));
	});

	router.get('/getTrips', async (req, res, next) => {
		data = await db.getLatestTrips();
		res.send(JSON.stringify(data));
	});

	return router;
}

module.exports = {routes: getRoutes};
