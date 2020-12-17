function bubbleChart() {
}

var chart = bubbleChart();

function display(error, data) {
    if (error) {
        console.log(error);
    }
    chart('#vis', data)  
}

d3.json('data.json', display)