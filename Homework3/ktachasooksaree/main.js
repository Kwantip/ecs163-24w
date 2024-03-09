// Dimensions
const margin = { top: 50, right: 40, bottom: 50, left: 40 };
const width = window.innerWidth - margin.left - margin.right;
const height = window.innerHeight - margin.top - margin.bottom;

let barLeft = 75, barTop = 400;
let barMargin = {top: 10, right: 30, bottom: 30, left: 60},
    barWidth = width - barMargin.left - barMargin.right,
    barHeight = height/2;

let scatterLeft = 0, scatterTop = 0;
let scatterMargin = { top: 10, right: 30, bottom: 30, left: 60 },
    scatterWidth = width / 2 - scatterMargin.left - scatterMargin.right,
    scatterHeight = height / 2 - scatterMargin.top - scatterMargin.bottom;

let pieLeft = scatterWidth, pieTop = 20;
let pieMargin = { top: 10, right: 30, bottom: 30, left: 60 },
    pieWidth = width / 2 - pieMargin.left - pieMargin.right,
    pieHeight = height / 2 - pieMargin.top - pieMargin.bottom;

// Colors
const generationColors = {
    gen1: "#1f77b4",
    gen2: "#ff7f0e",
    gen3: "#2ca02c",
    gen4: "#d62728",
    gen5: "#9467bd",
    gen6: "#8c564b"
};

d3.csv("data/pokemon_alopez247.csv").then(rawData =>{
    // SVG
    const svg = d3.select("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom);

    // Plot 1 - Stacked bar chart
    // Transformed data structure
    const nestedData = d3.nest()
                         .key(d => d.Body_Style)
                         .entries(rawData);

    // Transformed data structure
    const data = nestedData.map(group => ({
        bodyType: group.key,
        gen1: group.values.filter(d => d.Generation === '1').length,
        gen2: group.values.filter(d => d.Generation === '2').length,
        gen3: group.values.filter(d => d.Generation === '3').length,
        gen4: group.values.filter(d => d.Generation === '4').length,
        gen5: group.values.filter(d => d.Generation === '5').length,
        gen6: group.values.filter(d => d.Generation === '6').length
    }));

    const g1 = svg.append("g")
                  .attr("width", barWidth + barMargin.left + barMargin.right)
                  .attr("height", barHeight)
                  .attr("transform", `translate(${barMargin.left}, ${barTop})`);

    // Transpose the data into layers
    const keys = Object.keys(data[0]).slice(1);
    const stackedData = d3.stack()
                          .keys(keys)
                          (data)
                          .map((d, i) => (d.forEach(v => v.key = keys[i]), d));

    // X scale
    const x = d3.scaleBand()
                .domain(data.map(d => d.bodyType))
                .range([0, width])
                .padding(0.1);

    // Y scale
    const y = d3.scaleLinear()
                .domain([0, d3.max(stackedData[stackedData.length - 1], d => d[1])])
                .nice()
                .range([barHeight, 0]);

    // Color scale
    const color = d3.scaleOrdinal()
                    .domain(keys)
                    .range(Object.values(generationColors));
    
    // Draw bars
    const bars = g1.selectAll(".bar")
                   .data(stackedData)
                   .enter().append("g")
                   .attr("fill", d => color(d.key))
                   .selectAll("rect")
                   .data(d => d)
                   .enter().append("rect")
                   .attr("class", "bar")
                   .attr("x", d => x(d.data.bodyType))
                   .attr("y", d => y(d[1]))
                   .attr("height", d => y(d[0]) - y(d[1]))
                   .attr("width", x.bandwidth())
                   .on("mouseover", function() {
                        d3.select(this)
                            .attr("opacity", 0.7);
                   })
                   .on("mouseout", function() {
                        d3.select(this)
                            .attr("opacity", 1);
                   })
                   .on("click", updateBar)
                   .append("title")
                   .text(d => `Generation ${d.key.replace("gen", "")}: ${d[1] - d[0]}`);

    console.log(nestedData);
    // X axis
    g1.append("g")
      .attr("transform", `translate(0,${barHeight})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("y", 0)
      .attr("x", 9)
      .attr("dy", ".35em")
      .attr("transform", "rotate(45)")
      .style("text-anchor", "start");

    // Y axis
    g1.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y).ticks(null, "s"))
      .append("text")
      .attr("x", barWidth/2)
      .attr("y", y(y.ticks().pop()) + 0.5)
      .attr("dy", "-1em")
      .attr("fill", "#000")
      .attr("font-weight", "bold")
      .attr("text-anchor", "middle")
      .attr("font-size", "24px")
      .text("Pokemon Distributed by Body Type and Selectable by Generation");

    // Subtitle
    g1.append("text")
      .attr("class", "subtitle")
      .attr("x", barWidth / 2)
      .attr("y", y(y.ticks().pop()) + 0.5)
      .attr("dy", "0.25em")
      .attr("fill", "#666")
      .attr("font-size", "16px")
      .attr("text-anchor", "middle")
      .style("font-family", "Arial")
      .text("Hover or click the bar for more information.");

    // Legend
    legend = g1.append("g")
                     .attr("class", "legend")
                     .attr("transform", `translate(${barWidth + barMargin.right - 100},${barMargin.top})`);

    legendItems = legend.selectAll(".legend-item")
                              .data(keys)
                              .enter().append("g")
                              .attr("class", "legend-item")
                              .attr("transform", (d, i) => `translate(0, ${i * 20})`)

    legendItems.append("rect")
               .attr("x", 0)
               .attr("y", 10)
               .attr("width", 15)
               .attr("height", 15)
               .attr("fill", color);

    legendItems.append("text")
               .attr("x", 20)
               .attr("y", 10)
               .attr("dy", "0.75em")
               .style("font-family", "Arial")
               .text(d => {
                    switch (d) {
                        case "gen1":
                            return "Generation 1";
                        case "gen2":
                            return "Generation 2";
                        case "gen3":
                            return "Generation 3";
                        case "gen4":
                            return "Generation 4";
                        case "gen5":
                            return "Generation 5";
                        case "gen6":
                            return "Generation 6";
                        default:
                            return "";
                   }
                });

    // Add a back button
    g1.append("rect")
       .attr("class", "back")
       .attr("x", 10)
       .attr("y", -20)
       .attr("width", 60)
       .attr("height", 30)
       .attr("fill", "lightgray")
       .attr("rx", 5)
       .attr("ry", 5)
       .on("click", resetView);
    g1.append("text")
      .attr("class", "backLabel")
      .attr("x", 25)
      .attr("y", 0)
      .attr("fill", "black")
      .text("Back")
      .on("click", resetView);

    // X axis label for the stacked bar chart
    g1.append("text")
      .attr("class", "x-axis-label")
      .attr("x", barWidth / 2)
      .attr("y", barHeight + barMargin.bottom - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Body Type");

    // Y axis label for the stacked bar chart
    g1.append("text")
      .attr("class", "y-axis-label")
      .attr("transform", "rotate(-90)")
      .attr("x", -barHeight / 2)
      .attr("y", -barMargin.left + 10)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Number of Pokémon");
    
    g1.select(".back").style("display", "none");
    g1.select(".backLabel").style("display", "none");

    function updateBar(d) {
        // Filter data for the selected generation
        const newData = data.map(item => ({
            bodyType: item.bodyType,
            count: item[d.key],
            color: color(d.key)
        }));
        
        // Update Y scale domain
        y.domain([0, d3.max(newData, d => d.count)]);
        
        // Update Y axis
        g1.select(".y-axis")
            .transition()
            .duration(500)
            .call(d3.axisLeft(y).ticks(null, "s"));
        
        // Update bars
        const bars = g1.selectAll(".bar")
                        .data(newData, d => d.bodyType)
                        .on("mouseover", function() {
                            d3.select(this)
                                .attr("opacity", 0.7);
                        })
                        .on("mouseout", function() {
                            d3.select(this)
                                .attr("opacity", 1);
                        });
    
        // Remove old bars
        bars.exit().remove();
    
        // Enter new bars
        bars.enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.bodyType))
            .attr("y", barHeight)
            .attr("width", x.bandwidth())
            .merge(bars)
            .transition()
            .duration(500)
            .attr("y", d => y(d.count))
            .attr("height", d => barHeight - y(d.count))
            .attr("fill", d => d.color);
    
        // Change the subtitle to reflect the generation selected
        g1.select(".subtitle")
          .text(`Generation ${d.key.replace("gen", "")}`);
        
        // Show back button
        g1.select(".back").style("display", "block");
        g1.select(".backLabel").style("display", "block");

        // Hide the legend
        g1.select(".legend").style("display", "none");
    }
                       
    function resetView() {
        // Reset the Y scale domain to include all generations
        y.domain([0, d3.max(stackedData[stackedData.length - 1], d => d[1])]);
    
        // Update Y axis
        g1.select(".y-axis")
          .transition()
          .duration(500)
          .call(d3.axisLeft(y).ticks(null, "s"));
    
        // Remove non-stacked bars
        g1.selectAll(".bar")
          .remove();
    
        // Rebind data to bars
        const bars = g1.selectAll(".bar")
                       .data(stackedData)
                       .enter().append("g")
                       .attr("fill", d => color(d.key))
                       .selectAll("rect")
                       .data(d => d)
                       .enter().append("rect")
                       .attr("class", "bar")
                       .attr("x", d => x(d.data.bodyType))
                       .attr("y", d => y(d[1]))
                       .attr("height", d => y(d[0]) - y(d[1]))
                       .attr("width", x.bandwidth())
                       .on("mouseover", function() {
                           d3.select(this)
                               .attr("opacity", 0.7);
                       })
                       .on("mouseout", function() {
                           d3.select(this)
                               .attr("opacity", 1);
                       })
                       .on("click", updateBar)
                       .append("title")
                       .text(d => `Generation ${d.key.replace("gen", "")}: ${d[1] - d[0]}`);
    
        // Update title text for all bars
        g1.selectAll("title")
          .text(d => `Generation ${d.key.replace("gen", "")}: ${d[1] - d[0]}`);
    
        // Reset the subtitle
        g1.select(".subtitle")
          .text("Hover or click the bar for more information");
    
        // Hide the back button
        g1.selectAll(".back").style("display", "none");
        g1.selectAll(".backLabel").style("display", "none");

        // Show the legend
        g1.select(".legend").style("display", "block");
    }
    
    // Plot 2 - Scatter plot
    // Data processing
    rawData.forEach(function(d) {
        d.HP = Number(d.HP);
        d.Attack = Number(d.Attack);
        d.Defense = Number(d.Defense);
    });

    const g2 = svg.append("g")
                  .attr("width", scatterWidth + scatterMargin.left + scatterMargin.right)
                  .attr("height", scatterHeight + scatterMargin.top + scatterMargin.bottom)
                  .attr("transform", `translate(${scatterMargin.left}, ${scatterMargin.top + 30})`);

    // Create scales for x and y axes
    let xScale = d3.scaleLinear()
                   .domain([0, d3.max(rawData, d => d.HP)])
                   .range([0, scatterWidth]);

    let yScale = d3.scaleLinear()
                   .domain([0, d3.max(rawData, d => d.Attack)])
                   .range([scatterHeight, 0]);

    // Create x and y axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // Append axes to the scatter plot group
    const xAxisGroup = g2.append("g")
                         .attr("class", "x-axis")
                         .attr("transform", `translate(0,${scatterHeight})`)
                         .call(xAxis);

    const yAxisGroup = g2.append("g")
                         .attr("class", "y-axis")
                         .call(yAxis);

    // Add circles for each data point
    const circles = g2.selectAll("circle")
                      .data(rawData)
                      .enter().append("circle")
                      .attr("class", "dot")
                      .attr("cx", d => xScale(d.HP))
                      .attr("cy", d => yScale(d.Attack))
                      .attr("r", 3)
                      .style("fill", d => color(d.Generation));

    // Add tooltips to circles
    circles.append("title")
           .text(d => d.Name); // Display Pokémon name as tooltip

    // Add a title to the scatter plot
    g2.append("text")
      .attr("class", "title")
      .attr("x", scatterWidth / 2)
      .attr("y", scatterMargin.top - 20)
      .attr("font-weight", "bold")
      .attr("text-anchor", "middle")
      .style("font-size", "24px")
      .style("font-family", "Arial")
      .text("Pokemon HP vs. Attack");

    // Subtitle
    g2.append("text")
      .attr("class", "subtitle")
      .attr("x", scatterWidth / 2)
      .attr("y", y(y.ticks().pop()) + 0.5)
      .attr("dy", "0.25em")
      .attr("fill", "#666")
      .attr("font-size", "16px")
      .attr("text-anchor", "middle")
      .style("font-family", "Arial")
      .text("Scroll to change the viewport. Hover over dot for Pokemon name.");

    // X axis label for the scatter plot
    g2.append("text")
      .attr("class", "x-axis-label")
      .attr("x", scatterWidth / 2)
      .attr("y", scatterHeight + scatterMargin.bottom - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("HP");

    // Y axis label for the scatter plot
    g2.append("text")
      .attr("class", "y-axis-label")
      .attr("transform", "rotate(-90)")
      .attr("x", -scatterHeight / 2)
      .attr("y", -scatterMargin.left + 10)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Attack");

    // Define the zoom behavior
    const zoom = d3.zoom()
                   .scaleExtent([1, 10])
                   .extent([[0, 0], [scatterWidth, scatterHeight]])
                   .on("zoom", zoomed);

    // Apply zoom behavior to the entire SVG container
    svg.call(zoom);

    // Function to handle zooming
    function zoomed() {
        // Get the new scale after zooming
        const newXScale = d3.event.transform.rescaleX(xScale);
        const newYScale = d3.event.transform.rescaleY(yScale);

        // Update axes with new scale
        xAxisGroup.call(xAxis.scale(newXScale));
        yAxisGroup.call(yAxis.scale(newYScale));

        // Update circles with new scale and hide those outside the viewport
        circles.attr("cx", d => {
            const cx = newXScale(d.HP);
            return cx >= 0 && cx <= scatterWidth ? cx : -1000; // Set to a value outside the viewport
        })
        .attr("cy", d => {
            const cy = newYScale(d.Attack);
            return cy >= 0 && cy <= scatterHeight ? cy : -1000; // Set to a value outside the viewport
        });
    }

    // Add a button for zooming out
    const zoomOutButton = svg.append("text")
                             .attr("x", scatterWidth - 10)
                             .attr("y", scatterHeight + scatterMargin.top + 20)
                             .attr("text-anchor", "end")
                             .style("cursor", "pointer")
                             .text("Reset Viewport")
                             .on("click", zoomOut);

    // Function to handle zooming out
    function zoomOut() {
        svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity);
    }

    // Plot 3 - Pie chart
    const g3 = svg.append("g")
                  .attr("transform", `translate(${pieLeft}, ${pieTop})`);

    q = rawData.reduce((s, { Color }) => (s[Color] = (s[Color] || 0) + 1, s), {});
    r = Object.entries(q).map(([Color, count]) => ({ Color, count }));

    const radius = Math.min(pieWidth, pieHeight) / 2;

    const pieChart = g3.append("g")
                       .attr("transform", `translate(${pieWidth/2}, ${pieHeight/2 + 25})`);

    const arc = d3.arc()
                  .innerRadius(0)
                  .outerRadius(radius);

    const pieLayout = d3.pie().value(d => d.count);
    const arcs = pieChart.selectAll(".arc")
                         .data(pieLayout(r))
                         .enter()
                         .append("g")
                         .attr("class", "arc");

    arcs.append("path")
        .attr("d", arc)
        .attr("fill", d => d.data.Color)
        .attr("stroke", "white")
        .style("stroke-width", "1px")
        .style("opacity", 0.7)
        .on("mouseover", function(d) {
            d3.select(this)
                .style("opacity", 1);
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`${d.data.Color}: ${d.data.count}`)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            d3.select(this)
                .style("opacity", 0.7);
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
    
    // Add a tooltip div
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Add a legend
    legend = g3.selectAll(".legend")
               .data(r)
               .enter()
               .append("g")
               .attr("class", "legend")
               .attr("transform", (d, i) => `translate(0, ${i * 20 + 10})`);

    legend.append("rect")
          .attr("x", pieWidth + 10)
          .attr("width", 18)
          .attr("height", 18)
          .style("fill", d => d.Color)
          .style("stroke", "black")
          .style("stroke-width", "1px");

    legend.append("text")
          .attr("x", pieWidth + 34)
          .attr("y", 9)
          .attr("dy", ".35em")
          .style("text-anchor", "start")
          .text(d => d.Color);

    // Add a title
    g3.append("text")
      .attr("x", pieWidth / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .attr("font-size", "24px")
      .attr("font-family", "Arial")
      .attr("font-weight", "bold")
      .text("Pokemon Distribution by Color");

}).catch(function(error){
    console.log(error);
});