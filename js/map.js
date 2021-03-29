// Define Default constants
const config = {
  width               : window.innerWidth,
  height              : Math.min(window.innerWidth/2,550),
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

// Map projection to compute coordinates 
const projection = d3.geoIdentity().reflectY(true).translate([0, 0]).scale(1)//.fitSize([config.width - config.padding*2, config.height - config.padding*2], geojson);//translate([config.width/2, config.height/2]).scale(2)
const path = d3.geoPath().projection(projection);

// Load geojson for world and swiss
d3.queue()
    .defer(d3.json, 'assets/countries.json')
    .defer(d3.json, 'assets/cantons_ch.json')
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
    .awaitAll(initialize);

function initialize(error, data){
  if (error) { throw error }

  // Get data
  const geojson = data[0];
  const cantons = data[1];

  // Initialize all datasets
  var openAQ = new OpenAQdata(config, map, data[2]);
  var forest = new ForestData(config, map);
  var current_data = openAQ;
  
  // Get geojson bounds
  const b = path.bounds(geojson);

  // scale 
  const s = 0.99 / Math.max((b[1][0] - b[0][0]) / config.width, (b[1][1] - b[0][1]) / config.height); 

  // transform
  const t = [(config.width - s * (b[1][0] + b[0][0])) / 2, (config.height - s * (b[1][1] + b[0][1])) / 2];

  // update projection
  projection
      .scale(s)
      .translate(t);

  // Draw the map
  const countryPaths = map
    .selectAll(".country")
      .data(geojson.features)
      .enter()
        .append("path")
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
          // Highlight country
          //d3.select(this.parentNode.appendChild(this)).style('stroke', config.borderColor[1]);
        }).on('mouseout', function(event, d) {
          // unHighlight country
          //d3.select(this).style('stroke', config.borderColor[0]);
        });

  current_data.enter(projection, b);
  
  // Handle click on Switzerland
  d3.select("#swissButton").on("click", swissZoom )
  function swissZoom() {
    const t = d3.transition().duration(1800);

    const cantonPaths = map.selectAll('.canton')
        .data(cantons.features);

    const enterCantonPaths = cantonPaths.enter().append('path')
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
        });

    countryPaths.on('mouseover', function(event, d) {
      //disable mouseover for countries
    }).on('mouseout', function(event, d) {
      //disable mouseover for countries
    });

    
    // Get geojson bounds
    const b = path.bounds(cantons);

    projection.fitSize([config.width - config.padding*2, config.height - config.padding*2], cantons);

    countryPaths.transition(t)
        .attr('d', path)
        .style("stroke-opacity", "0");

    countryPaths.transition(t)
        .attr('d', path)
        .style('fill', '#949494');

    enterCantonPaths.transition(t)
        .attr('d', path)
        .style('opacity', 1);

    cantonPaths.exit().transition(t)
        .attr('d', path)
        .style('opacity', 0)
        .remove();

    current_data.swiss(projection, b, t);
  }

  // Handle click on World
  d3.select("#worldButton").on("click", worldZoom )
  function worldZoom() {
    var t = d3.transition().duration(1200);

    // Get geojson bounds
    const b = path.bounds(geojson);

    projection.fitSize([config.width - config.padding*2, config.height - config.padding*2], geojson);

    countryPaths.transition(t)
        .attr('d', path)
        .style("stroke-opacity", "1");

    countryPaths.transition(t)
        .attr('d', path)
        .style('fill', function (d) { return "#F2F2F2"});

    countryPaths.on('mouseover', function(event, d) {
                //d3.select(this.parentNode.appendChild(this)).style('stroke', config.borderColor[1]);
              }).on('mouseout', function(event, d) {
                //d3.select(this).style('stroke', config.borderColor[0]);
              });

    map.selectAll('.canton')
        .data([])
        .exit().transition(t)
        .attr('d', path)
        .style('opacity', 0)
        .remove();

    current_data.world(projection, b, t);
  }

  // handle change of data
  d3.select('#selectData')
    .on('change', function() {
      worldZoom();
      switch(d3.select(this).property('value')) {
        case "deforestation":
          current_data.leave(path);
          current_data = forest;
          current_data.enter(projection, b, s);
          break;
        case "air-pollution":
          current_data.leave(path);
          current_data = openAQ;
          current_data.enter(projection, b, s);
          break;
        
      }

  });
}









