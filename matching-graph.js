/**
 * Disjoint force-directed graph (D3)
 * Pattern: https://observablehq.com/@d3/disjoint-force-directed-graph/2
 * Uses forceX / forceY (not forceCenter) so detached clusters stay in view.
 */
import * as d3 from 'd3'

const container = document.getElementById('graph-container')
if (container) {
  const TYPE_COLOR = {
    professional: '#0ea5e9',
    investor: '#f59e0b',
    startup: '#16a34a',
    company: '#a855f7',
  }

  const graph = {
    nodes: [
      { id: 'prof_1', name: 'Sarah Chen', type: 'professional', group: 1, detail: 'AI/ML, Product' },
      { id: 'prof_2', name: 'Rajesh Gupta', type: 'professional', group: 1, detail: 'ML Engineer' },
      { id: 'prof_3', name: 'Emily Zhang', type: 'professional', group: 1, detail: 'Data Scientist' },
      { id: 'prof_4', name: 'James Patterson', type: 'professional', group: 1, detail: 'AI Strategy' },
      { id: 'inv_1', name: 'Sequoia Capital', type: 'investor', group: 1, detail: 'AI/ML' },
      { id: 'inv_2', name: 'Andreessen Horowitz', type: 'investor', group: 1, detail: 'Enterprise AI' },
      { id: 'inv_3', name: 'Insight Partners', type: 'investor', group: 1, detail: 'SaaS, AI' },
      { id: 'startup_1', name: 'OpenAI', type: 'startup', group: 1, detail: 'Series D' },
      { id: 'startup_2', name: 'Anthropic', type: 'startup', group: 1, detail: 'Series C' },
      { id: 'startup_3', name: 'Cohere', type: 'startup', group: 1, detail: 'Series B' },
      { id: 'startup_4', name: 'Hugging Face', type: 'startup', group: 1, detail: 'Series D' },
      { id: 'company_1', name: 'Google AI', type: 'company', group: 1, detail: 'Big Tech' },

      { id: 'prof_5', name: 'Marcus Davis', type: 'professional', group: 2, detail: 'DevOps, Cloud' },
      { id: 'prof_6', name: 'Priya Sharma', type: 'professional', group: 2, detail: 'Kubernetes' },
      { id: 'prof_7', name: 'Chen Wei', type: 'professional', group: 2, detail: 'Cloud Arch' },
      { id: 'prof_8', name: 'Alexis Rodriguez', type: 'professional', group: 2, detail: 'Infrastructure' },
      { id: 'inv_4', name: 'Bessemer VC', type: 'investor', group: 2, detail: 'Infrastructure' },
      { id: 'inv_5', name: 'GGV Capital', type: 'investor', group: 2, detail: 'Cloud' },
      { id: 'inv_6', name: 'Accel Partners', type: 'investor', group: 2, detail: 'DevTools' },
      { id: 'startup_5', name: 'Databricks', type: 'startup', group: 2, detail: 'Series H' },
      { id: 'startup_6', name: 'HashiCorp', type: 'startup', group: 2, detail: 'IPO' },
      { id: 'startup_7', name: 'LaunchDarkly', type: 'startup', group: 2, detail: 'Series C' },
      { id: 'startup_8', name: 'Snyk', type: 'startup', group: 2, detail: 'Series E' },
      { id: 'company_2', name: 'AWS', type: 'company', group: 2, detail: 'Cloud Provider' },

      { id: 'prof_9', name: 'Luna Patel', type: 'professional', group: 3, detail: 'Climate Tech' },
      { id: 'prof_10', name: 'River Johnson', type: 'professional', group: 3, detail: 'Sustainability' },
      { id: 'prof_11', name: 'Sophie Mueller', type: 'professional', group: 3, detail: 'Green Energy' },
      { id: 'prof_12', name: 'David Okafor', type: 'professional', group: 3, detail: 'Environmental' },
      { id: 'inv_7', name: 'Breakthrough Energy', type: 'investor', group: 3, detail: 'Climate' },
      { id: 'inv_8', name: 'Lowercarbon Capital', type: 'investor', group: 3, detail: 'Climate Tech' },
      { id: 'inv_9', name: 'Telstra Ventures', type: 'investor', group: 3, detail: 'Sustainability' },
      { id: 'startup_9', name: 'Commonwealth Fusion', type: 'startup', group: 3, detail: 'Series B' },
      { id: 'startup_10', name: 'Twelve', type: 'startup', group: 3, detail: 'Series A' },
      { id: 'startup_11', name: 'Form Energy', type: 'startup', group: 3, detail: 'Series B' },
      { id: 'startup_12', name: 'Impossible Foods', type: 'startup', group: 3, detail: 'Series E' },
      { id: 'company_3', name: 'Tesla Energy', type: 'company', group: 3, detail: 'Renewables' },
    ],
    links: [
      { source: 'prof_1', target: 'prof_2', value: 1 },
      { source: 'prof_1', target: 'prof_3', value: 1 },
      { source: 'prof_2', target: 'prof_4', value: 1 },
      { source: 'prof_1', target: 'startup_1', value: 2 },
      { source: 'prof_2', target: 'startup_2', value: 2 },
      { source: 'prof_3', target: 'startup_3', value: 2 },
      { source: 'prof_4', target: 'startup_4', value: 2 },
      { source: 'inv_1', target: 'startup_1', value: 3 },
      { source: 'inv_1', target: 'startup_2', value: 3 },
      { source: 'inv_2', target: 'startup_3', value: 3 },
      { source: 'inv_2', target: 'startup_4', value: 3 },
      { source: 'inv_3', target: 'startup_1', value: 2 },
      { source: 'prof_1', target: 'inv_1', value: 1 },
      { source: 'prof_2', target: 'inv_2', value: 1 },
      { source: 'prof_3', target: 'inv_3', value: 1 },
      { source: 'company_1', target: 'prof_1', value: 2 },
      { source: 'company_1', target: 'startup_2', value: 2 },
      { source: 'startup_1', target: 'startup_3', value: 1 },

      { source: 'prof_5', target: 'prof_6', value: 1 },
      { source: 'prof_6', target: 'prof_7', value: 1 },
      { source: 'prof_7', target: 'prof_8', value: 1 },
      { source: 'prof_5', target: 'startup_5', value: 2 },
      { source: 'prof_6', target: 'startup_6', value: 2 },
      { source: 'prof_7', target: 'startup_7', value: 2 },
      { source: 'prof_8', target: 'startup_8', value: 2 },
      { source: 'inv_4', target: 'startup_5', value: 3 },
      { source: 'inv_4', target: 'startup_6', value: 3 },
      { source: 'inv_5', target: 'startup_7', value: 3 },
      { source: 'inv_5', target: 'startup_8', value: 3 },
      { source: 'inv_6', target: 'startup_5', value: 2 },
      { source: 'prof_5', target: 'inv_4', value: 1 },
      { source: 'prof_6', target: 'inv_5', value: 1 },
      { source: 'prof_7', target: 'inv_6', value: 1 },
      { source: 'company_2', target: 'prof_5', value: 2 },
      { source: 'company_2', target: 'startup_6', value: 2 },
      { source: 'startup_5', target: 'startup_7', value: 1 },

      { source: 'prof_9', target: 'prof_10', value: 1 },
      { source: 'prof_10', target: 'prof_11', value: 1 },
      { source: 'prof_11', target: 'prof_12', value: 1 },
      { source: 'prof_9', target: 'startup_9', value: 2 },
      { source: 'prof_10', target: 'startup_10', value: 2 },
      { source: 'prof_11', target: 'startup_11', value: 2 },
      { source: 'prof_12', target: 'startup_12', value: 2 },
      { source: 'inv_7', target: 'startup_9', value: 3 },
      { source: 'inv_7', target: 'startup_10', value: 3 },
      { source: 'inv_8', target: 'startup_11', value: 3 },
      { source: 'inv_8', target: 'startup_12', value: 3 },
      { source: 'inv_9', target: 'startup_9', value: 2 },
      { source: 'prof_9', target: 'inv_7', value: 1 },
      { source: 'prof_10', target: 'inv_8', value: 1 },
      { source: 'prof_11', target: 'inv_9', value: 1 },
      { source: 'company_3', target: 'prof_9', value: 2 },
      { source: 'company_3', target: 'startup_10', value: 2 },
      { source: 'startup_9', target: 'startup_11', value: 1 },
    ],
  }

  const matchesEl = document.querySelector('[data-stat="matches"]')
  const accuracyEl = document.querySelector('[data-stat="accuracy"]')
  const successEl = document.querySelector('[data-stat="success"]')
  if (matchesEl) matchesEl.textContent = String(graph.links.length)
  if (accuracyEl) accuracyEl.textContent = '87%'
  if (successEl) successEl.textContent = String(Math.round(graph.links.length * 0.58))

  const tooltip = document.getElementById('match-tooltip')

  function drag(simulation) {
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      d.fx = d.x
      d.fy = d.y
    }
    function dragged(event, d) {
      d.fx = event.x
      d.fy = event.y
    }
    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0)
      d.fx = null
      d.fy = null
    }
    return d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended)
  }

  function render() {
    container.replaceChildren()

    const width = container.clientWidth || 960
    const height = Math.max(520, Math.min(680, Math.round(width * 0.62)))

    const links = graph.links.map((d) => ({ ...d }))
    const nodes = graph.nodes.map((d) => ({ ...d }))

    const svg = d3
      .select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('role', 'img')
      .attr('aria-label', 'AI matching network graph')

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink(links)
          .id((d) => d.id)
          .distance(42)
          .strength(0.85),
      )
      .force('charge', d3.forceManyBody().strength(-180))
      .force('x', d3.forceX(width / 2).strength(0.05))
      .force('y', d3.forceY(height / 2).strength(0.05))
      .force('collide', d3.forceCollide().radius(18))

    const link = svg
      .append('g')
      .attr('stroke', '#94a3b8')
      .attr('stroke-opacity', 0.45)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', (d) => Math.sqrt(d.value || 1))

    const node = svg
      .append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', 10)
      .attr('fill', (d) => TYPE_COLOR[d.type] || '#6b7280')
      .attr('cursor', 'pointer')
      .call(drag(simulation))

    node.append('title').text((d) => `${d.name} · ${d.detail}`)

    node
      .on('mouseenter', (event, d) => {
        if (!tooltip) return
        tooltip.innerHTML = `<strong>${d.name}</strong><br/>${d.type} · ${d.detail}`
        tooltip.classList.add('visible')
      })
      .on('mousemove', (event) => {
        if (!tooltip) return
        const rect = container.getBoundingClientRect()
        tooltip.style.left = `${event.clientX - rect.left + 12}px`
        tooltip.style.top = `${event.clientY - rect.top - 10}px`
      })
      .on('mouseleave', () => {
        if (!tooltip) return
        tooltip.classList.remove('visible')
      })

    const label = svg
      .append('g')
      .attr('font-family', 'Inter, system-ui, sans-serif')
      .attr('font-size', 10)
      .attr('font-weight', 600)
      .attr('fill', '#374151')
      .attr('pointer-events', 'none')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 22)
      .text((d) => d.name.split(' ')[0])

    simulation.on('tick', () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y)

      node.attr('cx', (d) => d.x).attr('cy', (d) => d.y)
      label.attr('x', (d) => d.x).attr('y', (d) => d.y)
    })
  }

  render()

  let resizeTimer
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(render, 180)
  })
}
