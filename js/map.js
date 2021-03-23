// Define Default constants
const config = {
  width               : window.innerWidth,
  height              : 400,
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
    .style("border-radius", "0px")
    .style("padding", "5px")
    .style("position", "absolute")
    .style("width", config.tooltip_width)
    .style("pointer-events", "none")
    .style("box-shadow", "0.5px 0.8px 1px 0.5px");

// Color scales
//const colorScale = d3.scaleLinear()
//  .domain(config.colorScaleDomain)
//  .range(config.colorScaleRange);
d3.queue()
    //.defer(d3.csv, 'data.csv', function (d) {
    //    return {
    //        id: +(d.state + d.county),
    //        state: d.state,
    //        county: d.county,
    //        unemployment: +d.unemployment
    //    }
    //})
    .defer(d3.json, 'assets/countries.json')
    .defer(d3.json, 'assets/cantons_ch.json')
    .awaitAll(initialize)

function initialize(error, data){
  if (error) { throw error }

  // Get data
  const geojson = data[0];
  const cantons = data[1];

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
          d3.select(this.parentNode.appendChild(this)).style('stroke', config.borderColor[1]);
        }).on('mouseout', function(event, d) {
          d3.select(this).style('stroke', config.borderColor[0]);
        })


  d3.select("#swissButton").on("click", swissZoom )
  function swissZoom() {
        var t = d3.transition().duration(800)

        var cantonPaths = map.selectAll('.canton')
            .data(cantons.features)

        var enterCantonPaths = cantonPaths.enter().append('path')
            .attr('class', 'canton')
            .attr('d', path)
            .style("stroke", config.borderColor[0])
            .style("stroke-width", "1px")
            .style("stroke-opacity", "1")
            .style('fill', function (d) { return "#F3F3F3" })
            .style('opacity', 0)
            .on('mouseover', function(event, d) {
              d3.select(this.parentNode.appendChild(this)).style('stroke', config.borderColor[1]);
            }).on('mouseout', function(event, d) {
              d3.select(this).style('stroke', config.borderColor[0]);
            })

        projection.fitSize([config.width - config.padding*2, config.height - config.padding*2], cantons);

        countryPaths.on('mouseover', function(event, d) {
          //disable mouseover for countries
        }).on('mouseout', function(event, d) {
          //disable mouseover for countries
        })

        countryPaths.style("stroke-opacity", "0.05")

        countryPaths.transition(t)
            .attr('d', path)
            .style('fill', '#444')

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
    var t = d3.transition().duration(800)

    //projection.scale(height * 2).translate([width / 2, height / 2])
    projection.fitSize([config.width - config.padding*2, config.height - config.padding*2], geojson);

    countryPaths.style("stroke-opacity", "1");
    
    countryPaths.transition(t)
        .attr('d', path)
        .style('fill', function (d) { return "#F2F2F2"})

    countryPaths.on('mouseover', function(event, d) {
                d3.select(this.parentNode.appendChild(this)).style('stroke', config.borderColor[1]);
              }).on('mouseout', function(event, d) {
                d3.select(this).style('stroke', config.borderColor[0]);
              })

    map.selectAll('.canton')
        .data([])
        .exit().transition(t)
        .attr('d', path)
        .style('opacity', 0)
        .remove()
  }
}



