//TODO

const margin = { top: 60, right: 60, bottom: 60, left: 80 };

const width = 900 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// SVG container
const svg = d3.select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Load CSV
d3.csv("Daily_Mobility_Statistics_WA_King_County_2020.csv").then(data => {

    const parseTime = d3.timeParse("%Y-%m-%d");

    // clean data
    data.forEach(d => {
        d.date = parseTime(d.date);

        d.stay_home = +d.stay_home.replace(/,/g, "");
        d.not_stay_home = +d.not_stay_home.replace(/,/g, "");
    });

    //sort by date
    data.sort((a, b) => a.date - b.date);

    console.log("Clean data:", data);


    // SCALES
    const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([
            0,
            d3.max(data, d => Math.max(d.stay_home, d.not_stay_home))
        ])
        .nice()
        .range([height, 0]);

 
    // AXES
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y));

  
    // LINE GENERATORS
   
    const lineStayHome = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.stay_home));

    const lineNotStayHome = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.not_stay_home));

    // DRAW LINES

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2.5)
        .attr("d", lineStayHome);

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "tomato")
        .attr("stroke-width", 2.5)
        .attr("d", lineNotStayHome);

    // Legend container (top-right of chart)
const legend = svg.append("g")
    .attr("transform", `translate(${width - 150}, 20)`);

// Blue line legend item
legend.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 12)
    .attr("height", 12)
    .attr("fill", "steelblue");

legend.append("text")
    .attr("x", 20)
    .attr("y", 10)
    .text("Stay Home")
    .style("font-size", "12px")
    .attr("alignment-baseline", "middle");

// Red line legend item
legend.append("rect")
    .attr("x", 0)
    .attr("y", 25)
    .attr("width", 12)
    .attr("height", 12)
    .attr("fill", "tomato");

legend.append("text")
    .attr("x", 20)
    .attr("y", 35)
    .text("Not Stay Home")
    .style("font-size", "12px")
    .attr("alignment-baseline", "middle");

    // TITLE

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -25)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .text("Washington Mobility Trends (King County, 2020)");

    // AXIS LABELS
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 45)
        .attr("text-anchor", "middle")
        .text("Date");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -55)
        .attr("text-anchor", "middle")
        .text("Population");

});



