const $ = require('jquery');
const { ipcRenderer, remote } = require('electron');
// const ol = require('./ol');

$(document).ready(() => {
  const { token } = remote.getGlobal('userData');
  const signOutButton = $('.sign-out');
  const announcer = $('.announcer');

  // Create map
  const map = new ol.Map({
    target: 'map',
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM(),
      }),
    ],
    view: new ol.View({
      // Berlin co-ordinats
      center: ol.proj.fromLonLat([13.3888599, 52.5170365]),
      zoom: 11,
    })
  });

  // Show each disabled person's username on click
  map.on('click', (event) => {
    map.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
      const featureInfo = feature.getProperties();
      announcer.fadeIn(200, () => {
        announcer.html(`Clicked on user with username ${featureInfo.username}`);
        setTimeout(() => {
          announcer.fadeOut(200);
        }, 1000);
      });
    });
  });

  const vectorSource = new ol.source.Vector({
    features: [],
  });
  const markerVectorLayer = new ol.layer.Vector({
    source: vectorSource,
  });
  map.addLayer(markerVectorLayer);

  $.ajax({
    type: 'GET',
    url: `http://localhost:3005/api/additional-infos`,
    success(res) {
      res.users.forEach((user) => {
        const marker = new ol.Feature({
          geometry: new ol.geom.Point(
            ol.proj.fromLonLat([user.geolocation.lon, user.geolocation.lat])
          ),
        });
        marker.setStyle(new ol.style.Style({
          image: new ol.style.Icon({
            crossOrigin: 'anonymous',
            src: 'assets/marker.png',
            color: '#FF0000',
          })
        }));
        marker.setProperties({
          username: user.username,
        });
        vectorSource.addFeature(marker);
      });
    },
    accepts: 'application/hal+json',
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });

  signOutButton.on('click', () => {
    ipcRenderer.send('setUserData', null);
    window.location = 'index.html';
  });
});