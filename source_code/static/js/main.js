var Url = "http://localhost:5000/";
var worldmap_country = "world";
async function generatePlot(type) {
    if(type == 'map'){
        const url = Url + "getChoropleth"
        let response = await fetch(url)
        map_data = await response.json()
        //console.log(map_data)
        return visualize_d3_map(map_data, type)
    }else if(type == 'scatter'){
        const url = Url + "getScatterPlot"
        let response = await fetch(url)
        scatter_data = await response.json()
        //console.log(scatter_data)
        return visualize_d3_scatter(scatter_data, type)
    }else if(type == 'line'){
        const url = Url + "getLinePlot"
        let response = await fetch(url)
        line_data = await response.json()
        //console.log(line_data)
        return visualize_d3_line(line_data, type)
    }else if(type == 'bar'){
        const url = Url + "getBarPlot"
        let response = await fetch(url)
        
        bar_data = await response.json()
        //console.log(bar_data)
        return visualize_d3_bar(bar_data, type)
    }else if(type == 'pcp'){
        const url = Url + "getPCPPlot"
        let response = await fetch(url)
        pcp_data = await response.json()
        //console.log(pcp_data)
        const url2 = Url + "getKmeansPCP"
        let response2 = await fetch(url2)
        kmeans_data = await response2.json()
        //console.log(kmeans_data)
        return visualize_d3_pcp(pcp_data, kmeans_data, type)
    }    
    }


function displayDashboard(task){
    
    if (task == "reset"){
            window.location.reload();
                           
    }
        console.log("hello dashboard")

   generatePlot('map');
   generatePlot('scatter');
   generatePlot('line');
   generatePlot('bar');
   generatePlot('pcp');

}
displayDashboard(' ');


var lineChartTrigger = {
    aInternal: null,
    aListener: function(val) {},
    set a(val) {
        this.aInternal = val;
        this.aListener(val);
    },
    get a() {
        return this.aInternal;
    },
    registerListener: function(listener) {
        this.aListener = listener;
    }
}

var worldMapTrigger = {
    aInternal: null,
    aListener: function(val) {},
    set a(val) {
        this.aInternal = val;
        this.aListener(val);
    },
    get a() {
        return this.aInternal;
    },
    registerListener: function(listener) {
        this.aListener = listener;
    }
}

var worldMapTrigger2 = {
    aInternal: null,
    aListener: function(val) {},
    set a(val) {
        this.aInternal = val;
        this.aListener(val);
    },
    get a() {
        return this.aInternal;
    },
    registerListener: function(listener) {
        this.aListener = listener;
    }
}

var worldMapTrigger3 = {
    aInternal: null,
    aListener: function(val) {},
    set a(val) {
        this.aInternal = val;
        this.aListener(val);
    },
    get a() {
        return this.aInternal;
    },
    registerListener: function(listener) {
        this.aListener = listener;
    }
}