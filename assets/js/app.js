var svgWidth = 800;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

  // Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Initial Params
var chosenXAxis = "poverty";
//var chosenYAxis = "obesity";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
      d3.max(data, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

    var label;
  
    if (chosenXAxis === "Poverty") {
      label = "Poverty %:";
    }
    else {
      label = "Obesity:";
    }
    
  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(d => `${d.abbr}<br>${label} ${d[chosenXAxis]}`);

    // circlesGroup.on("mouseover", function(data) {
    //   toolTip.show(data);
    // })
    // // // onmouseout event
    // // .on("mouseout", function(data) {
    // //   toolTip.hide(data);
    // // });

  circlesGroup.call(toolTip);

  return circlesGroup;
}

// Import Data
d3.csv("assets/data/data.csv").then(data => {

    // Step 1: Parse Data/Cast as numbers
    // ==============================
    data.forEach(data => {
      data.poverty = +data.poverty;
      data.obesity = +data.obesity;
      data.income = +data.income;
    });

    // Create xscale functions
    var xLinearScale = xScale(data, chosenXAxis);

    // Create xscale functions
    var yLinearScale = d3.scaleLinear()
    .domain([20, d3.max(data, d => d.obesity)])
    .range([height, 0]);

    // Create axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    //  Append Axes to the chart
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    var yAxis = chartGroup.append("g")
      .classed("y-axis", true)
      .call(leftAxis);

    // chartGroup.append("g")
    //   .call(leftAxis);

    // Create Circles
    var circlesGroup = chartGroup.selectAll("stateCircle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.obesity))
    .attr("class", "stateCircle")
    .attr("r", 20)
    .attr("opacity", "1");

  // Append Text to Circles
  var textGroup = chartGroup.selectAll(".stateText")
    .data(data)
    .enter()
    .append("text")
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d.obesity))
    .text(d => (d.abbr))
    .attr("class", "stateText")
    .attr("font-size", "12px")
    .attr("text-anchor", "middle")
    .attr("fill", "white");

    // Create group for two x-axis labels
  var labelsGroup = chartGroup.append("g")
  .attr("transform", `translate(${width / 2}, ${height + 20})`);

var povertyLabel = labelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 20)
  .attr("value", "poverty") // value to grab for event listener
  .classed("active", true)
  .text("Poverty(%)");

var incomeLabel = labelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 40)
  .attr("value", "income") // value to grab for event listener
  .classed("inactive", true)
  .text("Income");

// append y axis
chartGroup.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 0 - margin.left)
  .attr("x", 0 - (height / 2))
  .attr("dy", "1em")
  .classed("axis-text", true)
  .text("Obesity (%)");

 // updateToolTip function above csv import
 var circlesGroup = updateToolTip(chosenXAxis, circlesGroup, textGroup);

 // x axis labels event listener
 labelsGroup.selectAll("text")
   .on("click", function() {
     // get value of selection
     var value = d3.select(this).attr("value");
     if (value !== chosenXAxis) {

       // replaces chosenXAxis with value
       chosenXAxis = value;

       // updates x scale for new data
       xLinearScale = xScale(data, chosenXAxis);

       // updates x axis with transition
       xAxis = renderAxes(xLinearScale, xAxis);

       // updates circles with new x values
       circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale);

        // Updates Text with New Values
        textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale);

       // updates tooltips with new info
       circlesGroup = updateToolTip(chosenXAxis, circlesGroup, textGroup);

       // changes classes to change bold text
       if (chosenXAxis === "poverty") {
        incomeLabel
           .classed("active", true)
           .classed("inactive", false);
           povertyLabel
           .classed("active", false)
           .classed("inactive", true);
       }
       else {
        incomeLabel
           .classed("active", false)
           .classed("inactive", true);
           povertyLabel
           .classed("active", true)
           .classed("inactive", false);
       }
     }
   });
}).catch(error => console.log(error));



