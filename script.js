// Script for a simple tool built using only d3 to help users interact with, explore and generally
// appreciate the world of probability distributions.
// Made by Nick Strayer.

//Where we store all the neccesary info about the given distributions.
var theDistributions = {
    "logistic": {"equation"  : logistic, //this needs to be defined in the code.
                 "parameters": ["mu", "theta"], //names of the parameters
                 "starting"  : [0.5, 0.3], //what we start them out at.
                 "plusMinus" : [.4, .2],
                 "sliderInfo": [
                     {"name": "Theta", "startVal": 1,  "slideLow": .1, "slideHigh":4 },
                     {"name": "Mu" , "startVal": 2,  "slideLow": .2, "slideHigh":5 }
                 ]} //how far around the starting values we can go.
}

// ----------------------------------------------------------------------------------------
// All the usual d3 setup stuff.
// ----------------------------------------------------------------------------------------

var width  = parseInt(d3.select("#viz").style("width").slice(0, -2)),
    height = $(window).height() - 150;

var svg = d3.select("#viz").append("svg")
    .attr("height", height)
    .attr("width", width)

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

//variables for the logistic distribtion this stuff will need to go soon.
var theta = 0.5,
    mu    = 0.4,
    params; //initialize the vector that holds the parameters for a given distribution.

// ----------------------------------------------------------------------------------------
// Where all the distribution functions go.
// ----------------------------------------------------------------------------------------

// //Logistic Distribution
// var logistic = function(x, m, t) {
//     // var mu = 0;
//     var y =  (1 / (Math.sqrt(2 * Math.PI) * t)) * (1 / x) *
//         Math.exp(-Math.pow((Math.log(x) - m), 2) / (2 * Math.pow(t, 2)));
//     return y;
// }

//Logistic Distribution, new version.
var logistic = function(x, params) {

    var m = params[0],
        t = params[1];

    var y =  (1 / (Math.sqrt(2 * Math.PI) * t)) * (1 / x) *
        Math.exp(-Math.pow((Math.log(x) - m), 2) / (2 * Math.pow(t, 2)));
    return y;
}

//Normal or Gaussian Distribution.
var normal = function(x, params){

    var m  = params[0],
        sd = params[1];

    return (1 / (sd * Math.sqrt(2*Math.PI))) * (Math.exp( -(Math.pow(x - m, 2))/(2*sd*sd)  ))
}

// //Function to generate the lines. This will need to be changed to take arbitrary params.
// function aLine(xVal, equation, m, t){
//     console.log("t " + t + ", m " + m)
//     return _.map(xVal, function(x) {
//         return { "x": x, "y": equation(x, m, t) }
//  })
// }

//new version
function aLine(xVal, equation, params){
    return _.map(xVal, function(x) {
        return { "x": x, "y": equation(x,params) }
 })
}

// function updateLine(x, equation, m, t){
//     mu = m
//     theta = t
//
//     var newLine = [aLine(x, equation, m, t)]
//
//     svg.selectAll(".distribution")
//         .data(newLine)
//         .transition()
//         .duration(1500)
//         .attr("class", "distribution")
//         .attr("d", line);
// }

//new version
function updateLine(x, equation, params){

    var newLine = [aLine(x, equation, params)]

    svg.selectAll(".distribution")
        .data(newLine)
        .transition()
        .duration(1500)
        .attr("class", "distribution")
        .attr("d", line);
}

var xs = _.range(0.01, 5, .07)

//remove this later
params = theDistributions["logistic"].starting;

var lineData = [aLine(xs, logistic, params)]

// The actual drawing part:
svg.selectAll(".distribution")
    .data(lineData)
    .enter().append("path")
    .attr("class", "distribution")
    .attr("d", line)
    .style("fill", "none")
    .style("stroke-width", 2)
    .style("stroke", "steelblue");


//Work on getting the sliders to automatically generate:

//Generates a single slider.
function makeSlider(name, val, low, high, onInput){

    var div = d3.select("#menu")
        .append("div")
        .attr("class", "col-md-3 variableSlider")

    div.append("label")
        .attr("for", "name")
        .text(name)

    div.append("input")
        .attr("type", "range")
        .attr("id", name)
        .attr("min", low)
        .attr("max", high)
        .attr("value", val)
        .attr("step", (high - low)/100)
        .attr("oninput", onInput)
}

var sampleParams = [
    {"name": "Alpha", "startVal": 1,  "slideLow": .1, "slideHigh":4 },
    {"name": "Beta" , "startVal": 2,  "slideLow": .2, "slideHigh":5 },
    {"name": "Gamma", "startVal": 3,  "slideLow": .3, "slideHigh":6 }
]

var logisticParams = [
    {"name": "Theta", "startVal": 1,  "slideLow": .1, "slideHigh":4 },
    {"name": "Mu" , "startVal": 2,  "slideLow": .2, "slideHigh":5 }
]

// generates the string that goes into the onInput attribute of the input slider.
function makeOnInput(params, equation, loc){
    var call = "updateLine(xs, " + equation + ",[";

    for (var i = 0; i < params.length; i++){
        if (i > 0) call = call + ","; //put the parenthesis for the first but not anything else.
        if (i == loc){ //put value in so the slider can give its value for the working parameter.
            call = call + " value"
        } else {
            call = call + " params[" + i + "]"
        }
    }
    call = call + " ])"
    return call;
}

//runs through the parameters and takes the function name to generate the sliders for a given distribution.
function drawSliders(params, functionName){
    params.forEach(function(d,i){
        makeSlider(d.name, d.startVal, d.slideLow, d.slideHigh, makeOnInput(params, functionName, i))
    })
}

function initializeDist(dist){
    var entry = theDistributions[dist]
    params = entry.starting; //update the parameters to the distributions.
    drawSliders(entry.sliderInfo, dist) //draw the sliders
    updateLine(xs, logistic, params) //logistic shouldent by hard coded.
}                                    //Find a way to store the equation in the javascript object.
