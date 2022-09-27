function visualize_d3_bar(data, type){
  var margin = {top: 20, right: 130, bottom: 50, left: 75},
    width = 700 - margin.left - margin.right,
    height = 425 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3version4.select("#bar")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");
          
          
          var keys = d3version4.keys(data[0]).slice(1)
     
   var color = d3version4.scaleOrdinal()
   .domain(keys)
   .range(['#191970','#87CEEB','#BDB76B','#B22222']);


   function updateBarChart(data){
  //stack the data?
  var stackedData = d3version4.stack()
    .keys(keys)
    (data)

 //////////
  // AXIS //
  //////////
  svg.selectAll(".axisx").remove();
 

  // Add X axis
  var x = d3version4.scaleLinear()
    .domain(d3version4.extent(data, function(d) { return d.Year; }))
    .range([ 0, width ]);
  var xAxis = svg.append("g")
  .attr("class","axisx")

    .attr("transform", "translate(0," + height + ")")
    //.attr("fill", "black")
    .attr("font-family", "Times New Roman")
    .attr("font-size", "13px")
    .attr("font-weight", "bold")
    .call(d3version4.axisBottom(x).ticks(6))

  // Add X axis label:
  svg.append("text")
       .attr("y", height + 40 )
       .attr("x", width/2)
       .attr("text-anchor", "middle")
       .attr("fill", "black")
       .attr("font-family", "Times New Roman")
       .attr("font-size", "20px")
       .attr("font-weight", "bold")
       .text("Time (year)");


  // Add Y axis label:
  svg.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 70)
  .attr("dy", "-5.5em")
  .attr("x", -150)
  .attr("text-anchor", "middle")
  .attr("fill", "black")
  .attr("font-family", "Times New Roman")
  .attr("font-size", "21px")
  .attr("font-weight", "bold")
  .text("Suicide Death Rates");

  // Add Y axis
total=0;
for (let i = 0; i < keys.length; i++) {
  //console.log(total, keys[i])
  total += d3version4.max(data, function (d) { return d[ keys[i]]; })
} 
  var y = d3version4.scaleLinear()
    .domain([0,total])
    .range([ height, 0 ]);

    svg.selectAll(".axisy").remove();
  svg.append("g")
  .attr("class","axisy")
  .transition()
    .duration(500)
  //.attr("fill", "black")
  .attr("font-family", "Times New Roman")
  .attr("font-size", "13px")
  .attr("font-weight", "bold")
    .call(d3version4.axisLeft(y).ticks(5))



  //////////
  // BRUSHING AND CHART //
  //////////

  // Add a clipPath: everything out of this area won't be drawn.
  var clip = svg.append("defs").append("svg:clipPath")
      .attr("id", "clip")
      .append("svg:rect")
      .attr("width", width )
      .attr("height", height )
      .attr("x", 0)
      .attr("y", 0);

  // Add brushing
  var brush = d3version4.brushX()                 // Add the brush feature using the d3version4.brush function
      .extent( [ [0,0], [width,height] ] ) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
      .on("end", updateChart) // Each time the brush selection changes, trigger the 'updateChart' function

  // Create the scatter variable: where both the circles and the brush take place

  svg.selectAll('.bc').remove();
  var areaChart = svg.append('g')
  .attr("class", "bc")
    .attr("clip-path", "url(#clip)")
    .attr('fill', "none")

  // Area generator
  var area = d3version4.area()
    .x(function(d) { return x(d.data.Year); })
    .y0(function(d) { return y(d[0]); })
    .y1(function(d) { return y(d[1]); })

  // Show the areas
  //console.log(areaChart.selectAll("mylayers"));

  areaChart
    .selectAll("mylayers")
    .data(stackedData)
    .enter()
    .append("path")
      .attr("class", function(d) { return  "myArea " + d.key })
      .transition()
      .ease(d3version4.easeExp)
      .duration(1000)
      .style("fill", function(d) { return color(d.key); })
      .attr("d", area)

     // console.log(areaChart.selectAll("path").attr("class"));
  // Add the brushing
  areaChart
    .append("g")
      .attr("class", "brush")
      .call(brush);



    //////////
    // HIGHLIGHT GROUP //
    //////////

    // What to do when one group is hovered
    var highlight = function(d){
      // reduce opacity of all groups
      d3version4.selectAll(".myArea").style("opacity", .1)
      // expect the one that is hovered
      //const first = '70+ years';
      //console.log(first);
      d3version4.select("."+d).style("opacity", 1)
    }

    // And when it is not hovered anymore
    var noHighlight = function(d){
      d3version4.selectAll(".myArea").style("opacity", 1)
    }

    //////////
    // LEGEND //
    //////////

    // Add one dot in the legend for each name.
    var size = 20
    svg.selectAll("myrect")
      .data(keys)
      .enter()
      .append("rect")
        .attr("x", 500)
        .attr("y", function(d,i){ return 10 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("width", size)
        .attr("height", size)
        .style("fill", function(d){ return color(d)})
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)

    // Add one dot in the legend for each name.
    svg.selectAll("mylabels")
      .data(keys)
      .enter()
      .append("text")
        .attr("x", 500 + size*1.2)
        .attr("y", function(d,i){ return 10 + i*(size+5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", function(d){ return color(d)})
        .attr("font-weight", "bold")
        .text(function(d){ return d})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)
        var idleTimeout
  function idled() { idleTimeout = null; }

  // A function that update the chart for given boundaries
  function updateChart() {

    extent = d3version4.event.selection

    // If no selection, back to initial coordinate. Otherwise, update X axis domain
    if(!extent){
      if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
      x.domain(d3version4.extent(data, function(d) { return d.Year; }))
    }else{
      x.domain([ x.invert(extent[0]), x.invert(extent[1]) ])
      areaChart.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
    }

    // Update axis and area position
    xAxis.transition().duration(1000).call(d3version4.axisBottom(x).ticks(6))
    areaChart
      .selectAll("path")
      .transition().duration(1000)
      .attr("d", area)
    }

}
updateBarChart(data);

worldMapTrigger2.registerListener(function(val) {
  worldMapTrigger3.a = worldmap_country 
  $(document).ready(function() {
      $.ajax({
          type: "POST",
          url: "/getBarPlot",
          contentType: "application/json",
          data: JSON.stringify(worldmap_country),
          dataType: "json",
          success: function(response) {
              bardata = (response)
              updateBarChart(bardata)
          },
          error: function(err) {
              console.log(err);
          }
      });
  });
});
            
   
}