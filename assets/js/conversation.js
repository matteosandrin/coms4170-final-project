var urlParams = new URLSearchParams(window.location.search);
var topicId =  urlParams.has('id') ? urlParams.get('id') : "8322283237678612";

var width = 1200;
var height = 700;
var center = { x: width / 2, y: height / 2 };

var messages = null;
var newMsgId = 8724151620443765;


function chatUI(rootTag, data) {
    var topic = data.topics[topicId];
    var users = topic.users.map(u => data.users[u]);
    users = users.map((u,i) => {
        var href = window.location.href;
        var degree = 90 + (i+1)  * 360 / (users.length+1);
        var pos = angle2pos(width / 2, height / 2, 900 / 2, 600 / 2, degree);
        u.x = pos.x - 300 / 2
        u.y = pos.y - 50 / 2
        u.picture = href.substring(0, href.lastIndexOf('/')) + '/' + u.picture
        return u;
    })
    messages = topic.messages.map((m, i) => {
        m.sender = data.users[m.sender];
        var sectorSize = 360 / (topic.messages.length - 1);
        var angle = Math.random() * sectorSize + (i-1) * sectorSize;
        var rand = angle2pos(width / 2, height / 2, 75, 75, angle);
        console.log(rand.x - width/2, rand.y-height/2);
        if (i === 0) {
            m.x = (width / 2 - 300 / 2) ;
            m.y = (height / 2 - 150 / 2);
        } else {
            m.x = rand.x - 300 / 2;
            m.y = rand.y - 150 / 2;
        }
        return m
    });
    messages.reverse();

    $('.toolbar-title-title').text(topic.title);
    $('.toolbar-prompt').text(topic.prompt);

    var svg = null;
    var userBubbles = null;
    var msgBubbles = null;

    svg = d3.select(rootTag)
        .append('svg')
        .attr('viewBox', '0 0 ' + width + ' ' + height)
        .attr('preserveAspectRatio', 'xMidYMin meet');

    svg.append('ellipse')
        .attr('xmlns:xhtml', 'http://www.w3.org/1999/xhtml')
        .attr('rx', 900 / 2)
        .attr('ry', 600 / 2)
        .attr('cx', width / 2)
        .attr('cy', height / 2)
        .attr('fill', 'rgba(239, 244, 255, 0.47)')
        .attr('stroke', 'rgba(42, 139, 242, 0.44)')
        .attr('stroke-width', '6')

    var filter = svg.append('filter')
        .attr('id', 'dropshadow');
    filter.append('feDropShadow')
        .attr('dx', 5)
        .attr('dy', 5)
        .attr('stDDeviation', 0.75)
        .attr('flood-color', 'rgba(42, 139, 242, 0.1)');
    filter.append('feDropShadow')
        .attr('dx', 5)
        .attr('dy', -5)
        .attr('stDDeviation', 0.75)
        .attr('flood-color', 'rgba(42, 139, 242, 0.1)');
    filter.append('feDropShadow')
        .attr('dx', -5)
        .attr('dy', 5)
        .attr('stDDeviation', 0.75)
        .attr('flood-color', 'rgba(42, 139, 242, 0.1)');
    filter.append('feDropShadow')
        .attr('dx', -5)
        .attr('dy', -5)
        .attr('stDDeviation', 0.75)
        .attr('flood-color', 'rgba(42, 139, 242, 0.1)');
    
    var gradient = svg.append('linearGradient')
        .attr('id', 'input-grad')
        .attr('x1', '50%')
        .attr('y1', '0%')
        .attr('x2', '50%')
        .attr('y2', '100%');
    gradient.append('stop')
        .attr('offset', '0%')
        .style('stop-color', '#60A9F6')
        .style('stop-opacity', 1);
    gradient.append('stop')
        .attr('offset', '100%')
        .style('stop-color', '#2A8BF2')
        .style('stop-opacity', 1)

    // create user bubbles

    userBubbles = svg.selectAll('.user')
        .data(users, u => u.id);
    
    var userGroups = userBubbles.enter()
        .append('g')
        .classed('user', true)
        .attr('transform', d => {
            var degree = 90;
            var pos = angle2pos(width / 2, height / 2, 900 / 2, 600 / 2, degree);
            pos.x = pos.x - 300 / 2
            pos.y = pos.y - 50 / 2
            return 'translate(' + pos.x + ', ' + pos.y +')'
        });

    userGroups.append('rect')
        .attr('x', '0')
        .attr('y', '0')
        .attr('width', '300')
        .attr('height', '100')
        .attr('rx', '50')
        .attr('fill', '#FAFBFF')

    userGroups.append('clipPath')
        .attr('id', 'clip-user')
        .append('rect')
            .attr('width', '45')
            .attr('height', '45')
            .attr('x', 100 / 2 - 45 / 2)
            .attr('y', 100 / 2 - 45 / 2)
            .attr('rx', 45/2);

    userGroups.append('image')
        .attr('href', d => d.picture)
        .attr('width', '45')
        .attr('height', '45')
        .attr('x', 100 / 2 - 45 / 2)
        .attr('y', 100 / 2 - 45 / 2)
        .attr('preserveAspectRatio', 'xMidYMid slice')
        .attr('clip-path', 'url(#clip-user)')

    userGroups.append('text')
        .text(d => d.name)
        .classed('user-name', true)
        .attr('x', 90)
        .attr('y', 48);

    userGroups.append('text')
        .text(d => 'seen ' + d.last_seen)
        .classed('user-last-seen', true)
        .attr('x', 90)
        .attr('y', 68);

    userGroups.transition()
        .ease(d3.easeSin)
        .duration(1000)
        .attr('transform', d => 'translate(' + d.x + ', ' + d.y +')');

    // create message bubbles

    var makeMessageBubble = function() {
        var msgBubbles = svg.selectAll('.message')
            .data(messages, m => m.id);

        var msgGroups = msgBubbles.enter()
            .append('g')
            .classed('message', true)
            .attr('transform', d => {
                if (d.preX && d.preY) {
                    return 'translate(' + d.preX + ', ' + d.preY + ')';
                }
                return 'translate(' + (width / 2 - 300 / 2) + ', ' + (height / 2 - 150 / 2) + ')';
            })
            .attr('opacity', (d,i) => {
                return 0.25 + 0.75 * ((i+1) / messages.length);
            });

        msgGroups.append('rect')
            .attr('x', 0)
            .attr('x', 0)
            .attr('width', 300)
            .attr('height', 150)
            .attr('rx', 25)
            .attr('fill', '#FAFBFF')
            .style('filter', 'url(#dropshadow)');

        msgGroups.append('clipPath')
            .attr('id', 'clip-msg')
            .append('rect')
                .attr('width', '45')
                .attr('height', '45')
                .attr('x', 80 / 2 - 45 / 2)
                .attr('y', 150 / 2 - 45 / 2)
                .attr('rx', 45/2);

        msgGroups.append('image')
            .attr('href', d => d.sender.picture)
            .attr('width', '45')
            .attr('height', '45')
            .attr('x', 80 / 2 - 45 / 2)
            .attr('y', 150 / 2 - 45 / 2)
            .attr('preserveAspectRatio', 'xMidYMid slice')
            .attr('clip-path', 'url(#clip-msg)');

        msgGroups.append('foreignObject')
            .attr('x', 80)
            .attr('y', 0)
            .attr('width', 260)
            .attr('height', 150)
            .append('xhtml:p')
                .html(d => d.content)
                .classed('message-content', true);

        msgBubbles = msgBubbles.merge(msgGroups);

        msgBubbles.transition()
            .ease(d3.easeSin)
            .duration(1000)
            .attr('transform', d => 'translate(' + d.x + ', ' + d.y +')');
    
    }

    makeMessageBubble();

    // create input bubble

    var inputBubble = svg.append('g')
        .classed('input', true)
        .attr('transform', 'translate(' + (width / 2 - 300 / 2) + ', ' + (height / 2 - 100 / 2 + 275) + ')');

    inputBubble.append('rect')
        .classed('input-rect', true)
        .attr('x', 0)
        .attr('x', 0)
        .attr('width', 300)
        .attr('height', 100)
        .attr('rx', 50)
        .attr('fill', 'url(#input-grad)')
        .style('filter', 'url(#dropshadow)');

    inputBubble.append('clipPath')
        .attr('id', 'clip-input')
        .append('rect')
            .attr('width', '45')
            .attr('height', '45')
            .attr('x', 100 / 2 - 45 / 2)
            .attr('y', 100 / 2 - 45 / 2)
            .attr('rx', 45/2);

    inputBubble.append('image')
        .attr('href', 'assets/img/profile_05.png')
        .attr('width', '45')
        .attr('height', '45')
        .attr('x', 100 / 2 - 45 / 2)
        .attr('y', 100 / 2 - 45 / 2)
        .attr('preserveAspectRatio', 'xMidYMid slice')
        .attr('clip-path', 'url(#clip-input)');

    inputBubble.append('foreignObject')
        .classed('input-textbox-foreign',true)
        .attr('x', 90)
        .attr('y', 0)
        .attr('width', 175)
        .attr('height', 100)
        .append('xhtml:textarea')
            .attr('placeholder', 'Type here...')
            .classed('input-textbox', true);

    inputBubble.append('foreignObject')
            .attr('x', 330)
            .attr('y', 0)
            .attr('width', 45)
            .attr('height', 100)
            .append('xhtml:div')
                .classed('send-button', true)
                .style('opacity', 0)
                .html('📩')

    $('.input-textbox').focus(() => {
        svg.select('.input-rect')
            .transition()
            .ease(d3.easeSin)
            .duration(200)
            .attr('width', 400)
            .attr('height', 200);
        inputBubble.select('.input-textbox-foreign')
            .transition()
            .ease(d3.easeSin)
            .duration(200)
            .attr('width', 295)
            .attr('height', 200)
        inputBubble.select('.input-textbox')
            .transition()
            .ease(d3.easeSin)
            .duration(200)
            .style('height', '150px')
            .style('width', '75%')
        inputBubble.transition()
            .ease(d3.easeSin)
            .duration(200)
            .attr('transform', 'translate(' + (width / 2 - 400 / 2) + ', ' + (height / 2 - 200 / 2 + 245) + ')');
        inputBubble.select('.send-button').transition()
            .ease(d3.easeSin)
            .duration(200)
            .style('opacity', 1);
            
    });

    $('.send-button').click(() => {
        svg.select('.input-rect')
            .transition()
            .ease(d3.easeSin)
            .duration(200)
            .attr('width', 300)
            .attr('height', 100);
        inputBubble.select('.input-textbox-foreign')
            .transition()
            .ease(d3.easeSin)
            .duration(200)
            .attr('width', 175)
            .attr('height', 100)
        inputBubble.select('.input-textbox')
            .transition()
            .ease(d3.easeSin)
            .duration(200)
            .style('height', '45px')
            .style('width', '100%')
        inputBubble.transition()
            .ease(d3.easeSin)
            .duration(200)
            .attr('transform', 'translate(' + (width / 2 - 300 / 2) + ', ' + (height / 2 - 100 / 2 + 275) + ')');
        inputBubble.select('.send-button').transition()
            .ease(d3.easeSin)
            .duration(100)
            .style('opacity', 0);
        
        var content = $('.input-textbox').val();
        $('.input-textbox').val('');
        
        var href = window.location.href;
        var msg = {
            id: newMsgId.toString(),
            sender: {
                id: "8724151620443284",
                picture: href.substring(0, href.lastIndexOf('/')) + '/assets/img/profile_05.png'
            },
            content: content,
            x: (width / 2 - 300 / 2),
            y: (height / 2 - 150 / 2),
            preX: (width / 2 - 300 / 2),
            preY: (height / 2 - 150 / 2) + 250
        }

        messages.push(msg);
        makeMessageBubble();

    });

}

function angle2pos(centerX, centerY, radiusX, radiusY, angleInDegrees) {

    var angleInRadians = (angleInDegrees * Math.PI / 180.0);
    return {
        x: centerX + (radiusX * Math.cos(angleInRadians)),
        y: centerY + (radiusY * Math.sin(angleInRadians))
    };
}

// function addMessage(msg) {
//     var group = svg.append('g')
//         .classed('message', true)
//         .attr('transform', 'translate(' + (width / 2 - 300 / 2) + ', ' + (height / 2 - 150 / 2 + 245) + ')');

//     group.append('rect')
//         .attr('x', 0)
//         .attr('x', 0)
//         .attr('width', 300)
//         .attr('height', 150)
//         .attr('rx', 25)
//         .attr('fill', '#FAFBFF')
//         .style('filter', 'url(#dropshadow)');

//     group.append('clipPath')
//         .attr('id', 'clip-msg')
//         .append('rect')
//             .attr('width', '45')
//             .attr('height', '45')
//             .attr('x', 80 / 2 - 45 / 2)
//             .attr('y', 150 / 2 - 45 / 2)
//             .attr('rx', 45/2);

//     group.append('image')
//         .attr('href', d => d.sender.picture)
//         .attr('width', '45')
//         .attr('height', '45')
//         .attr('x', 80 / 2 - 45 / 2)
//         .attr('y', 150 / 2 - 45 / 2)
//         .attr('preserveAspectRatio', 'xMidYMid slice')
//         .attr('clip-path', 'url(#clip-msg)');

//     group.append('foreignObject')
//         .attr('x', 80)
//         .attr('y', 0)
//         .attr('width', 260)
//         .attr('height', 150)
//         .append('xhtml:p')
//             .html(d => d.content)
//             .classed('message-content', true);

//     msgBubbles.transition()
//         .ease(d3.easeSin)
//         .duration(1000)
//         .attr('transform', d => 'translate(' + d.x + ', ' + d.y +')');
// } 

var chart = null;

function display(error, data) {
    if (error) {
        console.log(error);
    }
    chart = chatUI('#vis', data);
}

d3.json('data.json', display);

$(document).ready(() => {
    $('.toolbar-leave-chat').click(() => {
        window.location.href = 'bubbles.html';
    });
});