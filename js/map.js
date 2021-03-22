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

const zoom = d3.zoom().on("zoom", zoomed);
var active = d3.select(null);

const g =  map.append("g");
var path;

// Color scales
//const colorScale = d3.scaleLinear()
//  .domain(config.colorScaleDomain)
//  .range(config.colorScaleRange);

d3.json("assets/countries.json", function(error, geojson) {
//Promise.all([d3.json("assets/cantons_chd.json")]).then(function(data) {
  //const geojson = data[0];
  // Map projection to compute coordinates 
  const projection = d3.geoIdentity().reflectY(true).fitSize([config.width - config.padding*2, config.height - config.padding*2], geojson);
  path = d3.geoPath().projection(projection);

  // Draw the map
  g
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
          d3.select(this.parentNode.appendChild(this)).style('stroke', config.borderColor[1]).style("stroke-opacity", "1");
        }).on('mouseout', function(event, d) {
          d3.select(this).style('stroke', config.borderColor[0]).style("stroke-opacity", "1");
        }).on("click", clicked);
});


function clicked(d) {
  
  if (active.node() === this) return reset();
  active.classed("active", false);
  active = d3.select(this).classed("active", true);

  var bounds = path.bounds(d),
      dx = bounds[1][0] - bounds[0][0],
      dy = bounds[1][1] - bounds[0][1],
      x = (bounds[0][0] + bounds[1][0]) / 2,
      y = (bounds[0][1] + bounds[1][1]) / 2,
      scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / config.width, dy / config.height))),
      translate = [config.width / 2 - scale * x, config.height / 2 - scale * y];

  svg.transition()
      .duration(750)
      // .call(zoom.translate(translate).scale(scale).event); // not in d3 v4
      .call( zoom.transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale) ); // updated for d3 v4

      
}

function zoomed() {
  g.style("stroke-width", 1.5 / d3.event.transform.k + "px");
  // g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")"); // not in d3 v4
  g.attr("transform", d3.event.transform); // updated for d3 v4
}

function reset() {
  active.classed("active", false);
  active = d3.select(null);

  svg.transition()
      .duration(750)
      // .call( zoom.transform, d3.zoomIdentity.translate(0, 0).scale(1) ); // not in d3 v4
      .call( zoom.transform, d3.zoomIdentity ); // updated for d3 v4
}

// If the drag behavior prevents the default click,
// also stop propagation so we don’t click-to-zoom.
function stopped() {
  if (d3.event.defaultPrevented) d3.event.stopPropagation();
}



