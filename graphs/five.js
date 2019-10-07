import { randomData } from '../index';

const five = document.getElementById('five');
const totalGraphWidth = five.clientWidth;
const totalGraphHeight = five.clientHeight;

const dims = { height: totalGraphWidth, width: totalGraphWidth, radius: totalGraphWidth / 2.25 };
const cent = { x: (dims.width / 2 + 5), y: (dims.height / 2 + 5) };

const svg = d3.select('#five')
  .append('svg')
  .attr('width', dims.width)
  .attr('height', dims.height + 150)

const graph = svg.append('g')
  .attr('transform', `translate(${cent.x}, ${cent.y})`)

const pie = d3.pie()
  .sort(null)
  .value(d => d.value)

const arcPath = d3.arc()
  .outerRadius(dims.radius)
  .innerRadius(dims.radius / 2);


const color = d3.scaleOrdinal(['#111', '#333', '#555'])

const legendGroup = svg.append('g')
  .attr('transform', `translate(${totalGraphWidth / 1.5}, ${totalGraphWidth * 1.1})`)
  .style('font-family', 'sans-serif')

const legend = d3.legendColor()
  .shape('circle')
  .scale(color)

export const displayFive = (country) => {
  const data = Object.assign({}, randomData[country]);

  const countryName = data['Country'];
  delete data['Country'];
  delete data['Agriculture'];
  delete data['Climate'];
  delete data['Coastline (coast/area ratio)'];
  delete data['GDP ($ per capita)'];
  delete data['Industry'];
  delete data['Literacy (%)'];
  delete data['Infant mortality (per 1000 births)'];
  delete data['Net migration'];
  delete data['Phones (per 1000)'];
  delete data['Pop. Density (per sq. mi.)'];
  delete data['Population'];
  delete data['Region'];
  delete data['Service'];
  delete data['Area (sq. mi.)'];
  delete data['Birthrate'];
  delete data['Deathrate'];

  const pieData = [];
  const pieKeys = Object.keys(data);

  pieKeys.forEach((name) => {
    pieData.push({ name: name, value: data[name] })
  })

  pieData.forEach(d => {
    // console.log(d);
    if (typeof d.value === 'string') {
      const newValue = d.value.replace(/,/g, ".")
      d.value = newValue;
    }
  })

  color.domain(pieKeys);

  legendGroup.call(legend);
  legendGroup.selectAll('text').attr('fill', 'white');

  // join enhanced (pie) data to path elements
  const paths = graph.selectAll('path')
    .data(pie(pieData))

  paths.exit()
    .transition().duration(750)
    .attrTween('d', arcTweenExit)
    .remove();

  paths.attr('d', arcPath)
    .transition().duration(750)
    .attrTween('d', arcTweenUpdate)

  paths.enter()
    .append('path')
    .attr('class', 'arc')
    // .attr('d', arcPath)
    .attr('stroke', '#fff')
    .attr('stroke-width', 3)
    .attr('fill', d => color(d.data.name))
    .each(function (d) { this._current = d })
    .transition().duration(750)
    .attrTween('d', arcTweenEnter);
}

const arcTweenEnter = (d) => {
  let interval = d3.interpolate(d.endAngle, d.startAngle);

  return (t) => {
    d.startAngle = interval(t);
    return arcPath(d);
  }
}

const arcTweenExit = (d) => {
  let interval = d3.interpolate(d.startAngle, d.endAngle);

  return (t) => {
    d.startAngle = interval(t);
    return arcPath(d);
  }
}

function arcTweenUpdate(d) {
  // console.log(this._current, d);
  let interval = d3.interpolate(this._current, d);

  this._current = interval(1);

  return function (t) {
    return arcPath(interval(t));
  }
}