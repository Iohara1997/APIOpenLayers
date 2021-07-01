import 'ol/ol.css';
import {Map, View} from 'ol';
import {OSM, Vector as VectorSource} from 'ol/source';
import {fromLonLat} from 'ol/proj';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';
import {Draw, Modify, Snap} from 'ol/interaction';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import Overlay from 'ol/Overlay';
import XYZ from 'ol/source/XYZ';
import {toLonLat} from 'ol/proj';
import {toStringHDMS} from 'ol/coordinate';

const saoPaulo = [-46.84, -23.36];
const saoPauloPoint = fromLonLat(saoPaulo);

var raster = new TileLayer({
    source: new OSM(),
});

/**
 * Elements that make up the popup.
 */
var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');

/**
 * Create an overlay to anchor the popup to the map.
 */
var overlay = new Overlay({
  element: container,
  autoPan: true,
  autoPanAnimation: {
    duration: 250,
  },
});

/**
 * Add a click handler to hide the popup.
 * @return {boolean} Don't follow the href.
 */
closer.onclick = function () {
  overlay.setPosition(undefined);
  closer.blur();
  return false;
};

var source = new VectorSource();
var vector = new VectorLayer({
  source: source,
  style: new Style({
    fill: new Fill({
      color: 'rgba(255, 255, 255, 0.2)',
    }),
    stroke: new Stroke({
      color: '#ffcc33',
      width: 2,
    }),
    image: new CircleStyle({
      radius: 7,
      fill: new Fill({
        color: '#ffcc33',
      }),
    }),
  }),
});

var key = 'A2aXaefziPzDwYHQhY66';
var attributions =
  '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
  '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

var atribute = new TileLayer({
  source: new XYZ({
    attributions: attributions,
    url: 'https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=' + key,
    tileSize: 512,
  }),
})

const map = new Map({
  layers: [raster, vector, /*atribute*/],
  target: 'map',
  overlays: [overlay],
  view: new View({
    center: saoPauloPoint,
    zoom: 7
  }),
});

var modify = new Modify({source: source});
map.addInteraction(modify)

var draw, snap; // global so we can remove them later
var typeSelect = document.getElementById('type');

function addInteractions() {
  draw = new Draw({
    source: source,
    type: typeSelect.value,
  });
  map.addInteraction(draw);
  snap = new Snap({source: source});
  map.addInteraction(snap);
}

map.on('dblclick', function (evt) {
  var coordinate = evt.coordinate;
  var hdms = toStringHDMS(toLonLat(coordinate));

  content.innerHTML = '<p>Latitude e Longitude:</p><code>' + hdms + '</code>';
  overlay.setPosition(coordinate);
});


/**
 * Handle change event.
 */
typeSelect.onchange = function () {
  map.removeInteraction(draw);
  map.removeInteraction(snap);
  addInteractions();
};


document.addEventListener('contextmenu', function () {
  map.removeInteraction(draw);
  vector.getSource().clear();
  addInteractions();
})

addInteractions();
