import * as d3 from 'd3';
import * as THREE from 'three';
import * as topojson from 'topojson-client';
import { createMapTexture } from './helpers/canvasSetup';
import { scene, camera, renderer } from './helpers/sceneSetup';

const dataKeys = {
  xName: 'Country (region)',
  yNames:
    [
      'Corruption', 'Country (region)', 'Freedom', 'Generosity',
      'Health life expectancy', 'Ladder', 'Log of GDP per capita',
      'Negative affect', 'Positive affect', 'SD of Ladder', 'Social support'
    ],
}

const svg = d3.select('.canvas')
  .append('svg')
  .attr('width', 600)
  .attr('height', 600)

// create margins and dimensions
const margin = { top: 20, right: 20, bottom: 100, left: 100 };
const graphWidth = 600 - margin.left - margin.right;
const graphHeight = 600 - margin.top - margin.bottom;

const graph = svg.append('g')
  .attr('width', graphWidth)
  .attr('height', graphHeight)
  .attr('transform', `translate(${margin.left}, ${margin.top})`)

const xAxisGroup = graph.append('g')
  .attr('transform', `translate(0, ${graphHeight})`)
const yAxisGroup = graph.append('g');

// Scales
const y = d3.scaleLinear()
  .range([graphHeight, 0])

const x = d3.scaleBand()
  .range([0, 500])
  .paddingInner(0.2)
  .paddingOuter(0.2);

const title =  graph.append('text')
  .attr('y', 0)
  .attr('x', 250)
  .text('Test')

const xAxis = d3.axisBottom(x);
const yAxis = d3.axisLeft(y)
  .ticks(3)
  .tickFormat(d => d + ' Rank')

xAxisGroup.selectAll('text')
  .attr('transform', `rotate(-40)`)
  .attr('text-anchor', 'start')
  .attr('fill', 'blue')

const display = (country) => {
  const data = Object.assign({}, country);
  const countryName = data['Country (region)'];
  delete data['Country (region)'];

  const barsKeys = Object.keys(data);
  const barsValues = Object.values(data);

  const bars = []
  barsKeys.forEach((key, idx) => {
    bars[idx] = {name: barsKeys[idx], value: barsValues[idx]}
  });


  // 156 total countries are evaluated, so the maximum is the lowest rated country
  y.domain([0, 156]);

  // Number of categories defines the 
  x.domain(barsKeys);

  // Tie data to the rects available
  const rects = graph.selectAll('rect').data(bars);
  rects.exit().remove();

  rects
    .attr('width', x.bandwidth)
    .attr('fill', 'blue')
    .attr('x', d => x(d.name))
    // .transition().duration(1000)
    //   .attr('y', d => y(d.value))
    //   .attr('height', d => graphHeight - y(d.value));

  // return;
  rects.enter()
    .append("rect")
    .attr("width", x.bandwidth)
    .attr("height", 0)
    .attr("fill", "blue")
    .attr('x', d => x(d.name))
    .attr('y', graphHeight)
    .merge(rects) // Everything called below merge affects both entered and currently existing elements
    .transition().duration(1500)
      .attr('y', d => y(d.value))
      .attr('height', d => graphHeight - y(d.value));

  xAxisGroup.call(xAxis);
  yAxisGroup.call(yAxis);

  xAxisGroup.selectAll('text')
    .attr('transform', `rotate(-40)`)
    .attr('text-anchor', 'end')
    .attr('fill', 'blue')

  title.text(`${countryName}`)
}

let countries = {};


d3.json('../Misc/2019.json').then((data) => {
  console.log(data);
  data.countries.forEach(country => {
    countries[country['Country (region)']] = country;
  })

  const countryNames = Object.keys(countries);

  console.log(countryNames);
  const displayLoop = () => {
    const randomIndex = Math.floor(Math.random() * 156);
    display(countries[countryNames[randomIndex]]);
  }
  displayLoop();

  setInterval(displayLoop, 3000);
});

// Data from firebase -- Continously
// db.collection('countries').onSnapshot( res => {

//   res.docChanges().forEach( change => {
//     const doc = { ...change.doc.data() };

//     switch(change.type) {
//       case 'added':
//         countries[doc['Country (region)']] = doc;
//         break;
//       default:
//         break;
//     }
//   })

//   const countryNames = Object.keys(countries);
//   const displayLoop = () => {
//     const randomIndex = Math.floor(Math.random() * 156);
//     display(countries[countryNames[randomIndex]]);
//   }
//   displayLoop();

//   setInterval(displayLoop, 3000);
// });



// 

// TWEENS
const widthTween = (d) => {
  let i = d3.interpolate(0, x.bandwidth());

  return function(t) {
    return i(t);
  }
}


/* ---------------------------  */

// Load total mapping, should scale based on screen size
d3.json('../Misc/worldData.json').then((data) => {

  // GeoJSON conversion from countries data in topology 'data'
  const countriesTopoToGeo = topojson.feature(data, data.objects.countries);

  // Important: MeshBasicMaterial is not affected by light source -- Water Color
  let waterMaterial = new THREE.MeshBasicMaterial({ color: '#0077be' });
  // Radius, widthSegments, heightSegments
  // Size of Sphere for first parameter
  // How many vertical and horizontal lines are drawn
  let sphere = new THREE.SphereGeometry(200, 100, 100);
  let baseLayer = new THREE.Mesh(sphere, waterMaterial); // A

  // Texture for the countries, defines borders/land
  let mapTexture = createMapTexture(countriesTopoToGeo, '#fff');

  // Transparence is needed here, otherwise the ocean will take the mapTexture color
  let mapMaterial = new THREE.MeshBasicMaterial({ map: mapTexture, transparent: true });  //C
  let mapLayer = new THREE.Mesh(sphere, mapMaterial); //D

  let root = new THREE.Object3D();
  root.add(baseLayer);
  root.add(mapLayer);
  scene.add(root);

  function render() {
    root.rotation.y += 0.005;
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }

  window.render = render;
  render();
});



// d3.json('./Misc/2019.json').then( happyData => {
//   d3.json('worldData.json').then( geoData => {
//     const happy = happyData.countries;
//     const geo = geoData.objects.countries.geometries;

//     const happyMap = {};
//     const geoMap = {};
  
//     happy.forEach( country => {
//       happyMap[country['Country (region)']] = true;
//     });
//     geo.forEach( country => {
//       geoMap[country['id']] = true;
//     });
    

//     const uniqueElements = {
//       'happy': [],
//       'geo': []
//     };

//     const happyNames = Object.keys(happyMap);
//     const geoNames = Object.keys(geoMap);

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


//     happyNames.map(country => {
//       if (!geoMap[country] && ignoredNames[country] != 'found') uniqueElements['happy'].push(country);
//     })
//     geoNames.map(country => {
//       if (!happyMap[country]) uniqueElements['geo'].push(country);
//     })

//     console.log(uniqueElements);

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
    
//     //Bosnia and Herz. --> Bosnia and Herzegovina
//     //Central African Rep. --> Central African Republic
//     //Cote d'Ivoire --> Ivory Coast
//     //Dem Rep. Congo --> Congo (Kinshasa)
//     //Dominican Rep. --> Dominican Republic
//     //Congo --> Congo (Brazzaville)
//     //Czech Rep. --> Czech Republic
//     //N. Cyprus --> Northern Cyprus
//     //Korea --> South Korea
//     //Lao PDR --> Laos
//     //Palestine --> Palestinian Territories
//     //Puerto Rico --> United States
//     //S. Sudan --> South Sudan


//   })
// })