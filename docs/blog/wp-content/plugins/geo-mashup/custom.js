/**
 * GeoMashup customization example
 * 
 * The filename must be custom.js for customizations to take effect.
 * You can edit the example and delete customizations you don't want.
 * If you know javascript, you can add your own customizations.
 *
 * The old custom-marker.js from pre 1.0 versions of Geo Mashup is no longer used.
 */

var destIndex  = 0;

// Define the route
var routeA = [
"Durham, NC",
"Washington, DC",
"Baltimore, MD",
"Philadelphia, PA",
"New York, NY",
"Boston, MA",
"Phippsburg, ME, United States of America",
"Canada, Montreal",
"NY, Glens Falls",
"Canada, Toronto",
"MI, Detroit",
"IL, Chicago",
"MN, Minneapolis",
"SD, Mount Rushmore",
"WY, Silver Gate",         // AKA Yellowstone
"Canada, Vancouver"
];
/* we have to break this up into 2 routes because Google can only handle about 25 in a list. */
var routeB = [
"WA, Seattle",
"CA, Napa",
"CA, San Francisco",
"CA, San Diego",
"CA, Los Angeles",
"AZ, Cameron",            // AKA Grand Canyon
"NM, Roswell",
"CO, Boulder",
"CO, Denver",
"TX, Dallas",
"TX, Austin",
"AR, Fayetteville",
"LA, New Orleans",
"Tampa, FL",
"FL, Miami Beach",
"Marathon, FL",
"FL, Stuart",
"SC, Hilton Head Island",
"NC, Durham"
];

var myMashup;

function showRoute(mashup) {
	directionsA = new GDirections(mashup.map, null);
	directionsA.loadFromWaypoints(routeA);

	directionsB = new GDirections(mashup.map, null);
	directionsB.loadFromWaypoints(routeB);
}

function customizeGeoMashup(mashup) {
	myMashup = mashup;

	// Use a different marker icon
	mashup.marker_icon = new GIcon();
	mashup.marker_icon.image = "http://labs.google.com/ridefinder/images/mm_20_red.png";
	mashup.marker_icon.shadow = "http://labs.google.com/ridefinder/images/mm_20_shadow.png";
	mashup.marker_icon.iconSize = new GSize(12, 20);
	mashup.marker_icon.shadowSize = new GSize(22, 20);
	mashup.marker_icon.iconAnchor = new GPoint(6, 20);
	mashup.marker_icon.infoWindowAnchor = new GPoint(5, 1);
	
	// Add van location
	setTimeout("getVanLocation(myMashup);", 2000);

	// Add the MASHUP object to the show route button
	//var btnShowRoute = document.getElementById("show_route_button");
	//btnShowRoute.Attributes.Add("OnClick", "showRoute(mashup);");
}

function placeVanOnMap(mashup, ajax_req) {
	try {
		if (ajax_req.status == 200) {
			response = ajax_req.responseText;
			delim = response.indexOf("\n");
			vanLat = response.slice(0, delim);
			vanLon = response.slice(delim + 1);
			
			if (!isNumeric(vanLat) || !isNumeric(vanLon)) {
				return;
			} 
		} else {
			return;
		}
	}
	catch(err) {
		return;
	}

	// Icon variables
	var baseIcon = new GIcon();
	baseIcon.iconSize = new GSize(64, 64);
	baseIcon.iconAnchor = new GPoint(5, 58);
	baseIcon.infoWindowAnchor = new GPoint(32, 32);

	var vanIcon = new GIcon(baseIcon);
	vanIcon.image = "http://www.roadtrip20.com/blog/wp-includes/images/van_icon_64x64-north.png";

	// The van's point
	var vanPoint = new GLatLng(vanLat, vanLon);

	// Recenter the map on the van
	mashup.map.setCenter(vanPoint, 5);

	// Set up our GMarkerOptions object
	markerOptions = { icon:vanIcon };
	var marker = new GMarker(vanPoint, markerOptions);

	GEvent.addListener(marker, "click", function() {
	  marker.openInfoWindowHtml("Our van is currently at:<br/><b>Latitude:</b> "+vanLat+"<br/>"+
	  	"<b>Longitude:</b> "+vanLon);
	});
	
	mashup.map.addOverlay(marker);

	centerMap(mashup, vanPoint);
}

function getVanLocation(mashup) {
	var ajax_req;
	myHost = location.host;
	var url = noCache("http://"+myHost+"/blog/wp-includes/gps/coord/gps_coord.txt");

	// branch for native XMLHttpRequest object
	if (window.XMLHttpRequest) {
		ajax_req = new XMLHttpRequest();
		ajax_req.onreadystatechange = function() { placeVanOnMap(mashup, ajax_req); };
		ajax_req.open("GET", url, true);
		ajax_req.send(null);
	} else if (window.ActiveXObject) {
		// branch for IE/Windows ActiveX version
		ajax_req = new ActiveXObject("Microsoft.XMLHTTP");
		if (ajax_req) {
			ajax_req.onreadystatechange = function() { placeVanOnMap(mashup, ajax_req); };
			ajax_req.open("GET", url, true);
			ajax_req.send();
		}
	}
}

function centerMap(mashup, vanPoint) {
	// Recenter the map on the van
	mashup.map.setCenter(vanPoint, 5);
}

// Helper function to find numbers
function isNumeric(sText) {
	var ValidChars = "0123456789.-+";
	var IsNumber=true;
	var Char;

	for (i = 0; i < sText.length && IsNumber == true; i++) { 
		Char = sText.charAt(i); 
		if (ValidChars.indexOf(Char) == -1) {
			IsNumber = false;
		}
	}
	return IsNumber;
}

/* I was having a problem with the Van's position not being read "live", rather it was always
 * pulling a cached copy. I found this function which hopefully will help.
 * Thanks to this site:
 * http://webreflection.blogspot.com/2006/12/stupid-ajax-cache-problem-solution.html
 */
function noCache(uri) {
	return uri.concat(/\?/.test(uri)?"&":"?","noCache=",(new Date).getTime(),".",Math.random()*1234567)
};
