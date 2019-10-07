import * as d3 from 'd3';
import { randomData } from '../index';

const dims = { height: 300, width: 300, radius: 150 };
const cent = { x: (dims.width / 2 + 5), y: (dims.height / 2 + 5) };

const svg = d3.select('#four')
  .append('svg')
  .attr('width', dims.width + 150)
  .attr('height', dims.height + 150)

const graph = svg.append('g')
  .attr('transform', `translate(${cent.x}, ${cent.y})`)

const pie = d3.pie()
  .sort(null)
  .value(d => {
    console.log(d);
    return d.cost
  })

const angles = pie([
  { name: 'rent', cost: 500 },
  { name: 'bills', cost: 300 },
  { name: 'gaming', cost: 200 },
])


console.log(angles);

const arcPath = d3.arc()
  .outerRadius(dims.radius)
  .innerRadius(dims.radius / 2);

console.log(arcPath(angles[0]));


export const displayThree = (country) => {
  const data = Object.assign({}, randomData[country]);
  console.log(data);
  // console.log(randomDa)
  return;
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

}