import * as d3 from 'd3';

const dataKeys = {
  xName: 'Country (region)',
  yNames:
    [
      'Corruption', 'Country (region)', 'Freedom', 'Generosity',
      'Health life expectancy', 'Ladder', 'Log of GDP per capita',
      'Negative affect', 'Positive affect', 'SD of Ladder', 'Social support'
    ],
}

const one = document.getElementById('one');

const totalGraphWidth = one.clientWidth;
const totalGraphHeight = one.clientHeight;
// create margins and dimensions
const margin = { top: 20, right: 20, bottom: 100, left: 5 };
const graphWidth = totalGraphWidth - margin.left - margin.right;
const graphHeight = totalGraphHeight - margin.top - margin.bottom;

const svg = d3.select('#one')
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
  .ticks(3)
  .tickFormat(d => d + ' Rank')

xAxisGroup.selectAll('text')
  .attr('transform', `rotate(-40)`)
  .attr('text-anchor', 'start')
  .attr('fill', 'white')
  .attr('color', 'white')

export const displayOne = (country) => {
  const data = Object.assign({}, country);
  const countryName = data['Country (region)'];
  delete data['Country (region)'];

  const barsKeys = Object.keys(data);
  const barsValues = Object.values(data);

  const bars = []
  barsKeys.forEach((key, idx) => {
    bars[idx] = { name: barsKeys[idx], value: barsValues[idx] }
  });


  // 156 total countries are evaluated, so the maximum is the lowest rated country
  y.domain([0, 156]);

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
      if (d.name == 'Negative affect' || d.name == 'Corruption') {
        return y(d.value);
      }
      return y(156 - d.value)
    })
    .attr('height', d => {
      if (d.name == 'Negative affect' || d.name == 'Corruption') {
        return graphHeight - y(d.value);
      }
      return graphHeight - y(156 - d.value)
    });

  xAxisGroup.call(xAxis);
  yAxisGroup.call(yAxis);

  xAxisGroup.selectAll('text')
    .attr('transform', `rotate(-40)`)
    .attr('text-anchor', 'end')
    .attr('fill', 'white')

  title.text(`${countryName}`)
  d3.selectAll('text').attr('fill', 'white')
  d3.selectAll('text').style('fill', 'white')
}

export let countriesData = {};


d3.json('../Misc/2019.json').then((data) => {
  data.countries.forEach(country => {
    countriesData[country['Country (region)']] = country;
  });

  // Countries that are availabled in both sets, but don't have equivalent names:
  // i.e. : Palestine and Palestinian Terriories, and Cote d'Ivore == Ivory Coast
  // Some regions, like Puerto Rico, can be included in the US, as it is a territory of the US
  countriesData['Bosnia and Herz.'] = countriesData['Bosnia and Herzegovina'];
  countriesData['Central African Rep.'] = countriesData['Central African Republic'];
  countriesData["Côte d'Ivoire"] = countriesData['Ivory Coast'];
  countriesData['Dem. Rep. Congo'] = countriesData['Congo (Kinshasa)'];
  countriesData['Dominican Rep.'] = countriesData['Dominican Republic'];
  countriesData['Congo'] = countriesData['Congo (Brazzaville)'];
  countriesData['Czech Rep.'] = countriesData['Czech Republic'];
  countriesData['N. Cyprus'] = countriesData['Northern Cyprus'];
  countriesData['Korea'] = countriesData['South Korea'];
  countriesData['Lao PDR'] = countriesData['Laos'];
  countriesData['Palestine'] = countriesData['Palestinian Territories'];
  countriesData['Puerto Rico'] = countriesData['United States'];
  countriesData['S. Sudan'] = countriesData['South Sudan'];

  console.log(countriesData);
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

// TWEENS
const widthTween = (d) => {
  let i = d3.interpolate(0, x.bandwidth());

  return function (t) {
    return i(t);
  }
}