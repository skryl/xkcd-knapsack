/**
 * DOM update helpers
 *
 */

var simpleMenu = "10\ncarrots,1\nfries,2\nfruit,3\nsandwitch,4\njuice,5\nchips,6\nchicken,7\nwine,8\nfish,9\nsteak,10" 

function updateMenu(menu) {
  $('#menuitems li').remove();
  for (var i = menu.length; i--;) {
    $('#menuitems').append('<li><div class="grid2column">' + menu[i].name + 
                           '</div> <div class="grid2column lastcolumn">$' + (menu[i].price/100).toFixed(2) + 
                           '</div> <div class="clearfix"></div></li>');
  }
}

function updateInfo(info) {
  $('#info p').text(info.count + ' Combinations');
  $('#info h2').text('$' + (info.price/100).toFixed(2));
  updateMenu(info.items);
}

function failImage() {
  d3.json('json/fail.json', function (d) { circlePack(d) });
}

function showSolution(info) {
  var formatter = function (d) {
    return { children: d.map(function (c) { return { children: c.map(function (n) { return {name: n.name, price: n.price}; }) }; }) };
  };

  updateInfo(info);
  circlePack(formatter(info.solution));
}

function noSolution(info) {
  updateInfo(info);
  failImage();
}

function badMenu(info) {
  updateInfo({items:[], price: 0, count: 0});
  alert('Cannot parse menu file.');
  failImage();
}

function newMenu(content) {
  menu(content || simpleMenu).solve({ max: 500, success: showSolution, fail: noSolution, badParse: badMenu });
  $('#working').hide()
}


$(document).ready(function () {
  newMenu();
  $('#basic-modal-content').modal();
});
