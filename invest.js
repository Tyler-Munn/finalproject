var map = L.map('map', {center: [41.8756919,-87.619843], zoom: 10});
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '© OpenStreetMap' }).addTo(map);
map.doubleClickZoom.disable();
        
var mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoidHlsZXJtdW5uIiwiYSI6ImNsbzdxeHpjNzA3bGEyc2w0NWsxdmpoOGMifQ.yUw0653YqFN2tg7KbwqPmw';
    
var grayscale   = L.tileLayer(mbUrl, {id: 'mapbox/light-v9', tileSize: 512, zoomOffset: -1, attribution: mbAttr}),
    streets  = L.tileLayer(mbUrl, {id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1, attribution: mbAttr});
    
var baseMaps = {
"Grayscale": grayscale,
"Streets": streets
};

var renewal

$.getJSON("renewal_project.geojson",function(data){
    renewal = L.geoJson(data, {
        onEachFeature: onEachFeatureFunc,
        color: '#BC95E3', weight: 2
    }).addTo(map);
});



$.getJSON("invest_redline.geojson",function(data){
    redline = L.geoJson(data, {
        style: styleFunc,   
    }).addTo(map);
});

$.getJSON("investment.geojson",function(data){
    neighborhoodsLayer = L.geoJson(data, {
        style: styleFunc,
    }).addTo(map);

    var overlayLayer = {
        "Urban Renewal Projects": renewal,
        "All Census Tracts": neighborhoodsLayer,
        "Redlined Census Tracts": redline,
    };
    L.control.layers(baseMaps, overlayLayer).addTo(map);

    map.eachLayer(function (layer) {
        if (layer === renewal) {
            layer.bringToFront();
        }
    });
});

// Set style function that sets fill color property equal to blood lead
function styleFunc(feature) {
    return {
        fillColor: setColorFunc(feature.properties.aggregate),
        fillOpacity: 1,
        weight: 0,
        opacity: 1
    };
}

// Set function for color ramp, you can use a better palette
function setColorFunc(density){
    return density > 21471.88 ? '#02472b' :
        density > 10723.16 ? '#379e54' :
        density > 5985.25 ? '#bce395' :
        density > 0 ? '#ffffe5' :
                        '#BFBCBB';
};

// Now we’ll use the onEachFeature option to add the listeners on our state layers:
function onEachFeatureFunc(feature, layer){
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomFeature
    });
    var customPopupClass = 'custom-popup';

    // Bind popup with custom class
    layer.bindPopup('Project Name: ' + feature.properties.project, {
        className: customPopupClass
    });
}

function highlightFeature(e){
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });
    // for different web browsers
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
}

// Define what happens on mouseout:
function resetHighlight(e) {
    renewal.resetStyle(e.target);
}

// As an additional touch, let’s define a click listener that zooms to the state: 
function zoomFeature(e){
    console.log(e.target.getBounds());
    map.fitBounds(e.target.getBounds().pad(1.5));
}

// Add Scale Bar to Map
L.control.scale({position: 'bottomleft'}).addTo(map);

// Create Leaflet Control Object for Legend
var legend = L.control({position: 'bottomright'});

// Function that runs when legend is added to map
legend.onAdd = function (map) {
    // Create Div Element and Populate it with HTML
    var div = L.DomUtil.create('div', 'legend');            
    div.innerHTML += '<b>Annual Aggregate Investment</b><br />';
    div.innerHTML += '<b>per Capita</b><br />';
    div.innerHTML += 'by Census Tract<br />';
    div.innerHTML += '<br>';
    div.innerHTML += '<i style="background: #02472b"></i><p>$21,471.89-$402,056.13</p>';
    div.innerHTML += '<i style="background: #379e54"></i><p>$10,723.17-$21,471.88</p>';
    div.innerHTML += '<i style="background: #bce395"></i><p>$5,985.26-$10,723.16</p>';
    div.innerHTML += '<i style="background: #ffffe5"></i><p>$237.05-$5,985.25</p>';
    div.innerHTML += '<hr>';
    div.innerHTML += '<i style="background: #BFBCBB"></i><p>No Data</p>';
    
    // Return the Legend div containing the HTML content
    return div;
};

// Add Legend to Map
legend.addTo(map);