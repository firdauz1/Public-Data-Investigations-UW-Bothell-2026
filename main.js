//TODO

// SVG Setup
const margin = { top: 30, right: 30, bottom: 130, left: 90 };

const width = 1050 - margin.left - margin.right;
const height = 560 - margin.top - margin.bottom;

const svg = d3.select("#chart")
  .attr("viewBox", `0 0 1050 560`);

const chart = svg.append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Scales
const xScale = d3.scaleBand()
  .range([0, width])
  .padding(0.2);

const yScale = d3.scaleLinear()
  .range([height, 0]);

// Axis Groups
const xAxisGroup = chart.append("g")
  .attr("transform", `translate(0,${height})`);

const yAxisGroup = chart.append("g");

// Axis Labels
chart.append("text")
  .attr("class", "axis-label")
  .attr("x", width / 2)
  .attr("y", height + 95)
  .attr("text-anchor", "middle")
  .text("Census Tract");

const yLabel = chart.append("text")
  .attr("class", "axis-label")
  .attr("transform", "rotate(-90)")
  .attr("x", -height / 2)
  .attr("y", -65)
  .attr("text-anchor", "middle");

// Tooltip
const tooltip = d3.select("#tooltip");

let rentData;
let sorted = false;

// Load CSV
d3.csv("seattle_rent_prices.csv").then(data => {

  data.forEach(d => {
  d["Tract Median Apartment Contract Rent per Unit"] =
    +String(d["Tract Median Apartment Contract Rent per Unit"]).replace(/[$,]/g, "");

  d["Tract Median Apartment Contract Rent per Square Foot"] =
    +String(d["Tract Median Apartment Contract Rent per Square Foot"]).replace(/[$,]/g, "");

  d["Year over Year Change in Rent per Unit"] =
    +String(d["Year over Year Change in Rent per Unit"]).replace(/[$,]/g, "");

  d["Year over Year Change in Rent per Square Foot"] =
    +String(d["Year over Year Change in Rent per Square Foot"]).replace(/[$,]/g, "");
});

  // Filter 2024 data
  rentData = data
    .filter(d => d.Year == 2024)
    .filter(d => !isNaN(d["Tract Median Apartment Contract Rent per Unit"]))
    .slice(0, 25);
  updateChart("Tract Median Apartment Contract Rent per Unit");


});

// Update Function
function updateChart(metric) {

  let displayData = [...rentData];

  // Sort if button active
  if (sorted) {

    displayData.sort((a, b) =>
      d3.descending(a[metric], b[metric])
    );

  }

  // Domains
  xScale.domain(
    displayData.map(d => d["Tract Label"] || d["GEOID"])
  );

  yScale.domain([
    Math.min(0, d3.min(displayData, d => d[metric])),
    d3.max(displayData, d => d[metric])
  ]).nice();

  // X Axis
  xAxisGroup
    .transition()
    .duration(800)
    .call(d3.axisBottom(xScale))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  // Y Axis
  yAxisGroup
    .transition()
    .duration(800)
    .call(d3.axisLeft(yScale));

  // Y Label
  yLabel.text(metric);

  // Bars
  const bars = chart.selectAll(".bar")
    .data(displayData, d => d["GEOID"]);

  // Enter
  bars.enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => xScale(d["Tract Label"] || d["GEOID"]))
    .attr("y", yScale(0))
    .attr("width", xScale.bandwidth())
    .attr("height", 0)

    // Tooltip
    .on("mouseover", function(event, d) {

      tooltip
        .style("opacity", 1)
        .html(`
        <strong>${d["Tract Label"] || d["GEOID"]}</strong><br>
        Community: ${d["Community Reporting Area Name"] || "N/A"}<br>
         Year: ${d["Year"]}<br>
        Rent per Unit: $${d["Tract Median Apartment Contract Rent per Unit"]}<br>
        Rent per Sq. Ft.: $${d["Tract Median Apartment Contract Rent per Square Foot"]}<br>
        YoY Change per Unit: $${d["Year over Year Change in Rent per Unit"]}<br>
        YoY Change per Sq. Ft.: $${d["Year over Year Change in Rent per Square Foot"]}
`);


    })

    .on("mousemove", function(event) {

      tooltip
        .style("left", event.pageX + 15 + "px")
        .style("top", event.pageY - 25 + "px");

    })

    .on("mouseout", function() {

      tooltip.style("opacity", 0);

    })

    // Merge + Transition
    .merge(bars)

    .transition()
    .duration(900)
    .ease(d3.easeCubicOut)

    .attr("x", d => xScale(d["Tract Label"] || d["GEOID"]))

    .attr("y", d =>
      d[metric] >= 0
        ? yScale(d[metric])
        : yScale(0)
    )

    .attr("width", xScale.bandwidth())

    .attr("height", d =>
      Math.abs(yScale(d[metric]) - yScale(0))
    );

  // Exit
  bars.exit().remove();

}

// Dropdown Event
d3.select("#metric").on("change", function () {

  updateChart(this.value);

});

// Button Event
d3.select("#sortButton").on("click", function () {

  sorted = !sorted;

  this.textContent = sorted
    ? "Return to Original Order"
    : "Sort High to Low";

  updateChart(
    d3.select("#metric").property("value")
  );

});