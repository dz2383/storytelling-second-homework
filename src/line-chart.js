import * as d3 from 'd3'

var margin = { top: 40, left: 50, right: 50, bottom: 40 }

var height = 300 - margin.top - margin.bottom

var width = 570 - margin.left - margin.right

var svg = d3
  .select('#line-chart')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

var parseTime = d3.timeParse('%Y-%m-%d')

var xPositionScale = d3.scaleLinear().range([0, width])
var yPositionScale = d3
  .scaleLinear()
  .domain([90, 125])
  .range([height, 0])

var line = d3
  .line()
  .x(function(d) {
    return xPositionScale(d.datetime)
  })
  .y(function(d) {
    return yPositionScale(d.Close)
  })
  .curve(d3.curveMonotoneX)

d3.csv(require('./AAPL.csv'))
  .then(ready)
  .catch(err => {
    console.log('Failed with', err)
  })

function ready(datapoints) {
  datapoints.forEach(function(d) {
    d.datetime = parseTime(d.Date)
  })
  const dates = datapoints.map(function(d) {
    return d.datetime
  })
  console.log(datapoints)

  const dateMax = d3.max(dates)
  const dateMin = d3.min(dates)

  xPositionScale.domain([dateMin, dateMax])

  // line
  svg
    .append('path')
    .datum(datapoints)
    .attr('d', line)
    .attr('stroke', '#4cc1fc')
    .attr('stroke-width', 2)
    .attr('fill', 'none')
    // push line  behind dots
    .lower()
  // circles
  svg
    .selectAll('circle')
    .data(datapoints)
    .enter()
    .append('circle')
    .attr('fill', '#4cc1fc')
    .attr('r', 3)
    .attr('cx', d => {
      return xPositionScale(d.datetime)
    })
    .attr('cy', d => {
      return yPositionScale(d.Close)
    })
    .on('mouseover', function(d) {
      // Make the circle bigger
      d3.select(this)
        .transition()
        .duration(200)
        .attr('r', 10)
      d3.select('#date').text(d.Date)
      d3.select('#open').text(d.Open)
      d3.select('#high').text(d.High)
      d3.select('#low').text(d.Low)
      d3.select('#close').text(d.Close)
      d3.select('#adj').text(d['Adj Close'])
      d3.select('#volume').text(d.Volume)

      // Be sure you're using .style
      // to change CSS rules
      d3.select('#info').style('display', 'block')
    })
    .on('mouseout', function(d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr('r', 3)
      // this make the info gone after mouse move out
      // d3.select('#info').style('display', 'none')
    })

  svg
    .append('text')
    .text('AAPL stock price')
    .attr('x', width / 2)
    .attr('y', 0)
    .attr('text-anchor', 'middle')
    .attr('font-size', 20)
    .attr('font-weight', 'bold')

  var xAxis = d3
    .axisBottom(xPositionScale)
    .tickFormat(d3.timeFormat('%b %Y'))
    .ticks(5)
  svg
    .append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)

  var yAxis = d3
    .axisLeft(yPositionScale)
    .tickValues([100, 110, 120])
    .tickSize(-width)
  svg
    .append('g')
    .attr('class', 'axis y-axis')
    .call(yAxis)

  svg.selectAll('.y-axis path').remove()
  svg
    .selectAll('.y-axis line')
    .attr('stroke-dasharray', 2)
    .attr('stroke', 'grey')
}
