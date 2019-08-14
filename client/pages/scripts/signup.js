const $ = require('jquery');

$(document).ready(() => {
  // Assing elements to variables not to traverse DOM again
  const backButton = $('.back-button');
  const signUpButton = $('.sign-up-button');
  const fullNameInput = $('#fullname');
  const usernameInput = $('#username');
  const emailInput = $('#email');
  const passwordInput = $('#password');
  const rePasswordInput = $('#repassword');
  const errorElement = $('#sign-up-error');
  const signUpForm = $('#sign-up-form');

  // Marker filled with the feauture when clicked on map
  let marker;

  const selectedGeolocation = {
    lat: 0,
    lon: 0,
  };

  const geolocationIsNotEntered = () => {
    return selectedGeolocation.lat === 0 && selectedGeolocation.lon === 0;
  };

  const printError = (message) => {
    errorElement.html(message);
    window.scrollTo({ top: 0 });
  };

  // Init animation
  $('#sign-up-form input').each((index, element) => {
    setTimeout(() => {
      $(element).fadeIn(100);
    }, index * 100);
  });

  // Create map
  const map = new ol.Map({
    target: 'map',
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM(),
      })
    ],
    view: new ol.View({
      // Berlin co-ordinats
      center: ol.proj.fromLonLat([13.3888599, 52.5170365], 'EPSG:4326'),
      zoom: 11,
      projection: 'EPSG:4326',
    })
  });

  const vectorSource = new ol.source.Vector({
    features: [],
  });

  // Set click event listener for the map to choose place
  map.on('click', (event) => {
    const geolocationFromClick = map.getCoordinateFromPixel(event.pixel);

    selectedGeolocation.lat = geolocationFromClick[1];
    selectedGeolocation.lon = geolocationFromClick[0];

    if (marker) {
      marker.setGeometry(
        new ol.geom.Point(
          ol.proj.fromLonLat(
            [selectedGeolocation.lon, selectedGeolocation.lat],
            'EPSG:4326',
          ),
        ),
      );
    } else {
      marker = new ol.Feature({
        geometry: new ol.geom.Point(
          ol.proj.fromLonLat(
            [selectedGeolocation.lon, selectedGeolocation.lat],
            'EPSG:4326',
          )
        )
      });
      marker.setStyle(
        new ol.style.Style({
          image: new ol.style.Icon({
            crossOrigin: 'anonymous',
            src: 'assets/marker.png',
            color: '#FF0000',
          })
        })
      );
      vectorSource.addFeature(marker);
    }
  });
  const markerVectorLayer = new ol.layer.Vector({
    source: vectorSource,
  });
  map.addLayer(markerVectorLayer);

  backButton.on('click', () => {
    window.location = 'index.html';
  });

  signUpButton.on('click', () => {
    if (passwordInput.val() === '') {
      return printError('You must enter a password.');
    }
    if (rePasswordInput.val() !== passwordInput.val()) {
      return printError('Passwords don\'t match!');
    }
    if (geolocationIsNotEntered()) {
      return printError('Please click to a place on the map.');
    }
    $.ajax({
      type: 'POST',
      url: 'http://localhost:3005/api/identities',
      data: JSON.stringify({
        fullName: fullNameInput.val(),
        username: usernameInput.val(),
        email: emailInput.val(),
        password: passwordInput.val(),
        geolocation: {
          lon: selectedGeolocation.lon,
          lat: selectedGeolocation.lat,
        }
      }),
      success(res) {
        signUpButton.css({ background: '#57D300' });
        signUpButton.html('Success!');
        signUpButton.off('click');
        setTimeout(() => {
          window.location = 'index.html';
        }, 1000);
      },
      error(jqHXR, textStatus, errorThrown) {
        printError(jqHXR.responseJSON.message);
      },
      contentType: 'application/json',
      accepts: 'application/hal+json',
      dataType: 'json'
    });
  });
});
