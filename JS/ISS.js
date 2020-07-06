let ISSMap,ISSMarker;

function renderLatLong(lat,long) {
    let direction;

    lat > 0 ? direction = 'North' : direction = 'South';
    document.getElementById('latitude').innerHTML = `Latitude: ${Math.abs(lat.toFixed(2))}${String.fromCharCode(176)} ${direction}`;

    long > 0 ? direction = 'East' : direction = 'West';
    document.getElementById('longitude').innerHTML = `Longitude: ${Math.abs(long.toFixed(2))}${String.fromCharCode(176)} ${direction}`;
}

//Renders the altitude and speed data
function renderAltitudeSpeed(altitude,speed) {
    
    //If JSON URL is overloaded speed is NaN
    if (!isNaN(speed)) {
        let smallSpeedVal, smallSpeedUnit, bigSpeedVal, bigSpeedUnit, altitudeVal, altitudeUnit;
        if (document.getElementById('Kilometres').checked) {
            smallSpeedVal = Math.round(speed / 3.6);
            smallSpeedUnit = 'm/s';
            bigSpeedVal = speed.toFixed(2);
            bigSpeedUnit = 'kph';
            altitudeVal = altitude.toFixed(2);
            altitudeUnit = 'km';
        } else {
            smallSpeedVal = (speed / 5794).toFixed(3);
            smallSpeedUnit = 'miles/s'
            bigSpeedVal = Math.round(speed / 1.609);
            bigSpeedUnit = 'mph';
            altitudeVal = Math.round(altitude / 1.609);
            altitudeUnit = 'miles';
        }
        document.getElementById('smallSpeed').innerHTML = `${smallSpeedVal} ${smallSpeedUnit}`;
        document.getElementById('bigSpeed').innerHTML = `${bigSpeedVal} ${bigSpeedUnit}`;

        document.getElementById('altitude').innerHTML = `${altitudeVal} ${altitudeUnit}`;
    }

}

//Initialises the map
function initialiseMap(lat,long) {
    ISSMap = L.map(document.getElementById("map")).setView([lat,long], 6);
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoiYW5nb29zdG8iLCJhIjoiY2tjNHR4OG9yMGJhaDJ3bWdvcjRrbTl5dCJ9.V3-ihHt5JgCL-6Q87UxKHg'
    }).addTo(ISSMap);
}

//Initialises the ISS icon
function initialiseMarker(lat,long,map) {
    let ISSIcon = L.icon({
        iconUrl:"./Resources/ISSIcon.png",
        iconSize:[50,50]
    })
    ISSMarker = L.marker([lat,long],{icon:ISSIcon}).addTo(map);
}

//Calls all the render methods
function renderAll() {

    fetch('http://api.open-notify.org/iss-now.json')
    .then(response => response.json())
    .then(data => {
        latitude = parseFloat(data.iss_position.latitude);
        longitude = parseFloat(data.iss_position.longitude);
        renderLatLong(latitude,longitude);
        if (document.getElementById('iconCheck').checked) {
            ISSMap.panTo([latitude,longitude]);
        }
        ISSMarker.setLatLng([latitude,longitude]);
    })

    fetch('https://api.wheretheiss.at/v1/satellites/25544')
        .then(response => response.json())
        .then(data => {
            renderAltitudeSpeed(data.altitude,data.velocity);
        })
        
    let animate = setTimeout(renderAll, 200);
}

function start() {
    fetch('http://api.open-notify.org/iss-now.json')
    .then(response => response.json())
    .then(data => {
        latitude = parseFloat(data.iss_position.latitude);
        longitude = parseFloat(data.iss_position.longitude);
        initialiseMap(latitude,longitude);
        initialiseMarker(latitude,longitude,ISSMap);
    })
    renderAll();
}

start();