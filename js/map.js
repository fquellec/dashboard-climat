// Define Default constants
const config = {
  width               : window.innerWidth,
  height              : 550,
  padding             : 0,
  colorScaleDomain    : [0, 100],
  colorScaleRange     : ["#ececec", "#4285F4"],
  borderColor         : ["white", "grey"],
  dataField           : "value",
  tooltip             : true,
  tooltip_format      : "Please define format",
  tooltip_width       : "20%",
  legend              : true,
  legend_title        : "",
  legend_labels       : [0, 25, 50, 75, 100],
  legend_square_size  : 20,
};

// Create the SVG containing our map
const svg = d3.select("#map")
              .append('svg')
                .attr("preserveAspectRatio", "xMinYMin meet")
                .attr("viewBox", "0 0 " + config.width + " " + config.height);

const map  = svg
              .append('g')
                .attr("width", config.width)
                .attr("height", config.height)
                .attr('pointer-events', 'all');

// create a tooltip
const tooltip = d3.select("#map")
  .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("font-family", "Open Sans")
    .style("font-size", "0.7rem")
    .style("background-color", "white")
    .style("border", "solid white")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("position", "absolute")
    .style("width", config.tooltip_width)
    .style("pointer-events", "none")
    .style("webkit-box-shadow", "0px 0px 10px grey")
    .style("moz-box-shadow",  "0px 0px 10px grey")
    .style("box-shadow", "0px 0px 10px grey");

// Color scales
//const colorScale = d3.scaleLinear()
//  .domain(config.colorScaleDomain)
//  .range(config.colorScaleRange);
d3.queue()
    .defer(d3.csv, 'assets/openAQMap.csv', function (d) {
        return {
            country: d.country_name,
            city: d.city_name,
            population: +d.population,
            lat: +parseFloat(d.lat),
            lon: +parseFloat(d.lon),
            value: +d.value
        }
    })
    .defer(d3.json, 'assets/countries.json')
    .defer(d3.json, 'assets/cantons_ch.json')
    .awaitAll(initialize)

function initialize(error, data){
  if (error) { throw error }

  // Get data
  
  const bubbleData   = data[0]
  const geojson = data[1];
  const cantons = data[2];




  // Map projection to compute coordinates 
  const projection = d3.geoIdentity().reflectY(true).fitSize([config.width - config.padding*2, config.height - config.padding*2], geojson);//translate([config.width/2, config.height/2]).scale(2)
  const path = d3.geoPath().projection(projection);

  // Draw the map
  const countryPaths = map
    //.attr("transform", "translate(" + config.padding + "," + config.padding + ")")
    .selectAll(".country")
      .data(geojson.features)
      .enter()
        .append("path")
        //.filter(function(d) { return d.properties.ISO_A3 != 'CHE' })
        .attr('class', 'country')
        .attr("fill", function (d) {
            return "#F2F2F2"
        })
        .style("opacity", 0.9)
        .attr("d", path)
        .style("stroke", config.borderColor[0])
        .style("stroke-width", "1px")
        .style("stroke-opacity", "1")
        .on('mouseover', function(event, d) {
          //d3.select(this.parentNode.appendChild(this)).style('stroke', config.borderColor[1]);
        }).on('mouseout', function(event, d) {
          //d3.select(this).style('stroke', config.borderColor[0]);
        })

    var minPm = d3.min(bubbleData, function(d) { return +d.value; });
    var maxPm = d3.max(bubbleData, function(d) { return +d.value; });
    console.log("min PM: ",  minPm, " ; max PM: ", maxPm)
    var color = d3.scalePow()
      .exponent(0.5)
      .domain([minPm, maxPm])
      .range(["#FFCE03", "#F00505"])

    // Add a scale for bubble size
    var minPop = d3.min(bubbleData, function(d) { return +d.population; });
    var maxPop = d3.max(bubbleData, function(d) { return +d.population; });
    var size = d3.scaleLinear()
      .domain([minPop,maxPop])  // What's in the data
      .range([ 3, 15])  // Size in pixel

    // Bubbles 
    const bubbles = map
      .selectAll("bubbles")
      .data(bubbleData)
      .enter()
      .append("circle")
        .attr("cx", function(d){ return projection([d.lon, d.lat])[0] })
        .attr("cy", function(d){ return projection([d.lon, d.lat])[1] })
        .attr("r", function(d){ return size(d.population) })
        .style("fill", function(d){ return  color(d.value) })
        .attr("stroke", function(d){ return  "white" })
        .attr("stroke-width", 1)
        .attr("fill-opacity", .4)
        .on("mouseover", function(d){
          tooltip.style("opacity", 1)
          d3.select(this.parentNode.appendChild(this)).style('stroke', "black");
        })
        .on("mousemove", function(d){
          const tooltipWidth = tooltip.node().getBoundingClientRect().width 
          const tooltipHeight =  tooltip.node().getBoundingClientRect().height 
          const mapWidth = svg.node().getBoundingClientRect().width 
          const mapHeight = svg.node().getBoundingClientRect().height 

          var leftPos = event.pageX
          var topPos = event.pageY

          if (leftPos > mapWidth/2){
            leftPos = leftPos - tooltipWidth - 20
          } else {
            leftPos = leftPos + 20
          }

          if (topPos > mapHeight/2){
            topPos = topPos - tooltipHeight
          }

          var textToDisplay = "<b>" + d.city + ", " + d.country + "</b><br>" 
                              + "<b>Population : </b>" + d.population + "M<br>"
                              + "<b>PM2.5      : </b>" + d.value + " μg/m<sup>3</sup><br>";


          tooltip
            .html(textToDisplay)
            .style("left", leftPos + "px")
            .style("top", topPos + "px")
        })
        .on("mouseleave", function(d){
           tooltip.style("opacity", 0);
           d3.select(this).style('stroke', 'white');
        })


  d3.select("#swissButton").on("click", swissZoom )
  function swissZoom() {
        var t = d3.transition().duration(1800)

        var cantonPaths = map.selectAll('.canton')
            .data(cantons.features)

        var enterCantonPaths = cantonPaths.enter().append('path')
            .attr('class', 'canton')
            .attr('d', path)
            .style("stroke", config.borderColor[0])
            .style("stroke-width", "1px")
            .style("stroke-opacity", "1")
            .style('fill', function (d) { return "#F2F2F2" })
            .style('opacity', 0)
            .on('mouseover', function(event, d) {
              //d3.select(this.parentNode.appendChild(this)).style('stroke', config.borderColor[1]);
            }).on('mouseout', function(event, d) {
              //d3.select(this).style('stroke', config.borderColor[0]);
            })

       

        countryPaths.on('mouseover', function(event, d) {
          //disable mouseover for countries
        }).on('mouseout', function(event, d) {
          //disable mouseover for countries
        })

        projection.fitSize([config.width - config.padding*2, config.height - config.padding*2], cantons);

        var sizeCH = d3.scaleLinear()
        .domain([0,1000])  // What's in the data
        .range([ 3, 15])  // Size in pixel

        bubbles.transition(t)
            .attr("cx", function(d){ return projection([d.lon, d.lat])[0] })
            .attr("cy", function(d){ d3.select(this.parentNode.appendChild(this));return projection([d.lon, d.lat])[1] })
            .attr("r", function(d){ return sizeCH(d.population) });
        

        countryPaths.transition(t)
            .attr('d', path)
            .style("stroke-opacity", "0")

        countryPaths.transition(t)
            .attr('d', path)
            .style('fill', '#949494')

        enterCantonPaths.transition(t)
            .attr('d', path)
            .style('opacity', 1)

        cantonPaths.exit().transition(t)
            .attr('d', path)
            .style('opacity', 0)
            .remove()
  }

  d3.select("#worldButton").on("click", worldZoom )
  function worldZoom() {
    var t = d3.transition().duration(1800)

    projection.fitSize([config.width - config.padding*2, config.height - config.padding*2], geojson);

    bubbles.transition(t)
          .attr("cx", function(d){ return projection([d.lon, d.lat])[0] })
          .attr("cy", function(d){ d3.select(this.parentNode.appendChild(this));return projection([d.lon, d.lat])[1] })
          .attr("r", function(d){ return size(d.population) });
    countryPaths.transition(t)
        .attr('d', path)
        .style("stroke-opacity", "1");

    countryPaths.transition(t)
        .attr('d', path)
        .style('fill', function (d) { return "#F2F2F2"})

    countryPaths.on('mouseover', function(event, d) {
                //d3.select(this.parentNode.appendChild(this)).style('stroke', config.borderColor[1]);
              }).on('mouseout', function(event, d) {
                //d3.select(this).style('stroke', config.borderColor[0]);
              })

    map.selectAll('.canton')
        .data([])
        .exit().transition(t)
        .attr('d', path)
        .style('opacity', 0)
        .remove()
  }
}



