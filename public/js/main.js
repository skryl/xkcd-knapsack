/**
 * DOM update helpers
 *
 */

var simpleMenu = "$10.00\ncarrots,$1\nfries,$2\nfruit,$3\nsandwitch,$4\njuice,$5\nsteak,$6\nchicken,$7\ncoffee,$8\nice cream,$9\n" 

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
  updateMenu(info.menu);
}

function failImage() {
  d3.json('json/fail.json', function (d) { circlePack(d) });
}

function showSolution(info) {
  updateInfo(info);
  circlePack(info.solution);
}

function noSolution(info) {
  updateInfo(info);
  failImage();
}

function newMenu(content) {
  menu(content || simpleMenu).solve({ max: 500, success: showSolution, fail: noSolution })
  $('#working').hide()
}

newMenu();
