//This function returns JSON data from a URL
function getJSONData(url) {
    let HttpReq = new XMLHttpRequest();
    HttpReq.open("GET",url,false);
    HttpReq.send(null);
    return HttpReq.responseText;
}
 
// Parses the JSON data and returns an ISS object
function getLocation() {
    let speedAltitude = JSON.parse(getJSONData('https://api.wheretheiss.at/v1/satellites/25544'));
    //The below link is more reliable for location but does not have other stats
    let locationjson = JSON.parse(getJSONData('http://api.open-notify.org/iss-now.json'));
    return {
        latitude:parseFloat(locationjson.iss_position.latitude),
        longitude:parseFloat(locationjson.iss_position.longitude),
        altitude:Math.round(speedAltitude.altitude),
        speed:Math.round(speedAltitude.velocity)
    }
}
 
//Returns the top left coordinates of an element relative to the page
function getPageCoords(element) {
    const box = element.getBoundingClientRect();
    return {
        top: box.top + window.pageYOffset,
        left: box.left + window.pageXOffset,
        width: box.width,
        height: box.height
    };
}
 
//Renders a vertical and horizontal line with the cross over point being the ISS location
function renderReticle(mapDimensions, xypos) {
    const reticleVertical = document.getElementById('reticleVertical');
    const reticleHorizontal = document.getElementById('reticleHorizontal');
    reticleVertical.style.visibility = 'visible';
    reticleVertical.style.left = `${mapDimensions.left + xypos.xpos}px`;
    reticleVertical.style.top = `${mapDimensions.top}px`;
    reticleVertical.style.height = `${mapDimensions.height}px`;
    reticleHorizontal.style.visibility = 'visible';
    reticleHorizontal.style.left = `${mapDimensions.left}px`;
    reticleHorizontal.style.top = `${mapDimensions.top + xypos.ypos}px`;
    reticleHorizontal.style.width = `${mapDimensions.width}px`;
}
 
//Renders the ISS icon and places it in the correct location
function renderIcon(mapDimensions, xypos) {
    const issRender = document.getElementById('iss');
    issRender.style.visibility = 'visible';
    issRender.style.height = '40px';
    issRender.style.width = '40px';
    issRender.style.left = `${mapDimensions.left + xypos.xpos - (parseInt(issRender.style.width,10)/2)}px`;
    issRender.style.top = `${mapDimensions.top + xypos.ypos - (parseInt(issRender.style.height,10)/2)}px`;
}

//Todo: Render a trail behind the icon to show where it has been
function renderTrail(oldXY, newXY) {
    const canvas = document.getElementById('map');
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(oldXY.xpos, oldXY.ypos);
    ctx.lineTo(newXY.xpos, newXY.ypos);
    ctx.strokeStyle = "red";
    ctx.stroke();
    console.log(`Old x: ${oldXY.xpos}`);
    console.log(`New x: ${newXY.xpos}`);
}

//Renders the latitude, longitude, altitude and speed data
function renderStats(iss) {
    let northSouth;
    iss.latitude>0 ? northSouth = 'North' : northSouth = 'South';
    document.getElementById('latitude').innerHTML = `Latitude: ${Math.abs(iss.latitude.toFixed(2))}${String.fromCharCode(176)} ${northSouth}`;

    let eastWest;
    iss.longitude>0 ? eastWest = 'East' : eastWest = 'West';
    document.getElementById('longitude').innerHTML = `Longitude: ${Math.abs(iss.longitude.toFixed(2))}${String.fromCharCode(176)} ${eastWest}`;

    //If JSON URL is overloaded speed is NaN
    if(!isNaN(iss.speed)) {
        let smallSpeedVal,smallSpeedUnit,bigSpeedVal,bigSpeedUnit,altitudeVal,altitudeUnit;
        if(document.getElementById('Kilometres').checked) {
            smallSpeedVal = Math.round(iss.speed/3.6);
            smallSpeedUnit = 'm/s';
            bigSpeedVal = iss.speed;
            bigSpeedUnit = 'kph';
            altitudeVal = iss.altitude;
            altitudeUnit = 'km';
        } else {
            smallSpeedVal = (iss.speed/5794).toFixed(3);
            smallSpeedUnit = 'miles/s'
            bigSpeedVal = Math.round(iss.speed/1.609);
            bigSpeedUnit = 'mph';
            altitudeVal = Math.round(iss.altitude/1.609);
            altitudeUnit = 'miles';
        }
        document.getElementById('smallSpeed').innerHTML = `${smallSpeedVal} ${smallSpeedUnit}`;
        document.getElementById('bigSpeed').innerHTML = `${bigSpeedVal} ${bigSpeedUnit}`;

        document.getElementById('altitude').innerHTML = `${altitudeVal} ${altitudeUnit}`;
    }
    
}
 
//Calls all the render methods
function renderAll() {
    const issLocation = getLocation();
    renderStats(issLocation);
    const mapDimensions = getPageCoords(document.getElementById('map'));
    const newXY = convertLongAndLat(issLocation,mapDimensions.width,mapDimensions.height);
    if (document.getElementById('iconCheck').checked) {
        renderIcon(mapDimensions,newXY);
    } else {
        document.getElementById('iss').style.visibility = 'hidden';
    }
    if (document.getElementById('reticleCheck').checked) {
        renderReticle(mapDimensions,newXY);
    } else {
        document.getElementById('reticleVertical').style.visibility = 'hidden';
        document.getElementById('reticleHorizontal').style.visibility = 'hidden';
    }
}
 
//Converts longitude and latitude to x and y coordinates
function convertLongAndLat(iss,mapWidth, mapHeight) {
    const x = mapWidth*(180+(iss.longitude))/360;
    const y = mapHeight*(90-iss.latitude)/180;
    return{
        xpos:x,
        ypos:y
    }
}

setInterval(renderAll,500);