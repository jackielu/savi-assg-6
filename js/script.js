//set up our map
var map = L.map('map')
	.setView([42.7559421,-75.8092041],7);


//set up basemap tiles from stamen
L.tileLayer('http://{s}.tile.stamen.com/toner-lite/{z}/{x}/{y}.png', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
	subdomains: 'abcd',
	minZoom: 5,
	maxZoom: 15
}).addTo(map);

//function to create pop-ups and sidebar divs
function makeMarkers(feature, layer){
	//console.log(feature);
	//layer.bindPopup defines the pop-up value
	//layer.bindPopup(
	//	"Ecozone: <br>"
	//	+ feature.properties.MINOR_DESC
	//	);
	//layer.bindLabel defines the label text
	layer.bindLabel(
		feature.properties.MINOR,
		{direction: 'auto'}
		);

	//set up DOM elements classed using the MINOR_DESC 
	$('#sideBar').append(
		"<p class = 'sideBarItem"
		+ " "
		+ feature.properties.MAJORCOLOR
		+ "' id='"
		+ feature.properties.MINOR_NUM
		+"'>"
		+ feature.properties.MINOR_DESC
		+"</p>"
		)
	}



function highlightMarker(geojsonLayer,thisPoly) {
  geojsonLayer.eachLayer(function(marker) {
		if(thisPoly==marker.feature.properties.MINOR_NUM) {
   		marker.setStyle({
   			fillOpacity: 0.95,
   			weight:3
   			});
   			//console.log(marker.options.fillOpacity);
		} else {
			marker.setStyle({
				fillOpacity:0.5,
				weight:1.25
				});
		}
  });
}


//get color depending on the Zone value 
function getColor(z) {
	return 	z == unique(keys)[0] ? '#a6cee3':
			z == unique(keys)[1] ? '#1f78b4':
			z == unique(keys)[2] ? '#fdbf6f':
			z == unique(keys)[3] ? '#33a02c':
			z == unique(keys)[4] ? '#fb9a99':
			z == unique(keys)[5] ? '#e31a1c':
			z == unique(keys)[6] ? '#ffff99':
			z == unique(keys)[7] ? '#ff7f00':
			z == unique(keys)[8] ? '#cab2d6':
			z == unique(keys)[9] ? '#6a3d9a':
			z == unique(keys)[10] ? '#b2df8a':
			z == unique(keys)[11] ? '#b15928':
			'#000000';
	}


function style(feature) {
	return {
		fillColor: getColor(feature.properties.MAJORCOLOR),
		color: getColor(feature.properties.MAJORCOLOR),
		weight: 1.25,
		opacity: 0.95,
		fillOpacity: 0.5
	};
}

//define a blank array
var keys = [];

//this is a function that pulls the values from MAJORCOLOR
function getArray(data) {
	for (var i=0; i< data.features.length; i++) {
	keys.push(data.features[i].properties.MAJORCOLOR);
	}
}

//this is a function to collapse to unique values
function unique(keys) {
    return keys.reduce(function(p, c) {
        if (p.indexOf(c) < 0) p.push(c);
        return p;
    }, []);
};


//this is the legend - another leaflet control
var legend = L.control({position: 'topright'});

legend.onAdd = function (map) {
	//use DomUtil to create divs with class info legend
	var div = L.DomUtil.create('div', 'info legend'),
		labels = []; //empty array for adding stuff to the legend
	//this loops through linking legend items with colors, resulting in all the pieces going into your legend
	for (var j = 0; j < unique(keys).length; j++) {
		labels.push(
			'<span id='
			+ String(unique(keys)[j])
			+ '><i style="background:'
			+ getColor(unique(keys)[j]) 
			+ '"></i>'
			+ unique(keys)[j]
			+ '</span>');
	}

	//console.log(labels);
	//window.test=labels;
	//joining up the labels array pieces
	div.innerHTML = labels.join('<br>');
	return div;
};


//add your data to the map
$.getJSON('data/ecozone_wgs84_multipart.geojson', function(data){
	//window.test = data;  //only use window for testing
	//console.log(data);

	//call the function to create zoneArray
	getArray(data);

	//call the function to add the legend to the map
	legend.addTo(map);

	var geojsonLayer = L.geoJson(data.features, {  //use leaflet's functionality to grab geoJSON features
		onEachFeature: makeMarkers,
		//this provides thematic styling to the layers
		style: style
	})
	.addTo(map);  //add to map

	$('.sideBarItem')
	.mouseenter(function(){
		$(this).toggleClass('highlight');
		var thisPoly = $(this).attr('id');
		//console.log(thisPoly);
		highlightMarker(geojsonLayer,thisPoly);
	})
	.mouseout(function(){
		$(this).toggleClass('highlight');
		var thisPoly;
		highlightMarker(geojsonLayer,thisPoly);

	})
});
