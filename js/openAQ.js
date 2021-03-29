class OpenAQdata {
	constructor(config, map, data) {
		this.config = config;
		this.map = map;
		this.bubbleData = data

		// Add scale for bubbles color 
	    const minPm = d3.min(this.bubbleData, function(d) { return +d.value; });
		const maxPm = d3.max(this.bubbleData, function(d) { return +d.value; });
		this.color = d3.scalePow()
		  .exponent(0.5)
		  .domain([minPm, maxPm])
		  .range(["#FFCE03", "#F00505"])

		// Add a scale for bubbles size
		const minPop = d3.min(this.bubbleData, function(d) { return +d.population; });
		const maxPop = d3.max(this.bubbleData, function(d) { return +d.population; });
		this.size = d3.scaleLinear()
		  .domain([minPop,maxPop]) 
		  .range([ 3, 15])  // Size in pixel

	    // create a tooltip
		this.tooltip = d3.select("#map")
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
		    .style("width", this.config.tooltip_width)
		    .style("pointer-events", "none")
		    .style("webkit-box-shadow", "0px 0px 10px grey")
		    .style("moz-box-shadow",  "0px 0px 10px grey")
		    .style("box-shadow", "0px 0px 10px grey");
	}

	swiss(projection, bounds, transition){
		var sizeCH = d3.scaleLinear()
			.domain([0,1000]) 
			.range([ 3, 15])  // Size in pixel

		this.bubbles.transition(transition)
		    .attr("cx", function(d){ return projection([d.lon, d.lat])[0] })
		    .attr("cy", function(d){ d3.select(this.parentNode.appendChild(this));return projection([d.lon, d.lat])[1] })
		    .attr("r", function(d){ return sizeCH(d.population) });
	}

	world(projection, bounds, transition){
		const size = this.size;
		this.bubbles.transition(transition)
	      .attr("cx", function(d){ return projection([d.lon, d.lat])[0] })
	      .attr("cy", function(d){ d3.select(this.parentNode.appendChild(this));return projection([d.lon, d.lat])[1] })
	      .attr("r", function(d){ return size(d.population) });
	}

	enter(projection, bounds){
		const size = this.size;
		const color = this.color;
		const tooltip = this.tooltip;

		// Draw bubbles 
		this.bubbles = this.map
		  .selectAll(".bubble")
		  .data(this.bubbleData)
		  .enter()
		  .append("circle")
		  	.attr('class', 'bubble')
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
		      const mapWidth = map.node().getBoundingClientRect().width 
		      const mapHeight = map.node().getBoundingClientRect().height 

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
	}

	leave(path){
		const t = d3.transition().duration(1200);

		/*
			this.bubbles.exit().transition(t)
		    .attr('d', path)
		    .style('opacity', 0)
		    .remove();
		 */
		this.map.selectAll('.bubble')
        .data([])
        .exit().transition(t)
        .attr('d', path)
        .style('opacity', 0)
        .remove();
	}
}

