import * as THREE from 'three';
import * as topojson from 'topojson-client';
import { createMapTexture } from './helpers/canvasSetup';
import { scene, camera, renderer, controls } from './helpers/sceneSetup';
import { setEvents } from './helpers/eventSetup';
import { convertToXYZ, getEventCenter, geodecoder } from './helpers/worldEvents';
import { getTween, memoize } from './helpers/generalSetup';
import { displayOne, countriesData } from './one';
import { displayThree } from './graphs/three';
import { displayFour } from './graphs/four';
import { displayFive } from './graphs/five';

import worldData from './Misc/worldData.json';
import countriesOfTheWorld from './Misc/countriesOfTheWorld.json';

export const randomData = {};
const loadCountriesOfTheWorldData = (countryData) => {

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

  // Agriculture / Industry / Service
  // Arable (%) / Crops (%) / Other (%)
};
loadCountriesOfTheWorldData(countriesOfTheWorld);

/*

  const countryName = data['Country'];
  delete data['Country'];
  delete data['Agriculture'];
  delete data['Climate'];
  delete data['Coastline (coast/area ratio)'];
  delete data['Crops (%)'];
  delete data['GDP ($ per capita)'];
  delete data['Industry'];
  delete data['Literacy (%)'];
  delete data['Infant mortality (per 1000 births)'];
  delete data['Net migration'];
  delete data['Other (%)'];
  delete data['Phones (per 1000)'];
  delete data['Pop. Density (per sq. mi.)'];
  delete data['Population'];
  delete data['Region'];
  delete data['Service'];
  delete data['Area (sq. mi.)'];
  delete data['Arable (%)'];
  delete data['Birthrate'];
  delete data['Deathrate'];

*/


/* ---------------------------  */

// Load total mapping, should scale based on screen size
const loadWorldData = (data) => {

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


  // Base globe with black "water"
  let oceanMaterial = new THREE.MeshPhongMaterial({ color: '#000', transparent: true });
  let sphere = new THREE.SphereGeometry(globeSize, segments, segments);
  let baseGlobe = new THREE.Mesh(sphere, oceanMaterial);
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

  let currentOverlay = null;


  function onGlobeClick(event) {
    console.log(currentCountry);

    const countryText = document.getElementById('country');
    countryText.innerHTML = currentCountry;


    displayOne(countriesData[currentCountry]);
    displayThree(currentCountry);
    displayFour(currentCountry);
    displayFive(currentCountry);
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
      currentOverlay = overlay;
    } else {
      // if (currentOverlay && country === null) {
      //   console.log('remove');
      //   // console.log(currentCountry, country.code);
      //   // currentCountry = null;
      //   // root.remove(currentOverlay);
      //   currentOverlay.material.map = null;
      //   currentOverlay.material.needsUpdate = true;
      // }

      // // if (!overlay) {
      // //   overlay = new THREE.Mesh(new THREE.SphereGeometry(102, 40, 40), undefined);
      // //   overlay.rotation.y = Math.PI;
      // //   root.add(overlay);
      // // } else {
      // //   overlay.material = material;
      // // }
    }
  }

  setEvents(camera, [baseGlobe], 'click', 500);
  setEvents(camera, [baseGlobe], 'mousemove', 2);
};
loadWorldData(worldData);

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();