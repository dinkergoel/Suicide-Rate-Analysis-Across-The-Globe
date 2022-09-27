function visualize_d3_scatter(scatter_data, type){
  //console.log(scatter_data)
          var margin = { top: 20, right: 40, bottom: 50, left: 50 },
              width = 600 - margin.left - margin.right,
              height = 425 - margin.top - margin.bottom,
              margin2 = {top: 430, right: 20, bottom: 30, left: 40},
              height2 = 500 - margin2.top - margin2.bottom - 20;
          
          var svg = d3version4.select('#scatterPlot').append('svg')
              .attr('width', width + margin.left + margin.right)
              .attr('height', height + margin.top + margin.bottom);
      
          var g =  svg.append('g')
              .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
  
    function updateScatter(data){     
      //Define the x and y axis (ranges and scales)   
      var x = d3version4.scaleLinear()
          .domain([0, d3version4.max(scatter_data, function (d) {
          return d.Male_suicide_rate;
           }) + 10]).range([0, width ]);
      var y = d3version4.scaleLinear()
         .domain([0, d3version4.max(scatter_data, function (d) {
             return d.Male_suicide_rate;
          }) + 10 ])
         .range([height , 0]);
       
              
          //Draw the X axis        
          g.append("g")
          .attr("transform", "translate(0," + height + ")")
          .style('stroke-width', '2px')
          .attr("fill", "black")
          .attr("font-family", "Times New Roman")
          .attr("font-size", "15px")
          .attr("font-weight", "bold")
          .call(d3version4.axisBottom(x).ticks(10))
          
          .selectAll("text")
          .attr("transform", "rotate(-45)")
          .style("text-anchor", "end")

        //Draw X-axis label
        g.append("text")
        .attr("y", height + 40 )
        .attr("x", width/2)
        .attr("text-anchor", "middle")
        .attr("fill", "black")
        .attr("font-family", "Times New Roman")
        .attr("font-size", "20px")
        .attr("font-weight", "bold")
        .text("Female suicide rate");
        
    //Draw Y-axis   
    g.append("g")
        .attr("transform", "translate(0, 0)")
        .style('stroke-width', '2px')
        .attr("fill", "black")
        .attr("font-family", "Times New Roman")
        .attr("font-size", "15px")
        .attr("font-weight", "bold")
        .call(d3version4.axisLeft(y).ticks(10))
        .selectAll('text')
        .style("text-anchor", "end")

    //Draw Y-axis label  
    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 75)
        .attr("dy", "-5.5em")
        .attr("x", -150)
        .attr("text-anchor", "middle")
        .attr("fill", "black")
        .attr("font-family", "Times New Roman")
        .attr("font-size", "20px")
        .attr("font-weight", "bold")
        .text("Male Suicide Rate");
          
        g.append("text")
        .attr("y", -5 )
        .attr("x", width/2 + 150)
        .attr("text-anchor", "middle")
        .attr("fill", "black")
        .attr("font-family", "Times New Roman")
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .text("Bubble Size: Population Size");

          //Draw diagonal Line   
          g.append("line")
              .attr("x1", x(0))
              .attr("y1", y(0))
              .attr("x2", x(d3version4.max(scatter_data, function (d) {
                return d.Male_suicide_rate;
                 }) + 10)) //function (d) { return x(d.Female_suicide_rate); } )
              .attr("y2", y(d3version4.max(scatter_data, function (d) {
                return d.Male_suicide_rate;
                 }) + 10)) //function (d) { return y(d.Male_suicide_rate); } )
              .attr("stroke-width", 2)
              .attr("stroke", "black")
              .attr("stroke-dasharray", "5,5");  //style of svg-line;
          
              
          
          const distinctValues = [...new Set(scatter_data.map((d) => d.Entity))]
          var z = d3version4.scaleSqrt()
              .domain([3, 30000000])// 30000000])
              .range([ 4, 30]);
          //console.log(distinctValues)
            // Add a scale for bubble color
          var myColor = d3version4.scaleOrdinal()
              .domain(distinctValues) //"Asia", "Europe", "Americas", "Africa", "Oceania"])
              .range(colorbrewer.RdBu[10]);

         
          
            // -2- Create 3 functions to show / update (when mouse move but stay on same circle) / hide the tooltip
          var showTooltip = function(d) {
              tooltip
                .transition()
                .duration(200)
              tooltip
                .style("opacity", 1)
                .html("Country: " + d.Entity + "<br>Male:" + Math.trunc(d.Male_suicide_rate) + "<br>Female:" + Math.trunc(d.Female_suicide_rate))
                .style("right", (d3version4.mouse(this)[0]) + "px")
                .style("bottom", (d3version4.mouse(this)[1]) + "px")
                .style("left", (d3version4.mouse(this)[2]) + "px")
                .style("top", (d3version4.mouse(this)[3]) + "px")
                .style("pointer-events", "none")
            }
          var moveTooltip = function(d) {
              tooltip
                .style("left", (d3version4.mouse(this)[0]) + "px")
                .style("top", (d3version4.mouse(this)[1]) + "px")
            }
          var hideTooltip = function(d) {
              tooltip
                .style("opacity", 0)
                .style("pointer-events", "none")
            }

          var highlight = function(d){
              // reduce opacity of all groups
              d3version4.selectAll(".bubbles").style("opacity", .05)
              // expect the one that is hovered
              d3version4.selectAll("."+d).style("opacity", 1)
            }
          
            // And when it is not hovered anymore
          var noHighlight = function(d){
              tooltip
              d3version4.selectAll(".bubbles").style("opacity", 1)
            }

            // ---------------------------//
//       CIRCLES              //
// ---------------------------//
function callout(g, value) {
  if (!value) 
    return g.style("opacity", 0);

  g.style("opacity",1)
  .style("pointer-events", "none")
  .style("font", "12px sans-serif");

  //Remove the existing elements for tooltip
  //console.log(g,value);
  g.selectAll("text").remove();
  g.selectAll("path").remove();

  var path = g
      .selectAll("foo")
      .data([null])
      .enter().append("path")
      .attr("fill", "white")
      .attr("stroke", "black")
      .style("opacity",1);
      
  var tip_text = g
      .selectAll("foo")
      .data([null])
      .enter().append("text")
      .call(function(tip_text) {
        tip_text.selectAll("tspan")
              .data((value + "").split("/\n/"))
              .enter().append("tspan")
              .attr("x", 0)
              .attr("y", function(d, i) {
                  return i * 1.1 + "em";
              })
              .style("font-weight", function(_, i) {
                  return i ? null : "bold";
              })
              .text(function(d) {
                  return d;
              });
      });

      
      //console.log(tip_text.node().getBBox())  ;
  var x = tip_text.node().getBBox().x;
  var y = tip_text.node().getBBox().y;
  var w = tip_text.node().getBBox().width;
  var h = tip_text.node().getBBox().height;
  
  tip_text.attr(
    "transform",
    "translate(" + -w / 2 + "," + (15 - y) + ")"
              );
  path.attr(
    "d",
    "M" +
        (-w / 2 - 10) +
        ",5H-5l5,-5l5,5H" +
        (w / 2 + 10) +
        "v" +
        (h + 20) +
        "h-" +
        (w + 20) +
        "z"
        );

}

// Add dots
svg.append('g')
.selectAll("dot")
.data(data)
.enter()
.append("circle")
.attr("class", function(d) { return "bubbles " + d.continent })
.attr("transform", "translate(" + margin.left +  "," + margin.top + ")")
.attr("cx", function (d) { return x(d.Female_suicide_rate); } )
.attr("cy", function (d) { return y(d.Male_suicide_rate); } )
.attr("r", function (d) { return z(d.pop); } )
.style("fill", function (d) { return myColor(d.Entity); } )

var tooltip = svg.append("g");

svg.selectAll(".bubbles")
.attr("class","aaaaa")
// -3- Trigger the functions for hover
.on("mouseover", function(d) {
  tooltip.call(
      callout,
          "Country: " +
          d.Entity +
          "/\n/" +
          "Male:" +
          Math.trunc(d.Male_suicide_rate) +
          "/\n/" +
          "Female:" +
          Math.trunc(d.Female_suicide_rate)
  );
  svg.selectAll(".aaaaa")
    .style("opacity", .3);

d3version4.select(this)
        .attr("r", function (d) { return z(d.pop) + 10; } )
        .transition()
        .duration(200)
        .style("opacity", 1)
        .style("stroke", "black");
})
.on("mousemove", function() {
  tooltip.attr(
      "transform",
      "translate(" +
          //d3version4.mouse(this)[0] +
          200 +
          "," +
          d3version4.mouse(this)[1] + 
          ")"
  );
})
.on("mouseout", function() {
  tooltip.call(callout, null)
  .style("opacity", 0);

  svg.selectAll(".aaaaa")
    .style("opacity", 1)
    .style("stroke-width","1px")
    .style("stroke","black");


  d3version4.select(this)
  .attr("r", function (d) { return z(d.pop) ; } )
  .transition()
  .duration(200)
  .style("stroke", "transparent")
})

              document.getElementById('scatterPlot').style = 'text-align:center;display:block; position: relative;';

      }
updateScatter(scatter_data);

}
      
     

