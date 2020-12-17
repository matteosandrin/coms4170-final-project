// code partly adapted from https://github.com/vlandham/bubble_chart_v4

function bubbleChart(rootTag, data) {
    console.log(data)
    var width = 940;
    var height = 600;
    var center = { x: width / 2, y: height / 2 };

    var forceStrength = 0.03;

    var svg = null;
    var bubbles = null;
    var nodes = [];

    // The charge of a bubble determines how much it repels/attracts other
    // bubbles. The charge of a bubble is directly proportional to its radius.
    // The charge is always negative, and therefore repels other bubbles.
    function charge(d) {
        return -Math.pow(d.radius, 2.0) * forceStrength;
    }

    function tick() {
        bubbles
            .attr('transform', (d) => 'translate('+ d.x + ',' + d.y + ')')
    }

    // create force layout
    var simulation = d3.forceSimulation()
        .velocityDecay(0.2)
        .force('x', d3.forceX().strength(forceStrength).x(center.x))
        .force('y', d3.forceY().strength(forceStrength).y(center.y))
        .force("collide", d3.forceCollide().radius(d => d.radius + 1).iterations(3))
        .force('charge', d3.forceManyBody().strength(charge))
        .on('tick', tick);
    simulation.stop();

    // create nodes
    var topics = data.topics;
    var maxSize = d3.max(topics, (d) => d.size);
    var minSize = d3.min(topics, (d) => d.size);

    var radiusScale = d3.scalePow()
        .exponent(0.5)
        .range([30, 85])
        .domain([minSize, maxSize]);

    nodes = topics.map((topic) => ({
            id: topic.id,
            title: topic.title,
            age: topic.age,
            radius: radiusScale(topic.size),
            x: Math.random() * 900,
            y: Math.random() * 800,
        })
    );

    nodes.sort((a,b) => { b.radius - a.radius });

    // create svg
    svg = d3.select(rootTag)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    bubbles = svg.selectAll('.bubble')
        .data(nodes, (n) => n.id);
    
    var groups = bubbles.enter()
        .append('g')
        .classed('bubble', true);

    var circle = groups.append('circle')
        .attr('r', 0)
        .attr('fill', "#60A9F6");
        // .attr('stroke', "#60A9F6")
        // .attr('stroke-width', 2)
        // .on('mouseover', showDetail)
        // .on('mouseout', hideDetail);

    var text = groups.append('text')
        // .attr("dy", (d) => -d.radius)
        .text((d) => d.title)
        .classed('bubbleTitle', true);

    bubbles = bubbles.merge(groups);
    bubbles.transition()
        .ease(d3.easeSin)
        .duration(1500)
        .selectAll('circle')
            .attr('r', (d) => d.radius);

    simulation.nodes(nodes);
    simulation.force('x', d3.forceX().strength(forceStrength).x(center.x));
    simulation.alpha(1).restart()

    return null;
}

var chart = null;

function display(error, data) {
    if (error) {
        console.log(error);
    }
    chart = bubbleChart('#vis', data)  
}

d3.json('data.json', display)