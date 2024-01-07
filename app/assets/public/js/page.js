expand = (s) => {
    return (s.length == 1) ? "0"+s : s;
};

const coords = [53.8662,10.6870]
var map = L.map('map').setView(coords, 10.5);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
L.circle(coords, {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 150
}).addTo(map);

markers = L.layerGroup().addTo(map);

updates = () => {
	fetch('/getRadar')
	.then(resp => resp.json())
	.then(data => {
		markers.clearLayers();

		for(trip of data.reply[0].trips) {
			L.marker([trip.location.latitude, trip.location.longitude])
			.addTo(markers)
			.bindTooltip(trip.line.name + " - " + trip.direction)
		}

		console.log(data);
	})
	.catch(err => {
		console.log("err");
		console.error(err);
	});
}

// update every minute
updates();
setInterval(updates, 60 * 1000);
