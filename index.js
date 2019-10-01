const svg = d3.select('.canvas')
  .append('svg')
  .attr('width', 600)
  .attr('height', 600)

// create margions and dimensions
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

const xAxis = d3.axisBottom(x);
const yAxis = d3.axisLeft(y)
  .ticks(3)
  .tickFormat(d => d + ' orders')

xAxisGroup.selectAll('text')
  .attr('transform', `rotate(-40)`)
  .attr('text-anchor', 'end')
  .attr('fill', 'orange')

const t = d3.transition().duration(500);

// Update method to change graph, and rect parameters based on incoming data
const update = (data) => {

  // Updating scale domain
  y.domain([0, d3.max(data, d => d.orders)]);
  x.domain(data.map(item => item.name));

  // Join the data to the rects
  const rects = graph.selectAll('rect').data(data);

  // Remove exit selection
  rects.exit().remove();


  // Define the attributes of each bar on the bar graph 
  // Current Shapes in DOM and new DOM Elements
  rects
    .attr('width', x.bandwidth)
    .attr('fill', 'orange')
    .attr('x', d => x(d.name))
    // .transition(t)
    //   .attr('height', d => graphHeight - y(d.orders))
    //   .attr('y', d => y(d.orders))

  rects.enter()
    .append("rect")
    // .attr("width", 0)
    .attr("height", 0)
    .attr("fill", "orange")
    .attr("x", d => x(d.name))
    .attr('y', graphHeight)
    .merge(rects) // Everything called below merge affects both entered and currently existing elements
    .transition(t)
      .attrTween('width', widthTween)
      .attr('y', d => y(d.orders))
      .attr('height', d => graphHeight - y(d.orders));


    //d => y(d.orders)
    // d => graphHeight - y(d.orders)

  // Call axes
  xAxisGroup.call(xAxis);
  yAxisGroup.call(yAxis);
};

let data = [];

// Data from firebase -- Continously
db.collection('dishes').onSnapshot( res => {

  res.docChanges().forEach( change => {
    const doc = { ...change.doc.data(), id: change.doc.id };

    switch(change.type) {
      case 'added':
        data.push(doc);
        break;
      case 'modified':
        const index = data.findIndex(item => item.id == doc.id);
        data[index] = doc;
        break;
      case 'removed': 
        data = data.filter(item => item.id !== doc.id);
        break;
      default:
        break;
    }
  })

  update(data);
})

// TWEENS
const widthTween = (d) => {
  let i = d3.interpolate(0, x.bandwidth());

  return function(t) {
    return i(t);
  }
}


// Data from firebase
// db.collection('dishes').get().then(res => {
//   let data = [];
//   res.docs.forEach(doc => {
//     data.push(doc.data());
//   });

//   // d3.interval(() => {
//   //   data[0].orders += 50;
//   //   update(data);
//   // }, 1000);

//   update(data);

// });



// const update = (data) => {
//   y.domain([0, d3.max(data, d => d.orders)]);

//   const rects = graph.selectAll('rect').data(data);

//   rects.exit().remove();

//   rects.attr(...etc);

//   rects.enter().append('rect').attr(...etc);
// }

// Data from json
// d3.json('menu.json').then(data => {
//   // const min = d3.min(data, d => d.orders);
//   // const max = d3.max(data, d => d.orders);
//   // const extent = d3.extent(data, d => d.orders);

//   const y = d3.scaleLinear()
//     .domain([0, d3.max(data, d => d.orders)])
//     .range([graphHeight, 0])

//   const x = d3.scaleBand()
//     .domain(data.map(item => item.name))
//     .range([0, 500])
//     .paddingInner(0.2)
//     .paddingOuter(0.2);


//   // create and draw the rectangles
//   const rects = graph.selectAll('rect')
//     .data(data)

//   rects.attr('width', x.bandwidth)
//     .attr('height', d => graphHeight - y(d.orders))
//     .attr('fill', 'orange')
//     .attr('x', d => x(d.name))
//     .attr('y', d => y(d.orders))

//   rects.enter()
//     .append("rect")
//     .attr("width", x.bandwidth)
//     .attr("height", d => graphHeight - y(d.orders))
//     .attr("fill", "orange")
//     .attr("x", d => x(d.name))
//     .attr('y', d => y(d.orders))



//   // create and call the axes
//   const xAxis = d3.axisBottom(x);
//   const yAxis = d3.axisLeft(y)
//     .ticks(3)
//     .tickFormat(d => d + ' orders')

//   xAxisGroup.call(xAxis);
//   yAxisGroup.call(yAxis);

//   xAxisGroup.selectAll('text')
//     .attr('transform', `rotate(-40)`)
//     .attr('text-anchor', 'end')
//     .attr('fill', 'orange')
// })

// ======================================= //

// d3.json('planets.json').then(data => {
//   const circs = svg.selectAll('circle')
//     .data(data);

//   // add attrs to circs already in DOM
//   circs
//     .attr('cy', 200)
//     .attr('cx', d => d.distance)
//     .attr('r', d => d.radius)
//     .attr('fill', d => d.fill);

//   circs.enter()
//       .append("circle")
//         .attr('cy', 200)
//         .attr("cx", d => d.distance)
//         .attr("r", d => d.radius)
//         .attr("fill", d => d.fill);
// })


// const data = [
//   {width: 200, height: 100, fill: 'purple'},
//   {width: 100, height: 60, fill: 'pink'},
//   {width: 50, height: 30, fill: 'red'},
// ]

// const svg = d3.select('svg');

// const rects = svg.selectAll('rect')
//   .data(data)
//   .attr('width', (d, i, n) => d.width)
//   .attr('height', (d) => d.height)
//   .attr('fill', (d) => d.fill)

// rects.enter()
//   .append("rect")
//     .attr("width", (d, i, n) => d.width)
//     .attr("height", d => d.height)
//     .attr("fill", d => d.fill);


/* -=----------------------------------------=-*/


// const canvas = d3.select('.canvas');

// const svg = canvas.append('svg')
//   .attr('height', 600)
//   .attr('width', 600);

// const group = svg.append('g')
//   .attr('transform', 'translate(0, 100)');

// // Append shapes to svg container
// group.append('rect')
//   .attr('width', 200)
//   .attr('height', 100)
//   .attr('fill', 'blue')
//   .attr('x', 20)
//   .attr('y', 20)

// group.append('circle')
//   .attr('r', 50)
//   .attr('cx', 300)
//   .attr('cy', 70)
//   .attr('fill', 'pink');

// group.append('line')
//   .attr('x1', 370)
//   .attr('x2', 400)
//   .attr('y1', 20)
//   .attr('y2', 120)
//   .attr('stroke', 'red');

// svg.append('text')
//   .attr('x', 20)
//   .attr('y', 200)
//   .attr('fill', 'grey')
//   .text('hello ninjas')
//   .style('font-family', 'arial')