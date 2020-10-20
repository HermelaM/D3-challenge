var svgWidth = 980;
var svgHeight = 600;

var margin = {
  top: 40,
  right: 40,
  bottom: 60,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Import Data
d3.csv("assets/data/data.csv").then(data => {

    // Step 1: Parse Data/Cast as numbers
    // ==============================
    data.forEach(data => {
      data.poverty = +data.poverty;
      data.obesity = +data.obesity;
    });

    // Step 2: Create scale functions
    // ==============================
    var xLinearScale = d3.scaleLinear()
      .domain([8, d3.max(data, d => d.poverty)])
      .range([0, width]);

    var yLinearScale = d3.scaleLinear()
      .domain([20, d3.max(data, d => d.obesity)])
      .range([height, 0]);

    // Step 3: Create axis functions
    // ==============================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Step 4: Append Axes to the chart
    // ==============================
    chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    chartGroup.append("g")
      .call(leftAxis);

    // Step 5: Create Circles
    // ==============================
    var circlesGroup = chartGroup.selectAll(".stateCircle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d.poverty))
    .attr("cy", d => yLinearScale(d.obesity))
    .attr("class", "stateCircle")
    .attr("r", 20)
    .attr("opacity", "1");

  // Append Text to Circles
  var textGroup = chartGroup.selectAll(".stateText")
    .data(data)
    .enter()
    .append("text")
    .attr("x", d => xLinearScale(d.poverty))
    .attr("y", d => yLinearScale(d.obesity))
    .text(d => (d.abbr))
    .attr("class", "stateText")
    .attr("font-size", "12px")
    .attr("text-anchor", "center")
    .attr("fill", "white");


    // Step 6: Initialize tool tip
    function updateToolTip(chosenXAxis, circlesGroup) {

      var label;
    
      if (chosenXAxis === "Poverty") {
        label = "Poverty %:";
      }
      else {
        label = "Obysity:";
      }
    
      var toolTip = d3.tip()
      .attr("class", "tooltip d3-tip")
      .offset([90, 90])
      .html(function(d) {
        return (`<strong>${d.abbr}</strong><br>${xLabel} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}`);
      });

    // Create Circles Tooltip in the Chart
    circlesGroup.call(toolTip);
    // Create Event Listeners to Display and Hide the Circles Tooltip
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data, this);
    })
      // onmouseout Event
      .on("mouseout", function(data) {
        toolTip.hide(data);
      });
    // Create Text Tooltip in the Chart
    textGroup.call(toolTip);
    // Create Event Listeners to Display and Hide the Text Tooltip
    textGroup.on("mouseover", function(data) {
      toolTip.show(data, this);
    })
      // onmouseout Event
      .on("mouseout", function(data) {
        toolTip.hide(data);
      });
    return circlesGroup;
  }

  
  // var circlesGroup = chartGroup.selectAll(".stateCircle")
  //     .data(acsData)
  //     .enter()
  //     .append("circle")
  //     .attr("cx", d => xLinearScale(d[chosenXAxis]))
  //     .attr("cy", d => yLinearScale(d[chosenYAxis]))
  //     .attr("class", "stateCircle")
  //     .attr("r", 15)
  //     .attr("opacity", ".75");

  //   // Append Text to Circles
  //   var textGroup = chartGroup.selectAll(".stateText")
  //     .data(acsData)
  //     .enter()
  //     .append("text")
  //     .attr("x", d => xLinearScale(d[chosenXAxis]))
  //     .attr("y", d => yLinearScale(d[chosenYAxis]*.98))
  //     .text(d => (d.abbr))
  //     .attr("class", "stateText")
  //     .attr("font-size", "12px")
  //     .attr("text-anchor", "middle")
  //     .attr("fill", "white");



    // ==============================
    // var toolTip = d3.tip()
    //   .attr("class", "tooltip")
    //   .offset([80, -60])
    //   .html(d => `${d.state}<br>Hair length: ${d.poverty}<br>Hits: ${d.obesity}`);

    // Step 7: Create tooltip in the chart
    // ==============================
    //chartGroup.call(toolTip);

    // Step 8: Create event listeners to display and hide the tooltip
    // ==============================
    circlesGroup.on("click", function(data) {
      toolTip.show(data, this);
    })
      // onmouseout event
      .on("mouseout", function(data) {
        toolTip.hide(data);
      });

    // Create axes labels
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 40)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("class", "axisText")
      .text("Number of Billboard 100 Hits");

    chartGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
      .attr("class", "axisText")
      .text("Hair Metal Band Hair Length (inches)");
  }).catch(error => console.log(error));
