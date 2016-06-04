/* global d3 qwest PouchDB */

const _inputs = new PouchDB('http://localhost:5984/inputs')

function update () {
  getEmojiInfo()
  getDrinkInfo()
  getTrends()
}

function getEmojiInfo () {
  const sel = '#emoji'

  document.querySelector(sel).innerHTML = ''
  // @todo do this based on changes instead
  qwest.get('//localhost:8001/logs/text-emoji', {}, {cache: true})
    .then((xhr, response) => {
      drawEmojiFrequency({
        data: siftEmojis(response),
        sel
      })
    })
}

function getTrends () {
  const sel = '#trends'

  qwest
    .get('//localhost:8001/logs/time-morning-meds', {}, {cache: true})
    .get('//localhost:8001/logs/time-mood-drop', {}, {cache: true})
    .get('//localhost:8001/logs/time-bedtime', {}, {cache: true})
    .then((values) => {
      document.querySelector(sel).innerHTML = ''

      drawTrends({
        data: siftTimes(values),
        sel
      })
    })
    .catch(console.log)
}

function drawTrends ({data, sel}) {
  const margin = {top: 20, right: 20, bottom: 30, left: 40}
  const width = 500
  const height = 400

  const color = d3.scale.category10()

  const x = d3.time.scale()
    .domain([new Date(2016, 2, 1), new Date(2016, 2, 31)])
    .range([0, width])

  const y = d3.time.scale()
    .domain([new Date('2016-03-01T00:00:00.000Z'), new Date('2016-03-02T00:00:00.000Z')])
    .range([height, 0])
  const xAxis = d3.svg.axis()
    .scale(x)
    .orient('bottom')
  const yAxis = d3.svg.axis()
    .scale(y)
    .orient('left')

  const svg = d3.select(sel)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
    .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

  x.domain(d3.extent(data, function (d) { return d.date })).nice()
  y.domain(d3.extent(data, function (d) { return d.time })).nice()

  svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis)
    .append('text')
      .attr('class', 'label')
      .attr('x', width)
      .attr('y', -6)
      .style('text-anchor', 'start')
      .text('Date')

  svg.append('g')
      .attr('class', 'y axis')
      .call(yAxis)
    .append('text')
      .attr('class', 'label')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'start')
      .text('Time')

  svg.selectAll('.dot')
      .data(data)
    .enter().append('circle')
      .attr('class', 'dot')
      .attr('r', 3.5)
      .attr('cx', (d) => { return x(d.date) })
      .attr('cy', (d) => { return y(d.time) })
      .style('fill', (d) => { return color(d.log) })

  const legend = svg.selectAll('.legend')
      .data(color.domain())
    .enter().append('g')
      .attr('class', 'legend')
      .attr('transform', (d, i) => 'translate(0,' + i * 20 + ')' )

  legend.append('rect')
    .attr('x', width - 18)
    .attr('width', 18)
    .attr('height', 18)
    .style('fill', color)

  legend.append('text')
    .attr('x', width - 24)
    .attr('y', 9)
    .attr('dy', '.35em')
    .style('text-anchor', 'end')
    .text((d) => { return d })
}

function siftTimes (values) {
  const result = []
  const timeFormat = d3.time.format('%H:%M')
  const dateFormat = d3.time.format('%Y-%m-%d')

  values.forEach((item) => {
    const [xhr, response] = item
    const log = xhr.responseURL.split('/').pop()

    response.forEach(({date, time}) => {
      result.push({
        date: dateFormat.parse(date),
        time: timeFormat.parse(time),
        log})
    })
  })
  return result
}

function getDrinkInfo () {
  // @todo do this based on changes instead
  qwest.get('//localhost:8001/logs/time-drinks', {}, {cache: true})
    .then((xhr, response) => {
      const sel = '#drunk'

      document.querySelector(sel).innerHTML = ''
      drawDrunk({
        data: siftDrinks(response),
        sel
      })
    })
}

function drawDrunk ({data, sel}) {
  const svg = document.querySelector(sel)
  const radius = [0, 20, 50, 80, 110, 150]
  const pos = [0, 30, 70, 100, 130, 170]
  const colors = ['#fff', '#ffd8d8', '#ffb1b1', '#ff8989', '#ff4e4e', '#ff1414']

  svg.innerHTML = `<circle cx="${pos[data]}" cy="${pos[data]}" fill="${colors[data]}" r='${radius[data]}'></circle>`
  svg.setAttribute('width', pos[data] * 2)
  svg.setAttribute('height', pos[data] * 2)
}

function siftDrinks (data) {
  const now = Date.now()
  const last = data
    .slice(data.length - 7, data.length)
    .map(({timestamp}) => Date.parse(timestamp))
  const threshold = 86400000 / 2
  let count = 0

  while (last.length) {
    const earliest = last.shift()

    if ((now - earliest) < threshold) {
      count++
    }
  }

  return count
}

function drawEmojiFrequency ({sel, data}) {
  const width = 420
  const barHeight = 50
  const max = d3.max(data, (d) => d.frequency)
  const x = d3.scale.linear()
    .range([0, width])
  const chart = d3.select(sel)
    .attr('width', width + 100)
  const axis = d3.svg.axis()
    .scale(x)
    .ticks(max)
    .tickFormat(d3.format('f'))
    .orient('bottom')
  const bar = chart.selectAll('g')
      .data(data)
    .enter().append('g')
      .attr('transform', (d, i) => `translate(0, ${i * barHeight})`)
      .attr('class', 'bar')

  x.domain([0, max])
  chart.append('g')
    .attr('class', 'x axis')
    .attr('transform', (d, i) => `translate(50, ${barHeight * data.length})`)
    .call(axis)
  chart.attr('height', barHeight * (data.length + 1))
  bar.append('rect')
    .attr('width', (d) => x(d.frequency))
    .attr('height', barHeight - 1)
    .attr('transform', 'translate(50, 0)')
  bar.append('text')
    .attr('class', 'emoji')
    .attr('x', 40)
    .attr('y', 30)
    .attr('dy', '1rem')
    .text((d) => d.text)
}

function siftEmojis (data) {
  const result = []
  const found = {}

  data.forEach(({text}) => {
    if (!found[text]) {
      found[text] = 0
    }
    found[text] += 1
  })
  for (let emoji in found) {
    result.push({
      frequency: found[emoji],
      text: emoji
    })
  }
  return result.sort((a, b) => {
    return a.text < b.text ? -1 : 1
  })
}

update()

_inputs.changes({
  since: 'now',
  live: true
}).on('change', update)
