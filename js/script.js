// Script for a simple tool built using only d3 to help users interact with, explore and generally
// appreciate the world of probability distributions.
// Made by Nick Strayer.

// ----------------------------------------------------------------------------------------
// Where all the distribution functions go.
// ----------------------------------------------------------------------------------------

//A flat line, for starting the distribution
var flat = function(x, params){
    return .001
}

//Logistic Distribution, new version.
var logistic = function(x, params) {

    var t = params[0],
        m = params[1];

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

//Where we store all the neccesary info about the given distributions.
var theDistributions = {
    "logistic": {
        equation: function(x, params) { return logistic(x, params) },
        starting: [0.5, 0.3], //what we start them out at.
        paramInfo: [{ "name": "Theta", "startVal": 0.5, "slideLow": .1,  "slideHigh": 1 },
                    { "name": "Mu",    "startVal": 0.3, "slideLow": .01, "slideHigh": 1 }],
        xRange: [0.01, 6],
        yMax: 3.5,
        info: "logistic.html"
    },
    "normal": {
        equation: function(x, params) { return normal(x, params) },
        starting: [0, 0.5], //what we start them out at.
        paramInfo: [{ "name": "Mu", "startVal": 0, "slideLow": -3, "slideHigh": 3 },
                    { "name": "Sd", "startVal": 0.5, "slideLow": .1, "slideHigh": 2 }],
        xRange: [-4, 4],
        yMax: 1.5,
        info: "normal.html"
    } //how far around the starting values we can go. //how far around the starting values we can go.
}

// ----------------------------------------------------------------------------------------
// All the usual d3 setup stuff.
// ----------------------------------------------------------------------------------------

var params = []; //initialize the parameters variable.

var xs = _.range(0, 10 + 10/500, 10/500) //this will need to be made customizable by disribution.

var width   = parseInt(d3.select("#viz").style("width").slice(0, -2)) - 40,
    height  = $(window).height() - 200,
    padding = 20;

var svg = d3.select("#viz").append("svg")
    .attr("height", height)
    .attr("width", width)

var x = d3.scale.linear()
    .domain([0, 10])
    .range([padding + 5, width - padding]);

var y = d3.scale.linear()
    .domain([0, 4])
    .range([height - padding, padding]);

var line = d3.svg.line()
    .interpolate("basis")
    .x(function(d) { return x(d.x); })
    .y(function(d) { return y(d.y); });

//Convert x and the function into a format d3 likes.
function aLine(xVal, equation, params){
    return _.map(xVal, function(x) {
        return { "x": x, "y": equation(x,params) }
 })
}

function updateAxes(){
    d3.select("#xAxis")
        .transition()
        .duration(800)
        .call(xAxis)

    d3.select("#yAxis")
        .transition()
        .duration(800)
        .call(yAxis)
}

//Update the already drawn line on the screen.
function updateLine(x, equation, p){
    params = p //update the params variable globaly.

    var newLine = [aLine(x, equation, params)]

    svg.selectAll(".distribution")
        .data(newLine)
        .transition()
        .duration(1500)
        .attr("class", "distribution")
        .attr("d", line);
}

//Generates a single slider. I wish this was less intrecate. Ohh the sacrifices for mobile.
function makeSlider(name, val, low, high, functionName, loc){

    var div = d3.select("#menu")
        .append("div")
        .attr("class", "col-md-3 variableSlider");

    div.append("p").attr("class", "variableName").text(name) //write the name of the variable.

    div.append("div") //create a div to put the slider into.
        .attr("id", name + "slider")

    //select the div we just created
    var slider = document.getElementById( name + "slider")

    //draw the slider in it.
    noUiSlider.create(slider, {
        start: val,
        range: { min: low, max: high },
        pips: { mode: 'values', values: [low, high], density: 4 }
    });

    var tipHandles = slider.getElementsByClassName('noUi-handle'),
	   tooltips = [];

    // Add divs to the slider handles.I hate how clunky this is. Maybe submit a pr to the repo?
    for ( var i = 0; i < tipHandles.length; i++ ){
    	tooltips[i] = document.createElement('div');
    	tipHandles[i].appendChild(tooltips[i]);
    }

    slider.noUiSlider.on('update', function(values, handle, unencoded){ //what to do when the slider is moved.
        params[loc] = +values
        updateLine(xs, functionName, params)
        tooltips[handle].innerHTML = values[handle];
    })
}

//runs through the parameters and takes the function name to generate the sliders for a given distribution.
function drawSliders(params, functionName){
    params.forEach(function(d,i){
        makeSlider(d.name, d.startVal, d.slideLow, d.slideHigh, functionName, i)
    })
}

function initializeDist(dist){

    d3.selectAll(".variableSlider").remove() //take out the old sliders.

    var entry = theDistributions[dist] //grab the info for the distribution

    y.domain([0, entry.yMax]) //update the scales.
    x.domain(entry.xRange)
    updateAxes()

    var start = entry.xRange[0],
        end = entry.xRange[1];
        step = (end - start)/500
    xs = _.range(start, end + step , step) //redo the xs. Adding a step brings it to the right point because of how range works.
    params = entry.starting; //update the parameters to the distributions.
    drawSliders(entry.paramInfo, entry.equation) //draw the sliders
    updateLine(xs, entry.equation, params)
    newDescription("descrips/" + entry.info)
    MathJax.Hub.Queue(["Typeset",MathJax.Hub,"explain"]);
}

//--------------------------------------------------------------------------------------------------------------
// Now we got all those functions and dirty work out of the way, let's actually kick off the viz.
//--------------------------------------------------------------------------------------------------------------

var lineData = [aLine(xs, flat, params)]

var xAxis = d3.svg.axis()
              .scale(x)
              .ticks(4)
              .orient("bottom");

svg.append("g")
    .attr("transform",  "translate( 0," + (height - 18) +")")
    .attr("class", "axis")
    .attr("id", "xAxis")
    .call(xAxis)

var yAxis = d3.svg.axis()
              .scale(y)
              .ticks(4)
              .orient("left");

svg.append("g")
    .attr("transform",  "translate(" + 25 + "," + 2 +")")
    .attr("class", "axis")
    .attr("id", "yAxis")
    .call(yAxis)

// The actual drawing part:
svg.selectAll(".distribution")
    .data(lineData)
    .enter().append("path")
    .attr("class", "distribution")
    .attr("d", line)
    .style("fill", "none")
    .style("stroke-width", 2)
    .style("stroke", "steelblue");

function changeDescription(txt){
    // d3.select("#explain").html(txt)
    var w =$("#explain").width()
    var h = height + 10
    d3.select("#explain").html("<iframe src = " + txt + " width = " + w + " height =" + h + "></iframe>")
}

function newDescription(f){
    d3.text(f, function(d){
        d3.select("#explain").html(d)
    })

}


//Kick everything off.
window.setTimeout(function(){
    d3.select("#normal").style("color", "steelblue")
    initializeDist("normal")

    d3.selectAll(".distSelect").on("click", function(d){
        initializeDist(d3.select(this).attr("id"))
        d3.selectAll(".distSelect").style("color", "black")
        d3.select(this).style("color", "steelblue")
    })
}, 10)
