/* global d3 qwest PouchDB */

const _inputs = new PouchDB('http://localhost:5984/inputs')

function draw () {
  getEmojiInfo()
}

function getEmojiInfo () {
  // @todo do this based on chnages instead
  qwest.get('//localhost:8001/logs/text-emoji', {}, {cache: true})
    .then((xhr, response) => {
      const sel = '#emoji'

      document.querySelector(sel).innerHTML = ''
      drawEmojiFrequency({
        data: siftEmojis(response),
        sel
      })
    })
}

function drawEmojiFrequency ({
  sel = '#emoji',
  data
}) {
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

draw()

_inputs.changes({
  since: 'now',
  live: true
}).on('change', draw)
