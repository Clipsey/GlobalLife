import * as d3 from 'd3';
import { randomData } from '../index';

// export const displaythree = '';

const dataKeys = {
  xName: 'Country (region)',
  yNames:
    [
      'Corruption', 'Country (region)', 'Freedom', 'Generosity',
      'Health life expectancy', 'Ladder', 'Log of GDP per capita',
      'Negative affect', 'Positive affect', 'SD of Ladder', 'Social support'
    ],
}

const three = document.getElementById('three');

const totalGraphWidth = three.clientWidth;
const totalGraphHeight = three.clientHeight;
// create margins and dimensions
const margin = { top: 20, right: 20, bottom: 100, left: 10 };
const graphWidth = totalGraphWidth - margin.left - margin.right;
const graphHeight = totalGraphHeight - margin.top - margin.bottom;

const svg = d3.select('#three')
  .append('svg')
  .attr('width', totalGraphWidth)
  .attr('height', totalGraphHeight)
// .attr('transform', `translate(${(window.innerWidth - totalGraphWidth - 50) / 2})`)


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
  .range([0, graphWidth])
  .paddingInner(0.2)
  .paddingOuter(0.2);

const title = graph.append('text')
  .attr('y', -2)
  .attr('x', graphWidth / 2.5)
  .text('')

const xAxis = d3.axisBottom(x);
const yAxis = d3.axisLeft(y)
// .ticks(3)
// .tickFormat(d => d + ' Rank')

xAxisGroup.selectAll('text')
  .attr('transform', `rotate(-40)`)
  .attr('text-anchor', 'start')
  .attr('fill', 'white')
  .attr('color', 'white')

export const displayThree = (country) => {
  const data = Object.assign({}, randomData[country]);
  const countryName = data['Country'];
  console.log(data);
  // delete data['Country'];
  // delete data['Agriculture'];
  // delete data['Climate'];
  // delete data['Coastline (coast/area ratio)'];
  // delete data['Crops (%)'];
  // delete data['GDP ($ per capita)'];
  // delete data['Industry'];
  // delete data['Literacy (%)'];
  // delete data['Infant mortality (per 1000 births)'];
  // delete data['Net migration'];
  // delete data['Other (%)'];
  // delete data['Phones (per 1000)'];
  // delete data['Pop. Density (per sq. mi.)'];
  // delete data['Population'];
  // delete data['Region'];
  // delete data['Service'];
  // delete data['Area (sq. mi.)'];
  // delete data['Arable (%)'];

  return;

  // console.log(data);
  // return;
  const barsKeys = Object.keys(data);
  const barsValues = Object.values(data);

  const bars = []
  barsKeys.forEach((key, idx) => {
    bars[idx] = { name: barsKeys[idx], value: barsValues[idx] }
  });


  // 156 total countries are evaluated, so the maximum is the lowest rated country
  y.domain([0, 52]);

  // Number of categories
  x.domain(barsKeys);

  // Tie data to the rects available
  const rects = graph.selectAll('rect').data(bars);
  rects.exit().remove();

  rects
    .attr('width', x.bandwidth)
    .attr('fill', 'white')
    .attr('x', d => x(d.name))
  // .transition().duration(1000)
  //   .attr('y', d => y(d.value))
  //   .attr('height', d => graphHeight - y(d.value));

  // return;
  rects.enter()
    .append("rect")
    .attr("width", x.bandwidth)
    .attr("height", 0)
    .attr("fill", "white")
    .attr('x', d => x(d.name))
    .attr('y', graphHeight)
    .merge(rects) // Everything called below merge affects both entered and currently existing elements
    .transition().duration(1500)
    .attr('y', d => {
      if (typeof d.value === 'string') {
        const newValue = d.value.replace(/,/g, ".")
        return y(newValue);
      }
      return y(d.value);
    })
    .attr('height', d => {
      if (typeof d.value === 'string') {
        const newValue = d.value.replace(/,/g, ".")
        return graphHeight - y(newValue);
      }
      return graphHeight - y(d.value);
    });

  xAxisGroup.call(xAxis);
  // yAxisGroup.call(yAxis);

  xAxisGroup.selectAll('text')
    .attr('transform', `rotate(-40)`)
    .attr('text-anchor', 'end')
    .attr('fill', 'white')

  title.text(`${countryName}`)
  d3.selectAll('text').attr('fill', 'white')
  d3.selectAll('text').style('fill', 'white')
}



// TWEENS
// const widthTween = (d) => {
//   let i = d3.interpolate(0, x.bandwidth());

//   return function (t) {
//     return i(t);
//   }
// }