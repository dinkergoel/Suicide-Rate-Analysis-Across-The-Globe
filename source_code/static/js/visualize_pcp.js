function visualize_d3_pcp(pcp_data, kmeans_data, type){
    //console.log(pcp_data);
    pcp_data = pcp_data.slice(0, 200);
    kmeans_data = kmeans_data.slice(0, 200);
    //console.log(pcp_data, kmeans_data);
    width_const = 1050
    height_const = 420

    var margin = {top: 20, right: 40, bottom: 10, left: 40},
    width = width_const - margin.left - margin.right,
    height = height_const - margin.top - margin.bottom;
    colors =["purple","#0033CC","yellow","orange"];// ['#191970','#B22222','#BDB76B','#87CEEB'];//
    var x = d3version4.scalePoint().range([0, width]),
    y = {},
    dragging = {};

    var svg = d3version4.select("#PCP").append("svg")
    .attr("width", width_const)
    .attr("height", height_const)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    var line = d3version4.line(),
    axis = d3version4.axisLeft(),
    background,
    foreground;

    x.domain(dimensions = d3version4.keys(pcp_data[0]).filter(function(d) {
            return d != "name" && (y[d] = d3version4.scaleLinear()
                .domain(d3version4.extent(pcp_data, function(p) { return +p[d]; }))
                .range([height, 0]));  
    }));

    d3version4.select(".background").remove();
    
    background = svg.append("g")
        .attr("class", "background")
        .selectAll("path")
        .data(pcp_data)
        .enter().append("path")
        .attr("d", path)
        .style("opacity", "0.2");;
  

        // Add blue foreground lines for focus.
        d3version4.select(".foreground").remove();
    foreground = svg.append("g")
        .attr("class", "foreground")
        .selectAll("path")
        .data(pcp_data)
        .enter().append("path")
        .attr("d", path)
        .style("stroke", function(d) { return colors[d.kmeans];})
                .attr("style",function(d,i){
                return "stroke:"+ colors[kmeans_data[i]] + ";";
    });

    //d3version4.select(".dimension").remove();
    var g = svg.selectAll(".dimension")
        .data(dimensions)
        .enter().append("g")
        .attr("class", "dimension")
        .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
        .call(d3version4.drag()
          .subject(function(d) { return {x: x(d)}; })
          .on("start", function(d) {
            dragging[d] = x(d);
            background.attr("visibility", "hidden");
            //.style("opacity", "0.2");
        })
        .on("drag", function(d) {
        dragging[d] = Math.min(width, Math.max(0, d3version4.event.x));
        foreground.attr("d", path);
        dimensions.sort(function(a, b) { return position(a) - position(b); });
        x.domain(dimensions);
        g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
        })
        .on("end", function(d) {
        delete dragging[d];
        transition(d3version4.select(this)).attr("transform", "translate(" + x(d) + ")");
        transition(foreground).attr("d", path);
        background
            .attr("d", path)
          .transition()
            .delay(500)
            .duration(0)
            .attr("visibility", null);
        }));
 
    g.append("g")
    .attr("class", "axis")
    .attr("fill", "black")
    .attr("font-family", "Times New Roman")
    .attr("font-size", "15px")
    .attr("font-weight", "bold")
    .each(function(d) { d3version4.select(this).call(axis.scale(y[d])); })
    .append("text")
    .style("text-anchor", "middle")
    .attr("y", -9)
    .text(function(d) { return d; });

    
    g.append("text")
        .attr("x", 0)
        .attr("y",-5) 
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .attr("font-weight", "bold")
        .attr("font-family", "Times New Roman")
        //.attr("transform", "rotate(-10)")
        .text(function(d) { return d; });

  //d3version4.selectAll(".brush").remove();
  g.append("g")
  .attr("class", "brush")
  .each(function(d) {
    d3version4.select(this).call(y[d].brush = d3version4.brushY()
          .extent([
              [-10, 0],
              [10, height]
          ])
          .on("start", brushstart)
          .on("brush", brush)
          .on("end", brushend));
  })
  .selectAll("rect")
  .attr("x", -8)
  .attr("width", 16);

  function position(d) {
    var v = dragging[d];
    return v == null ? x(d) : v;
  }
  
  function transition(g) {
    return g.transition().duration(500);
  }
  
  // Returns the path for a given data point.
  function path(d) {
    return line(dimensions.map(function(p) { return [position(p), y[p](d[p])]; }));
  }
  function brushstart() {
   // d3version3.event.sourceEvent.stopPropagation();
    d3version4.event.sourceEvent.stopPropagation();
  }
  
  // Handles a brush event, toggling the display of foreground lines.
  function brush() {
    var actives = [];
        svg.selectAll(".brush")
            .filter(function(d) {
                // console.log(d3.brushSelection(this));
                return d3version4.brushSelection(this);
            })
            .each(function(key) {
                actives.push({
                    dimension: key,
                    extent: d3version4.brushSelection(this)
                });
            });

if (actives.length === 0) {
    foreground.style("display", null);
} else {
    foreground.style("display", function(d) {
        // console.log(d)
        return actives.every(function(brushObj) {
            return brushObj.extent[0] <= y[brushObj.dimension](d[brushObj.dimension]) && y[brushObj.dimension](d[brushObj.dimension]) <= brushObj.extent[1];
        }) ? null : "none";
    });
}

  }
  function brushend() {
    // Get a set of dimensions with active brushes and their current extent.
    var actives = [];
    svg.selectAll(".brush")
        .filter(function(d) {
            // console.log(d3.brushSelection(this));
            return d3version4.brushSelection(this);
        })
        .each(function(key) {
            actives.push({
                dimension: key,
                extent: d3version4.brushSelection(this)
            });
        });
    // Change line visibility based on brush extent.
    if (actives.length === 0) {
        foreground.style("display", null);
    } else {
        foreground.style("display", function(d) {
            return actives.every(function(brushObj) {
                return brushObj.extent[0] <= y[brushObj.dimension](d[brushObj.dimension]) && y[brushObj.dimension](d[brushObj.dimension]) <= brushObj.extent[1];
            }) ? null : "none";
        });
    }

        // console.log(selected_countries)
}
 
function updatePCP(pcp_data, kmeans_data){
  x.domain(dimensions = d3version4.keys(pcp_data[0]).filter(function(d) {
    return d != "name" && (y[d] = d3version4.scaleLinear()
        .domain(d3version4.extent(pcp_data, function(p) { return +p[d]; }))
        .range([height, 0]));  
}));

//d3version4.select(".background").remove();

var backgroundint = d3version4.select(".background")
.selectAll("path")
.data(pcp_data)

backgroundint.enter()
.append("path")
.merge(backgroundint)
.attr("class", "background")
.attr("d", path)
.style("opacity", "0.2");;
backgroundint.exit().remove()


// Add blue foreground lines for focus.
var foregroundint = d3version4.select(".foreground")
.selectAll("path")
.data(pcp_data)

foregroundint
.enter().append("path")
.merge(foregroundint)
.attr("class", "foreground")
.attr("d", path)
.style("stroke", function(d) { return colors[d.kmeans];})
        .attr("style",function(d,i){
        return "stroke:"+ colors[kmeans_data[i]] + ";";
});


foregroundint.exit().remove()

var dimensionprev = d3version4.selectAll(".dimension")
.data(dimensions)
.enter().append("g")
.merge(g)
.attr("class", "dimension")
.attr("transform", function(d) { return "translate(" + x(d) + ")"; })
.call(d3version4.drag()
  .subject(function(d) { return {x: x(d)}; })
  .on("start", function(d) {
    dragging[d] = x(d);
    background.attr("visibility", "hidden");
    //.style("opacity", "0.2");
})
.on("drag", function(d) {
dragging[d] = Math.min(width, Math.max(0, d3version4.event.x));
foreground.attr("d", path);
dimensions.sort(function(a, b) { return position(a) - position(b); });
x.domain(dimensions);
g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
})
.on("end", function(d) {
delete dragging[d];
transition(d3version4.select(this)).attr("transform", "translate(" + x(d) + ")");
transition(foreground).attr("d", path);
background
    .attr("d", path)
  .transition()
    .delay(500)
    .duration(0)
    .attr("visibility", null);
}));
dimensionprev.exit().remove();

d3version4.selectAll(".axis")
.each(function(d) {console.log(axis.scale(y[d])); d3version4.select(this).transition().ease(d3version4.easeExp).duration(500).call(axis.scale(y[d])); })   //.call(axis.scale(y[d])); })
.append("text")
.style("text-anchor", "middle")
.attr("y", -9)
.text(function(d) { return d; });

d3version4.selectAll("text")
.attr("x", 0)
.attr("y",-5) 
.attr("text-anchor", "middle")
.style("font-size", "16px")
.attr("font-weight", "bold")
.attr("font-family", "Times New Roman")
.attr("transform", "rotate(-10)")
.text(function(d) { return d; });

//d3version4.selectAll(".brush").remove();

d3version4.selectAll(".brush")
//.attr("class", "brush")
.each(function(d) {
d3version3.select(this).call(y[d].brush = d3version3.svg.brush().y(y[d])
.on("start", brushstart)
.on("brush", brush)
.on("end", brushend))

})
.selectAll("rect")
.attr("x", -8)
.attr("width", 16);
}

 worldMapTrigger3.registerListener(function(val) {
    $(document).ready(function() {
        $.ajax({
            type: "POST",
            url: "/getPCPPlot",
            contentType: "application/json",
            data: JSON.stringify(worldmap_country),
            dataType: "json",
            success: function(response) {
                pcp_data = (response)
            },
            error: function(err) {
                console.log(err);
            }
        });
        $.ajax({
          type: "POST",
          url: "/getKmeansPCP",
          contentType: "application/json",
          data: JSON.stringify(worldmap_country),
          dataType: "json",
          success: function(response) {
              kmeans_data = (response)

              updatePCP(pcp_data, kmeans_data)
          },
          error: function(err) {
              console.log(err);
          }
      });
    });
    });
}