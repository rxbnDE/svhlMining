expand = (s) => {
	return (s.length == 1) ? "0"+s : s;
};

/**
 * TimePlot
 */
timePlot = null;
timePlotOptions = {
	fill: 'tozerox',
	type: 'scatter'
};
timeData = {x: [], y: []}

/**
 * DelayPlot
 */
delayPlot = null;
delayData = []

/**
 * 
 * OSM
 * 
 */
const coords = [53.8662,10.6870]
var map = L.map('map').setView(coords, 10.5);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	minZoom: 10,
	maxZoom: 15,
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
L.circle(coords, {
	color: 'red',
	fillColor: '#f03',
	fillOpacity: 0.5,
	radius: 150
}).addTo(map);

markers = L.layerGroup().addTo(map);

// updates OSM and TimePlot
updates = () => {
	// OSM
	fetch('/api/getRadar')
	.then(resp => resp.json())
	.then(data => {
		markers.clearLayers();
		console.log("getRadar", data);

		for(trip of data.reply[0].trips) {
			iconObj = {
				iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-%%COLOR%%.png',
				shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
				iconSize: [25, 41],
				iconAnchor: [12, 41],
				popupAnchor: [1, -34],
				shadowSize: [41, 41]
			};

			// status degraded
			if(typeof trip.nextStopovers[3] !== "undefined" && trip.nextStopovers[3].arrivalDelay == null) {
				iconObj.iconUrl = iconObj.iconUrl.replace("%%COLOR%%", "red");
				iconObj.iconSize = [18, 30];
				iconObj.iconAnchor = [12, 30];
				iconObj.popupAnchor = [1, -34],
				iconObj.shadowSize = [30, 30];
			} else {
				iconObj.iconUrl = iconObj.iconUrl.replace("%%COLOR%%", "green");
			}

			icon = new L.Icon(iconObj);
			marker = L.marker([trip.location.latitude, trip.location.longitude], {icon: icon});
			marker.addTo(markers);
			if(trip.line.name !== "Bus")
				marker.bindTooltip(`${trip.line.name} - ${trip.direction}`);
			else
				marker.bindTooltip(`${trip.line.name} ${trip.line.id} - ${trip.direction}`);
		}

		
	})
	.catch(err => {
		console.log("err");
		console.error(err);
	});

	// TimePlot
	fetch('/api/getRadarPlotData')
	.then(resp => resp.json())
	.then(data => {
		console.log(data);
		x = [];
		y = [];
		for(i = 0; i < data.reply.length; i++) {
			radar = data.reply[i];
			x.push(new Date(radar.time));
			y.push(radar.noTrips);
		}
		timeData.x = x;
		timeData.y = y;
		console.log(timeData);
		if(timePlot == null) {
			timePlot = document.getElementById("timePlot");
			Plotly.newPlot(timePlot, [{
				x: timeData.x,
				y: timeData.y,
				...timePlotOptions
			}],
			{
				title: "History (no. Trips)",
				font: { size: 18 },
				sliders: [
					{
						x: 1,
					}
				]
			},
			{
				responsive: true
			});
		} else {
			// console.log("timePlot", timePlot, timeData);
			Plotly.deleteTraces(timePlot, 0);
			Plotly.addTraces(timePlot, {...timeData, ...timePlotOptions});
		}
	})
	.catch(err => {
		console.log("err");
		console.error(err);
	});

	// delay plot
	fetch('/api/getTripPlotData')
	.then(resp => resp.json())
	.then(data => {
		console.log("getTripPlotData", data);

		delayData = []
		tripIds = {}
		for(i = 0; i < data.reply.length; i++) {
			delay = data.reply[i];
			if(!(delay.trip.id in tripIds)) {
				tripIds[delay.trip.id] = {
					x: [],
					y: [],
					line: {shape: 'spline'},
					//fill: 'tozerox',
					name: delay.trip.line.name + " [" + delay.trip.direction + "]"
				}
			}
			tripIds[delay.trip.id].x.push(new Date(delay.time));
			tripIds[delay.trip.id].y.push(delay.trip.arrivalDelay/60.0);
		}

		for(trip in tripIds) {
			delayData.push(tripIds[trip])
		}
		

		if(delayPlot == null) {
			delayPlot = document.getElementById("delayPlot");
			Plotly.newPlot(delayPlot, delayData,
			{
				title: "Delay (in Min)",
				font: { size: 18 },
				sliders: [
					{
						x: 1,
					}
				]
			},
			{
				responsive: true
			});
		} else {
			// console.log("delayPlot", delayPlot, delayData);
			Plotly.react(delayPlot, delayData);
		}
	})
	.catch(err => {
		console.log("err");
		console.error(err);
	});
}

// update every minute
updates();
setInterval(updates, 60 * 1000);