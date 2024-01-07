var express = require('express');
var router = express.Router();
var debug = require('debug')('app:routes:index');
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

	// Default page
	router.get('/default', async (req, res, next) => {
		res.render('default', { title: 'Default page' });
	});

	router.get('/getRadarPlotData', async(req, res, next) => {
		data = await db.getRadarPlotData();
		res.send(JSON.stringify(data));
	});

	router.get('/getRadar', async (req, res, next) => {
		data = await db.getLatestRadar();
		res.send(JSON.stringify(data));
	});

	router.get('/getTrips', async (req, res, next) => {
		data = await db.getLatestTrips();
		res.send(JSON.stringify(data));
	});

	// Dashboard page
	router.get('/', async (req, res, next) => {
		res.render('dashboard.pug', { title: 'Status Page'});
	});
	return router;
}

module.exports = {routes: getRoutes};
