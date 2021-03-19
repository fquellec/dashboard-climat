// Define Default constants
const config = {
  width               : window.innerWidth,
  height              : 600,
  padding             : 100,
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

d3.json("assets/cantons_ch.json", function(error, geojson) {

  // Map projection to compute coordinates 
  const projection = d3.geoIdentity().reflectY(true).fitSize([config.width - config.padding*2, config.height - config.padding*2], geojson);
  const path = d3.geoPath().projection(projection);

  // Draw the map
  map.append("g")
    .attr("transform", "translate(" + config.padding + "," + config.padding + ")")
    .selectAll("path")
      .data(geojson.features)
      .enter()
        .append("path")
        .attr("fill", function (d) {
            return "#F2F2F2"
        })
        .style("opacity", 0.9)
        .attr("d", path)
        .style("stroke", config.borderColor[0])
        .style("stroke-width", "1px")
        .style("stroke-opacity", "1")
        .on('mouseover', function(event, d) {
          d3.select(this).style('stroke', config.borderColor[1]).style("stroke-opacity", "1");
        }).on('mouseout', function(event, d) {
          d3.select(this).style('stroke', config.borderColor[0]).style("stroke-opacity", "1");
        })
      .exit()
        .remove();
});





