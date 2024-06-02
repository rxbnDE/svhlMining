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

	let cache = require('memory-cache');
	let duration = 40;

	// Default page
	router.get('/default', async (req, res, next) => {
		res.render('_old/default', { title: 'Default page' });
	});
	// Dashboard page
	router.get('/dashboard', async (req, res, next) => {
		res.render('_old/dashboard', { title: 'Default page' });
	});

	// Dashboard page
	router.get('/', async (req, res, next) => {
		res.render('index.pug', {page_url: req.originalUrl});
	});

	// Map page
	router.get('/map', async (req, res, next) => {
		res.render('map.pug', {page_url: req.originalUrl});
	});

	// Delay page
	router.get('/delay', async (req, res, next) => {
		res.render('delay.pug', {page_url: req.originalUrl});
	});
	return router;
}

module.exports = {routes: getRoutes};
