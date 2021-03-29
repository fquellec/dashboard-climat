class ForestData {
  constructor(config, map, data) {
    this.config = config;
    this.map = map;

  }

  swiss(projection, bounds, transition){
	
  }

  world(projection, bounds, transition){
	
  }

  enter(projection, bounds){

    // scale and position
    const raster_width = (bounds[1][0] - bounds[0][0]) * projection.scale();
    const raster_height = (bounds[1][1] - bounds[0][1]) * projection.scale();

    const rtranslate_x = (config.width - raster_width) / 2;
    const rtranslate_y = (config.height - raster_height) / 2;
    
    const forest_cover = this.map.append("image")
    .attr('class', 'img')
    .attr('id', 'europe')
    .attr("xlink:href", "assets/forestLost/global_forest_20km/transparent.png")
    .attr("width", raster_width)
    .attr("height", raster_height)
    .attr("transform", "translate(" + rtranslate_x + ", " + rtranslate_y + ")")
    .style("opacity", 0);
    

    const forest_loss = this.map.append("image")
    .attr('class', 'img')
    .attr('id', 'europe')
    .attr("xlink:href", "assets/forestLost/gross_forest_loss_20km/transparent.png")
    .attr("width", raster_width)
    .attr("height", raster_height)
    .attr("transform", "translate(" + rtranslate_x + ", " + rtranslate_y + ")")
    .style("opacity", 0);

    forest_cover.transition().duration(1500).ease(d3.easeLinear).style("opacity", 1);
    forest_loss.transition().duration(1500).ease(d3.easeLinear).style("opacity", 1);
  }

  leave(path){
    //
    this.map.selectAll('image').transition().duration(1500).ease(d3.easeLinear).style("opacity", 0).remove();
  }
}