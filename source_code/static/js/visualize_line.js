function visualize_d3_line(data, type){

  var margin = {top: 10, right: 100, bottom: 110, left: 70},
  margin2= {top: 375, right: 30, bottom: 30, left: 70},
  width = 675 - margin.left - margin.right,
  height = 425 - margin.top - margin.bottom,
  height2 = 425 - margin2.top - margin2.bottom;

  var svg = d3version4.select("#linePlot")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

  var x   = d3version4.scaleLinear().range([0, width]),
      x2  = d3version4.scaleLinear().range([0, width]),
      y   = d3version4.scaleLinear().range([height, 0]),
      y2  = d3version4.scaleLinear().range([height2, 0]);

  var xAxis   = d3version4.axisBottom(x),
      xAxis2  = d3version4.axisBottom(x2),
      yAxis   = d3version4.axisLeft(y);

  

  var line = d3version4.line()
               .x(function (d) { return x(d.Year); })
               .y(function (d) { return y(d.Male_suicide_rate); });
  
  var line2 = d3version4.line()
               .x(function (d) { return x2(d.Year); })
               .y(function (d) { return y2(d.Male_suicide_rate); });
  var clip = svg.append("defs").append("svg:clipPath")
      .attr("id", "clip")
      .append("svg:rect")
      .attr("width", width)
      .attr("height", height)
      .attr("x", 0)
      .attr("y", 0); 


      var brush = d3version4.brushX()
      .extent([[0, 0], [width, height2]])
      .on("brush", brushed)
      .on("end", brushend);;

var zoom = d3version4.zoom()
     .scaleExtent([1, Infinity])
     .translateExtent([[0, 0], [width, height]])
     .extent([[0, 0], [width, height]])
     .on("zoom", zoomed);
var Line_chart = svg.append("g")
.attr("class", "focus")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
.attr("clip-path", "url(#clip)");

var focus = svg.append("g")
.attr("class", "focus")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var context = svg.append("g")
.attr("class", "context")
.attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

    function updateLineChart(data, opacity_param){
      x.domain(d3version4.extent(data, function(d) { return d.Year; }));
      y.domain([0, d3version4.max(data, function (d) { return d.Male_suicide_rate + 10; }) ]);
      x2.domain(x.domain());
      y2.domain(y.domain());
      xAxis   = d3version4.axisBottom(x),
      xAxis2  = d3version4.axisBottom(x2),
      yAxis   = d3version4.axisLeft(y);


      focus.selectAll("g").remove();
      context.selectAll("g").remove();


      
      focus.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .attr("fill", "black")
      .attr("font-family", "Times New Roman")
      .attr("font-size", "15px")
      .attr("font-weight", "bold")
      .call(xAxis);

       //Draw X-axis label
      focus.append("text")
       .attr("y", height + 40 )
       .attr("x", width/2)
       .attr("text-anchor", "middle")
       .attr("fill", "black")
       .attr("font-family", "Times New Roman")
       .attr("font-size", "20px")
       .attr("font-weight", "bold")
       .text("Year");

      focus.append("g")
      .attr("class", "axis axis--y")
      .transition()
      .duration(500)
      .attr("fill", "black")
      .attr("font-family", "Times New Roman")
      .attr("font-size", "15px")
      .attr("font-weight", "bold")
      .call(yAxis);

      var sumstat = d3version4.nest() // nest function allows to group the calculation per level of a factor
      .key(function(d) { return d.Entity;})
      .entries(data);
      
      
      focus.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 75)
          .attr("dy", "-5.5em")
          .attr("x", -150)
          .attr("text-anchor", "middle")
          .attr("fill", "black")
          .attr("font-family", "Times New Roman")
          .attr("font-size", "20px")
          .attr("font-weight", "bold")
          .text("M-F Suicide Rate");
    
      var res = sumstat.map(function(d){  return d.key }) // list of group names
      var color = d3version4.scaleOrdinal()
          .domain(res)
          .range(['#191970','#BDB76B','#034f84','#e41a1c','#008000','#7CBB00']);//,'#191970','#e41a1c','#87CEEB','#7CBB00','#221F1F','#FFBB00','#541212','#e41a1c','#8000ff']);

    Line_chart.selectAll(".Mline").remove();
    Line_chart.selectAll(".Fline").remove();
        Line_chart.selectAll(".line")
        .data(sumstat)
        .enter()
        .append("path")
        .transition()
        .ease(d3version4.easeExp)
        .duration(500)
            .attr("class", function(d) {return  "Mline " + d.key })
            //.attr("stroke-dasharray",10)
            .attr("stroke", function(d){ return color(d.key) })
            .attr("stroke-width", function(d){ if ( d.values[0].Code == worldmap_country || d.values[0].Code == "WID_WRL"){ s = "5px"; } else s= "3px" ; return s})
            .style("opacity",function(d){ if(opacity_param == "no") {if ( d.values[0].Code == worldmap_country || d.values[0].Code == "WID_WRL"){ s = "1"; } else {s = "0.2"} return s}})
            .attr("d", function(d){
              return d3version4.line()
                .x(function(d) { return x(d.Year); })
                .y(function(d) { return y(d.Male_suicide_rate); })
                (d.values)
              })
             
              
              Line_chart.selectAll(".line")
              .data(sumstat)
              .enter()
              .append("path")
              .transition()
              .duration(500)
                  .attr("class", function(d) {return  "Fline " + d.key })
                  //.attr("stroke-dasharray",10)
                  .attr("stroke", function(d){ return color(d.key) })
                  .attr("stroke-width", function(d){ if ( d.values[0].Code == worldmap_country || d.values[0].Code == "WID_WRL"){ s = "5px"; } else s= "2px" ; return s})
                  .style("stroke-dasharray", "5")
                  .style("opacity",function(d){ if(opacity_param == "no") {if ( d.values[0].Code == worldmap_country || d.values[0].Code == "WID_WRL"){ s = "1"; } else {s = "0.5"} return s}})
                  .attr("d", function(d){
                    return d3version4.line()
                      .x(function(d) { return x(d.Year); })
                      .y(function(d) { return y(d.Female_suicide_rate); })
                      (d.values)
                    })      
                    
                  
      context.append("g")
          .attr("class", "axis axis--x")
          .attr("transform", "translate(0," + height2 + ")")
          .call(xAxis2);
    
      context.append("g")
          .attr("class", "brush")
          .call(brush)
          .call(brush.move, x.range());
    
      svg.append("rect")
          .attr("class", "zoom")
          .attr("width", width)
          .attr("height", height)
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
          .call(zoom);
          var highlight = function(d){
            d3version4.select(this).style("opacity", 1)
          }
      
          // And when it is not hovered anymore
          var noHighlight = function(d){
            d3version4.selectAll(".Mline").style("opacity", 1)
            d3version4.selectAll(".Fline").style("opacity", 1)
          }     
          //////////
          // LEGEND //
          //////////
      
          // Add one dot in the legend for each name.
          var size = 15 
          svg.selectAll(".rectlegend").remove();
          svg.selectAll(".textlegend").remove();
          svg.selectAll("myrect")
            .data(res)
            .enter()
            .append("rect")
            .attr("class","rectlegend")
           
              .attr("x", width + 50)
              .attr("y", function(d,i){ return 20 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
              .attr("width", size)
              .attr("height", size)
              .style("fill", function(d){ return color(d);})
     
          // Add one dot in the legend for each name.
          svg.selectAll("mylabels")
            .data(res)
            .enter()
            .append("text")
            .attr("class","textlegend")
              .attr("x", width + 50 + size*1.2)
              .attr("y", function(d,i){ return 20 + i*(size+5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
              .style("fill", function(d){ return color(d);})
              .attr("font-weight", "bold")
              .text(function(d){ return d})
              .attr("text-anchor", "left")
              .style("alignment-baseline", "middle")
 
    opacity_param = "no";
            }

    function brushed() {
      if (d3version4.event.sourceEvent && d3version4.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
      var s = d3version4.event.selection || x2.range();
      x.domain(s.map(x2.invert, x2));
      Line_chart.selectAll(".Mline")
      .attr("d", function(d){
        return d3version4.line()
          .x(function(d) { return x(d.Year); })
          .y(function(d) { return y(+d.Male_suicide_rate); })
          (d.values)
      })
      Line_chart.selectAll(".Fline")
      .attr("d", function(d){
        return d3version4.line()
          .x(function(d) { return x(d.Year); })
          .y(function(d) { return y(+d.Female_suicide_rate); })
          (d.values)
      })
      

      //Line_chart.select(".line").attr("d", line);
      focus.select(".axis--x").call(xAxis);
      svg.select(".zoom").call(zoom.transform, d3version4.zoomIdentity
          .scale(width / (s[1] - s[0]))
          .translate(-s[0], 0));
    }

    function brushend(d) {
      if ((d3version4.event.sourceEvent && d3version4.event.sourceEvent.type === "zoom") || (d3version4.event.sourceEvent && d3version4.event.sourceEvent.type === "end")) return; // ignore brush-by-zoom
      var s = d3version4.event.selection || x2.range();
      start_date = Math.trunc(s.map(x2.invert, x2)[0])
      end_date =  Math.trunc(s.map(x2.invert, x2)[1])

      lineChartTrigger.a = [start_date,end_date];

      x.domain(s.map(x2.invert, x2));


      Line_chart.selectAll(".Mline")
      .attr("d", function(d){
        return d3version4.line()
          .x(function(d) { return x(d.Year); })
          .y(function(d) { return y(+d.Male_suicide_rate); })
          (d.values)
      })
      Line_chart.selectAll(".Fline")
      .attr("d", function(d){
        return d3version4.line()
          .x(function(d) { return x(d.Year); })
          .y(function(d) { return y(+d.Female_suicide_rate); })
          (d.values)
      })
      
      focus.select(".axis--x").call(xAxis);
      //d3version4.selectAll(".axis text").style("fill", "rgb(155, 155, 155)");
      svg.select(".zoom").call(zoom.transform, d3version4.zoomIdentity
          .scale(width / (s[1] - s[0]))
          .translate(-s[0], 0));
  }

    function zoomed() {
      if (d3version4.event.sourceEvent && d3version4.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
      var t = d3version4.event.transform;
      x.domain(t.rescaleX(x2).domain());

      Line_chart.selectAll(".Mline")
          .attr("d", function(d){
            return d3version4.line()
              .x(function(d) { return x(d.Year); })
              .y(function(d) { return y(+d.Male_suicide_rate); })
              (d.values)
          })
          
          Line_chart.selectAll(".Fline")
          .attr("d", function(d){
            return d3version4.line()
              .x(function(d) { return x(d.Year); })
              .y(function(d) { return y(+d.Female_suicide_rate); })
              (d.values)
          })
          
      //Line_chart.select(".line").attr("d", line);
      focus.select(".axis--x").call(xAxis);
      context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
    }
    
    function type(d) {
      d.Year = d.Year;
      d.Male_suicide_rate = +d.Male_suicide_rate;
      d.Female_suicide_rate = +d.Female_suicide_rate;
      
      return d;
    }

updateLineChart(data, 'yes');

worldMapTrigger.registerListener(function(val) {
  worldMapTrigger2.a = worldmap_country 

  $(document).ready(function() {
      $.ajax({
          type: "POST",
          url: "/getLinePlot",
          contentType: "application/json",
          data: JSON.stringify(worldmap_country),
          dataType: "json",
          success: function(response) {
              linedata = (response)
              updateLineChart(linedata, 'no')
          },
          error: function(err) {
              console.log(err);
          }
      });
  });
});
    
}