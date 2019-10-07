import * as d3 from 'd3';
import * as THREE from 'three';
import * as topojson from 'topojson-client';
import { createMapTexture } from './helpers/canvasSetup';
import { scene, camera, renderer, controls } from './helpers/sceneSetup';
import { setEvents } from './helpers/eventSetup';
import { convertToXYZ, getEventCenter, geodecoder } from './helpers/worldEvents';
import { getTween, memoize } from './helpers/generalSetup';
import { displayOne, countriesData } from './graphs/one';
import { displayTwo } from './graphs/two';
import { displayThree } from './graphs/three';

export const randomData = {};
d3.json('../Misc/countriesOfTheWorld.json').then((countryData) => {

  countryData.forEach(country => {
    randomData[country.Country] = country;
  })

  randomData['Bahamas'] = randomData['Bahamas, The'];
  randomData['Bosnia and Herz.'] = randomData['Bosnia & Herzegovina'];
  randomData["Côte d'Ivoire"] = randomData["Cote d'Ivoire"];
  randomData['Dem. Rep. Congo'] = randomData["Congo, Dem. Rep."];
  randomData['Congo'] = randomData["Congo, Repub. of the"];
  randomData['N. Cyprus'] = randomData['Cyprus'];
  randomData['Czech Rep.'] = randomData['Czech Republic'];
  randomData['Dominican Rep.'] = randomData['Dominican Republic'];
  randomData["Eq. Guinea"] = randomData['Equatorial Guinea']
  randomData['Korea'] = randomData['Korea, North'];
  randomData['Lao PDR'] = randomData['Laos'];
  randomData['Dem. Rep. Korea'] = randomData["Korea, North"];
  randomData['W. Sahara'] = randomData["Western Sahara"];
  randomData["Solomon Islands"] = randomData['Solomon Is.'];
  randomData['Timor-Leste'] = randomData["East Timor"];
  randomData["Trinidad and Tobago"] = randomData['Trinidad & Tobago'];

});


/* ---------------------------  */

// Load total mapping, should scale based on screen size
d3.json('../Misc/worldData.json').then((data) => {

  let currentCountry, overlay;

  const segments = 500;
  const globeSize = 100;

  // GeoJSON conversion from countries data in topology 'data'
  const countries = topojson.feature(data, data.objects.countries);
  const geo = geodecoder(countries);

  const textureCache = memoize( function(countryID, color) {
    let country = geo.find(countryID);
    return createMapTexture(country, color);
  });


  // Base globe with blue "water"
  let blueMaterial = new THREE.MeshPhongMaterial({ color: '#000', transparent: true });
  let sphere = new THREE.SphereGeometry(globeSize, segments, segments);
  let baseGlobe = new THREE.Mesh(sphere, blueMaterial);
  baseGlobe.rotation.y = Math.PI;
  baseGlobe.addEventListener('click', onGlobeClick);
  baseGlobe.addEventListener('mousemove', onGlobeMousemove);

  // add base map layer with all countries
  let worldTexture = createMapTexture(countries, '#fff');
  let mapMaterial = new THREE.MeshPhongMaterial({ map: worldTexture, transparent: true });
  let baseMap = new THREE.Mesh(new THREE.SphereGeometry(globeSize, segments, segments), mapMaterial);
  baseMap.rotation.y = Math.PI;

  // Outline Mesh on the globe, scalar represents thickness of border
  var outlineMaterial = new THREE.MeshBasicMaterial({ color: '#fff', side: THREE.BackSide });
  var outlineMesh = new THREE.Mesh(sphere, outlineMaterial);
  outlineMesh.scale.multiplyScalar(1.01);

  // create a container node and add the two meshes
  let root = new THREE.Object3D();
  root.scale.set(2.5, 2.5, 2.5);
  root.rotation.y = 0.02;
  root.add(baseGlobe);
  root.add(baseMap);
  root.add(outlineMesh);
  scene.add(root);


  function onGlobeClick(event) {
    console.log(currentCountry);

    displayOne(countriesData[currentCountry]);
    displayTwo(currentCountry);
    displayThree(currentCountry);
    // console.log(controls.object.position);
    // console.log(controls.object.quaternion);
    // console.log(controls.object.rotation);

    // Get pointc, convert to latitude/longitude
    let latlng = getEventCenter.call(this, event);

    let country = geo.search(latlng[0], latlng[1]);
    if (country) {
      controls.enabled = false;
      const XYZLatLng = convertToXYZ(latlng);
  
      let initial = {x: camera.position.x, y: camera.position.y, z: camera.position.z};
      let end = {x: XYZLatLng.x * 10, y: XYZLatLng.y * 10, z: XYZLatLng.z * 10};  
  
      let interpol = d3.interpolateObject(initial, end);
      const duration = 750;
      let timer = d3.timer((t) => {
        const newPos = interpol(t / duration);
        camera.position.x = newPos.x;
        camera.position.y = newPos.y;
        camera.position.z = newPos.z;
        if (t >= duration) {
          controls.enabled = true;
          timer.stop();
          // const graphElement = document.getElementsByClassName('canvas')[0];
          // console.log(graphElement);
          // console.log(document.getSelection());
          // console.log(document.getSelection().collapse)
          
          // document.getSelection().collapse(graphElement, 1);
          // baseGlobe.dispatchEvent( new Event('mousemove'));
        }
  
      })
    }

  }

  function onGlobeMousemove(event) {
    let map, material;

    // Get pointc, convert to latitude/longitude
    let latlng = getEventCenter.call(this, event);
    // console.log(latlng);

    // Look for country at that latitude/longitude
    let country = geo.search(latlng[0], latlng[1]);

    if (country !== null && country.code !== currentCountry) {

      // Track the current country displayed
      currentCountry = country.code;

      // Update the html
      d3.select("#msg").html(country.code);

      // Overlay the selected country
      map = textureCache(country.code, '#999');
      material = new THREE.MeshPhongMaterial({ map: map, transparent: true });
      if (!overlay) {
        overlay = new THREE.Mesh(new THREE.SphereGeometry(102, 40, 40), material);
        overlay.rotation.y = Math.PI;
        root.add(overlay);
      } else {
        overlay.material = material;
      }
    }
  }

  setEvents(camera, [baseGlobe], 'click', 500);
  setEvents(camera, [baseGlobe], 'mousemove', 2);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

//     let ignoredNames = {};
//     ignoredNames['Bosnia and Herzegovina'] = 'found';
//     ignoredNames['Central African Republic'] = 'found';
//     ignoredNames['Congo (Kinshasa)'] = 'found';
//     ignoredNames['Congo (Brazzaville)'] = 'found';
//     ignoredNames['Czech Republic'] = 'found';
//     ignoredNames['Northern Cyprus'] = 'found';
//     ignoredNames['South Korea'] = 'found';
//     ignoredNames['Laos'] = 'found';
//     ignoredNames['Palestinian Territories'] = 'found';
//     ignoredNames['United States'] = 'found';
//     ignoredNames['South Sudan'] = 'found';
//     ignoredNames['Dominican Republic'] = 'found';
//     ignoredNames['Ivory Coast'] = 'found';

//     //Angola --> No Data
//     //Antartica --> No Data
//     //Fr. S. Antartic Lands --> No Data
//     //Bahamas --> No data
//     //Belize --> No data
//     //Brunei --> No data
//     //Cuba --> No data
//     //Eritrea --> No Data
//     //Fiji --> No data
//     //Falkland Island --> No data
//     //Guinea-Bissau --> No Data
//     //Eq. Guinea --> No data
//     //Greenland --> No data
//     //Guyana --> No Data
//     //New Caledonia --> No data
//     //Oman --> No data
//     //Papua New Guinea --> No data
//     //Dem. Rep. Korea. --> No data
//     //W. Sahara --> No Data
//     //Sudan --> No Data
//     //Solomon Is. --> No Data
//     //Somaliland -> No Data
//     //Suriname --> No Data
//     //Timor-Leste --> No Data
//     //Vanuatu --> No Data