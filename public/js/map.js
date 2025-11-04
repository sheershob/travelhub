// A. Initialize the Map
const map = L.map('map').setView([28.5937, 76.9629], 13);
// The coordinates [51.505, -0.09] is the initial center point (London) and zoom level is 13

// B. Add a Tile Layer (The actual map images)
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {  // Satellite Map
// L.tileLayer('https://tile.opentopomap.org/{z}/{x}/{y}.png', {       // Terrain Map
// L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {      // Standard OpenStreetMap
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// C. Add a Marker
const marker = L.marker([28.5937, 76.9629]).addTo(map);
marker.bindPopup("<b>Hello!</b><br>I'm a location marker.").openPopup();
// Scale Bar
L.control.scale().addTo(map);
// You can also change the view to center on the marker
// map.setView(marker.getLatLng(), 15);