//TODO

d3.csv("coffee_sales_kaggle.csv").then(data => {

    // Loading data
    console.log("data", data);

    data.forEach(d => {
        d.money = +d.money;
    });

    const maxY = d3. max(data, d => d.money);

    // Declare consts variables
    const width = 800;
    const height = 500;
    const margin = 40;

    // Scales
    const xScale = d3.scaleBand()
    .domain(data.map(d => d.coffee_name))
    .range([margin, width - margin])
    .paddingInner(0.1);

    const yScale = d3.scaleLinear()
    .domain([0, maxY])
    .range([height - margin, margin]);

    // SVG
    const svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

    // Axes
    const bottomAxis = d3.axisBottom()
        .scale(xScale);

    const leftAxis = d3.axisLeft()
        .scale(yScale);


    // Bars
    svg.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", d => xScale(d.coffee_name))
    .attr("y", d => yScale(d.money))
    .attr("width", xScale.bandwidth())
    .attr("height", d => (height - margin) - yScale(d.money))
    .attr("fill", "steelblue")

    // Draw axes
    svg.append("g")
    .attr("transform", "translate(0," + (height - margin) + ")")
    .call(bottomAxis);

  svg.append("g")
    .attr("transform", "translate(" + margin + ",0)")
    .call(leftAxis);






});
