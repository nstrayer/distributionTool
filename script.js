//just some nonsense to move objects to front easily.
d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

var theDistributions = [
    {"name": "logistic", "equation": logistic, "parameters": ["mu", "theta"], "starting": [0.5, 0.3]}
]

var width = parseInt(d3.select("#viz").style("width").slice(0, -2)),
    height = $(window).height() - 150;

var svg = d3.select("#viz").append("svg")
    .attr("height", height)
    .attr("width", width)

//variables for the logistic distribtion
var theta = 0.5,
    mu    = 0.4;

//Logistic Distributions
var logistic = function(x, m, t) {
    // var mu = 0;
    var y =  (1 / (Math.sqrt(2 * Math.PI) * t)) * (1 / x) *
        Math.exp(-Math.pow((Math.log(x) - m), 2) / (2 * Math.pow(t, 2)));
    return y;
}

var normal = function(x, m, sd){
    return (1 / (sd * Math.sqrt(2*Math.PI))) * (Math.exp( -(Math.pow(x - m, 2))/(2*sd*sd)  ))
}

var x = d3.scale.linear()
    .domain([0, 5])
    .range([0, width]);

var y = d3.scale.linear()
    .domain([0, 4])
    .range([height, 0]);

var line = d3.svg.line()
    .interpolate("basis")
    .x(function(d) { return x(d.x); })
    .y(function(d) { return y(d.y); });

function aLine(xVal, equation, m, t){
    console.log("t " + t + ", m " + m)
    return _.map(xVal, function(x) {
        return { "x": x, "y": equation(x, m, t) }
 })
}

function updateLine(x, equation, m, t){
    mu = m
    theta = t

    var newLine = [aLine(x, equation, m, t)]

    svg.selectAll(".distribution")
        .data(newLine)
        .transition()
        .duration(1500)
        .attr("class", "distribution")
        .attr("d", line);
}

var xs = _.range(0.01, 5, .07)
var lineData = [aLine(xs, logistic, mu, theta)]

// The actual drawing part:
svg.selectAll(".distribution")
    .data(lineData)
    .enter().append("path")
    .attr("class", "distribution")
    .attr("d", line)
    .style("fill", "none")
    .style("stroke-width", 2)
    .style("stroke", "steelblue");

function makeSlider(name, v, start, end){

    var div = d3.select("#menu")
        .append("div")
        .attr("class", "col-md-3 variableSlider")

    div.append("label")
        .attr("for", "name")
        .text(name)

    div.append("input")
        .attr("type", "range")
        .attr("id", name)
        .attr("min", start)
        .attr("max", end)
        .attr("value", v)
        .attr("step", (end - start)/100)
        .attr("oninput", "updateLine(xs, logistic, value, theta)")
}

makeSlider("Mu", mu ,0.01, 4)
