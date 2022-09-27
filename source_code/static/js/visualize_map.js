//annual number of deaths from suicide per 100,000 people on an average.
function visualize_d3_map(map_data, type){
  //console.log(data);
   var margin = { top: 10, right: 10, bottom: 50, left: 10 },
      width = 960 - margin.left - margin.right,
      height = 420 - margin.top - margin.bottom;
       var clicked_countries = [];
  var svg = d3version4.select('#worldmap').append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// Map and projection
  var path = d3version4.geoPath();
  var projection =d3version4.geoMercator()
                            .scale(115)
                            .center([0,40])
                            .translate([width / 2, height / 2]);
// Data and color scale
var data = d3version4.map();
var colorScale = d3version4.scaleQuantile()
                            .domain([ 10000000,
                                      30000000,
                                      50000000,
                                      80000000, 
                                      100000000,
                                      150000000,
                                      250000000,
                                      400000000,
                                      500000000
                                     ])
                            .range(colorbrewer.YlOrRd[9]);
// Legend
var g  =  svg.append("g")
             .attr("class", "legendThreshold")
             .attr("transform", "translate(20,20)");
           g .append("text")
             .attr("id","legend_text")
             .attr("class", "caption")
             .attr("x", 0)
             .attr("y", height - 200)
             .text("Death Count per 100000 people");


     
var labels = ['< 1','3', '5',  '8',  '10', '15', '25', '40',  '> 50'];
var legend = d3.legendColor()
               .labels(function (d) { return labels[d.i]; })
               .shapePadding(4)
               .scale(colorScale);
            svg.select(".legendThreshold").append('g')
               .attr("transform", "translate(0,175)")
               .call(legend);
   
    // Format tooltip
  function callout(g, value) {
      if (!value) 
        return g.style("opacity", 0);

      g.style("opacity",1)
      .style("pointer-events", "none")
      .style("font", "12px sans-serif");
      //Remove the existing elements for tooltip

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
  
// Load external data and boot
d3version4.queue()
.defer(d3version4.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson");

function updateMap(map_data) {
// Draw the map
svg.append("g")
  .selectAll("path")
  .data(map_data.features)
  .enter()
  .append("path")
    // draw each country
  .attr("d", d3version4.geoPath()
  .projection(projection)
    )
    // set the color of each country
  .attr("fill", function (d) {
    //console.log(d.Deaths);
      if (d.Deaths == undefined) {
        d.total = 0
      }
      else{
        d.total = d.Deaths ;//map_data.get(d.id) ;
      }
      return colorScale(d.total);
    })
  .style("stroke", "transparent")
  .attr("class", function(d){ return "Country" } )
  .style("opacity", .8);


  var tooltip = svg.append("g");

// Create and customize tooltip
  svg.selectAll(".Country")
  .on("mouseover", function(d) {
      tooltip.call(
          callout,
              d.properties.name +
              "/\n/" +
              "Average Deaths:" +
              Math.ceil((d.Deaths)/10000000)
      );
  d3version4.select(this)
            .transition()
            .ease(d3version4.easeExp)
            .duration(200)
            .style("opacity", 1)
            .style("stroke", "black");
  })
  .on("mousemove", function() {
      tooltip.attr(
          "transform",
          "translate(" +
              d3version4.mouse(this)[0] +
              "," +
              d3version4.mouse(this)[1] +
              ")"
      );
  })
  .on("mouseout", function() {
      tooltip.call(callout, null)
      .style("opacity", 0);
      d3version4.select(this)
      .transition()
      .ease(d3version4.easeExp)
      .duration(200)
      .style("stroke", "transparent")
  })
  .on("click", click);
  function click(d) {
    worldMapTrigger.a = d.id;
   
    clicked_countries.push(d.id);
    worldmap_country = d.id

    document.getElementById("titleChoropleth").innerHTML = "Average Death Rate Due To Suicide in " + d.properties.name + " (1990-2017)";
    document.getElementById("titleStats").innerHTML = "Suicide Death Rates in " + d.properties.name + " by Age Group (1990-2017)";
    document.getElementById("titleLine").innerHTML = "Male-Female Suicide Rate in " + d.properties.name + " over the Years (1990-2017)";
    document.getElementById("titlePCP").innerHTML = "Potential Factors Causing Suicide Deaths in " + d.properties.name + " over the Years (1990-2017)";
    //console.log(d.properties.name);
    tooltip.remove();
    //console.log(d.id);
  }
  
}

  updateMap(map_data);
 lineChartTrigger.registerListener(function(val) {
    dates = {}
    dates.start = start_date
    dates.end = end_date
    $(document).ready(function() {
        $.ajax({
            type: "POST",
            url: "/getChoropleth",
            contentType: "application/json",
            data: JSON.stringify(dates),
            dataType: "json",
            success: function(response) {
                map_data = (response)
 
                updateMap(map_data)
            },
            error: function(err) {
                console.log(err);
            }
        });
    });
   });

}
               

