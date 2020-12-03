// Part 1: In-meeting activity

var svg = d3.select("#chart-area1")
    .append("svg")
    .attr("width", 800)
    .attr("height", 200)
    .append("g");

var textLine = svg.append("text")
    .attr("x", 20)
    .attr("y", 100)
    .text("Orders");

let width = 700,
    height = 500;
let data;
let margin = {top: 30, right: 30, left: 30, bottom: 50};
width -= margin.left + margin.right;
height -= margin.bottom + margin.top;

let svg2 = d3.select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("id", "#chart-area2")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function updateVisualization(orders) {
    // console.log(orders);

    // Step 1: Append new circles for new orders
    // The color of the circle should be brown for coffee orders and green for tea
    // Radius should vary with the price
    let circles = svg.selectAll("circle").data(orders);

    circles.enter()
        .append("circle")
        .merge(circles)
        .attr("fill", function(d) {
            if (d.product === "coffee") {
                return "brown";
            } else {
                return "green";
            }
        })
        .attr("r", function (d) {
            return 20 * d.price;
        })
        .attr("cx", function(d, i) {
            return (i * 150) + 200;
        })
        .attr("cy", 100);

    // Step 2: Delete elements that have been removed from orders
    circles.exit().remove();

    // Step 3: Update the text label
    textLine.text("Orders " + orders.length);
}

// Part 2: Assignment - Synthesis of everything we've learned!

loadData();

d3.select("#ranking-type").on("change", updateBarChart);

// Create a 'data' property under the window object
// to store the coffee chain data

Object.defineProperty(window, 'data', {
    // data getter
    get: function() { return _data; },
    // data setter
    set: function(value) {
        _data = value;
        // update the visualization each time the data property is set by using the equal sign (e.g. data = [])
        updateBarChart();
    }
});

// Step 1: Define an SVG drawing area with our margin conventions. Append
// the drawing area to the div with id chart-area2

// Step 2: Create scales for x and y.
// Hint: You should use scaleBand() for x. What should you use for y?
// document.querySelector("#ranking-type").value;

function loadData() {
    d3.csv("data/coffee-house-chains.csv", function(error, csv) {

        // Step 3: Get the data ready: change numeric fields to being numbers!
        csv.forEach(function(d) {
            d.stores = +d.stores;
            d.revenue = +d.revenue;
        });
        // Store csv data in global variable
        data = csv;

        // updateVisualization gets automatically called within the data = csv call;
        // basically(whenever the data is set to a value using = operator);
        // see the definition above: Object.defineProperty(window, 'data', { ...
    });
}

// Render visualization
function updateBarChart() {

    // get ranking-type option from the form
    let rankingType = document.querySelector("#ranking-type").value;
    console.log(rankingType);

    // sort data based on selected ranking type
    data.sort(function (d1, d2) {
        return +d2[rankingType] - d1[rankingType];
    });
    console.log(data);

    // create scales appropriate to the ranking type
    let x = d3.scaleBand()
        .domain(data.map(function (d) {
            return d.company;
        }))
        .range([0, width]);

    let y = d3.scaleLinear()
        .domain(d3.extent(data, function (d) {
            return d[rankingType];
        }))
        .range([height, 0]);

    // generate axes with transitions
    let yAxis = d3.axisLeft()
        .scale(y);

    svg2.append("g")
        .attr("class", "y-axis axis");

    svg2.select(".y-axis")
        .transition()
        .duration(1000)
        .call(yAxis);

    let xAxis = d3.axisBottom()
        .scale(x);

    svg2.append("g")
        .attr("class", "x-axis axis");

    svg2.select(".x-axis")
        .transition()
        .duration(1000)
        .call(xAxis)
        .attr("transform", "translate(0," + height + ")");

    // add rectangles
    let rects = svg2.selectAll("rect").data(data);

    // update rectangles based on form selection
    // transition rectangles
    rects.enter()
        .append("rect")
        .merge(rects)
        .attr("class", "bar")
        .transition()
        .duration(500)
        .attr("x", function (d) {
            return x(d.company);
        })
        .attr("y", function (d) {
            return y(d[rankingType]);
        })
        .attr("width", x.bandwidth())
        .attr("height", function (d) {
            return height - y(d[rankingType]);
        });
    rects.exit().remove();
}