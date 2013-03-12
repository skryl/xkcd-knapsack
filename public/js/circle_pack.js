/**
 * D3 Zoomable Pack Layout
 *
 * Reference:
 *  http://bl.ocks.org/mbostock/4063530
 *
 */

var w = 600,
    h = 600,
    r = 600,
    x = d3.scale.linear().range([0, r]),
    y = d3.scale.linear().range([0, r]),
    node,
    root;

var pack = d3.layout.pack()
    .size([r, r])
    .value(function(d) { return d.price; })

var vis = d3.select("#plate").insert("svg:svg")
    .attr("width", w)
    .attr("height", h)
  .append("svg:g")
    .attr("transform", "translate(" + (w - r) / 2 + "," + (h - r) / 2 + ")");

var color = d3.scale.category20c();
var defs = d3.selectAll('svg').append('defs')

function zoom(d, i) {
  var k = r / d.r / 2;
  x.domain([d.x - d.r, d.x + d.r]);
  y.domain([d.y - d.r, d.y + d.r]);

  var t = vis.transition().duration(250);

  t.selectAll("circle")
      .attr("cx", function(d) { return x(d.x); })
      .attr("cy", function(d) { return y(d.y); })
      .attr("r", function(d) { return k * d.r; });

  t.selectAll("text")
      .attr("x", function(d) { return x(d.x); })
      .attr("y", function(d) { return y(d.y); })
      .style("opacity", function(d) { return k * d.r > 20 ? 1 : 0; });

  node = d;
  d3.event.stopPropagation();
}

function circlePack(data) {
  node = root = data;

  var nodes = pack.nodes(root);

  cleanupOldPack();

  var gnodes = vis.selectAll("circle")
      .data(nodes).enter().append("svg:circle")
      .attr("id", function(d, i){ return 'circle' + i; })
      .attr("class", function(d) { return d.children ? "parent" : "child"; })
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .attr("r", function(d) { return d.r; })
      .attr("fill", function(d) { return color(d.name); })
      .style("fill", function(d) { return color(d.name); });

  var gtext = vis.selectAll("text")
      .data(nodes).enter().append("svg:text")
      .attr("id", function(d, i){ return 'text' + i; })
      .attr("class", function(d) { return d.children ? "parent" : "child"; })
      .attr("x", function(d) { return d.x; })
      .attr("y", function(d) { return d.y; })
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .style("opacity", function(d) { return d.r > 20 ? 1 : 0; })
      .text(function(d) { return d.name; })

  d3.selectAll("circle").on("click", function(d, i) {
    fetchImages(d,i);
    return zoom(node == d ? root : d);
  })

  d3.select(window).on("click", function() { 
    zoom(root); 
    hideImages();
  });

  hideRoot();
}

function cleanupOldPack() {
  d3.selectAll("circle").remove();
  d3.selectAll("text").remove();
}

function hideRoot() {
  d3.select('#circle0').classed('root',true);
}

function fetchImages(d,i) {
  $('circle').hide();
  $('text').hide();
  for(var j = i+1; j <= i+d.children.length; j++){
    $("#circle" + j).show();
    fetchImage($('#text' + j).text(), j);
  }
}

function hideImages() {
  $('circle').each(function (i,e) { e.style['fill'] = e.attributes['fill']['nodeValue'] })
  $('circle').show();
  $('text').show();
}

function fetchImage(keyword, id) {
  $.ajax({
    url: "https://ajax.googleapis.com/ajax/services/search/images?v=1.0&q=" + encodeURIComponent(keyword) + "&callback=?",
    dataType: "jsonp",
    success: function(data) {
      defs.append("svg:pattern")
      .attr("id", "pattern" + id)
      .attr("patternUnits", "userSpaceOnUse")
      .attr("width", 100)
      .attr("height", 100)
      .append("svg:image")
      .attr("xlink:href", data.responseData.results[0].tbUrl)
      .attr("x",0)
      .attr("y",0)
      .attr("width", 100)
      .attr("height", 100);
      
      $('#circle' + id).css('fill', "url(#pattern" + id + ")");
    }
  });
}
