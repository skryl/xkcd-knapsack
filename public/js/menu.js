/**
* Title:  XKCD Knapsack Problem
* Author: Alex Skryl
*
* Description: 
* 
* A solution for a special case of the Knapsack Problem called the Subset-Sum
* Problem. The algorithm is able count the number of solutions in polynomial time
* by constructing a partition tree of a number and traversing it to determine the
* number of subsets for that node. Actually displaying the solution is more
* memory and computationally intensive.
*
* Assumptions
* 
* The implementation assumes that no two items can be repeated in a combination.
*
* References: 
*
* JavaScript PowerSet Implementation: 
*   http://rosettacode.org/wiki/Power_set#JavaScript
* Subset-Sum Problem: 
*   http://en.wikipedia.org/wiki/Subset_sum_problem#Polynomial_time_approximate_algorithm
*
*/

/**
* The menu constructor
*
* @class menu
* @constructor
* @param {String} content Raw representation of the goal and menu items
* @return {Object} A menu object for solving the given problem
*/

menu = function (content) {
  var that = {};
  var items, goal;

  /** 
  * Memoization caches
  */
  var partitionTree, 
      counts = [], 
      solutions = [];


  /**
  * Solves the subset sum problem for the given combination of menu items
  *
  * @method solve
  * @param {Object} p A config object
  * @param {String} p.max Max number of solutions to find
  * @param {String} p.countOnly Return the count but not the solutions
  * @param {String} p.success Callback, called when the number of solutions is acceptable
  * @param {String} p.fail Callback, called when too many or no solutions were found
  * @return {Object} Returns an info object with relevant results
  */

  var solve = function(p) {
    var info, count, solution; 
    p = p || {};

    var formatter = function (d) {
      return { children: d.map(function (c) { return { children: c.map(function (n) { return {name: n.name, price: n.price} }) } }) }
    };

    partitionTree = partitionTree || buildPricePartitionTree();
    count = counts[goal] || countSolutions();

    info = { menu: items, price: goal, count: count };
    if (count === 0 || count > (p.max || Infinity)) { 
      p.fail && p.fail(info); 
    } else {
      if (!p.countOnly) {
        solution = solutions[goal] || findSolutions();
        info.solution = formatter(solution);
      }
      p.success && p.success(info);
    }

    return info;
  };

  
  /**
  * Builds a partition tree (A compressed powerset) of all the possible
  * solutions. This happens in approximately polynomial time.
  *
  * @private
  * @method buildPricePartitionTree
  */

  var buildPricePartitionTree = function () {
    var ps= [[]], 
        tree = [],
        price, cur_set, cur_item;

    for (var i=0; i < items.length; i++) {
      for (var j = 0, len = ps.length; j < len; j++) {
        cur_set = ps[j];
        cur_item = items[i];
        sum = sumItems(cur_set) + cur_item.price;

        if (sum <= goal) {
          if (!tree[sum]) {
            tree[sum] = [];
            ps.push([ {name: '__any__', price: sum} ]);
          }
          tree[sum].push(cur_set.concat(cur_item));
        }
      }
    }
    return tree;
  };


  /**
  * Counts the number of subsets for the given price
  *
  * @private
  * @method countSolutions
  */

  var countSolutions = function () {
    return treeReducer(0, counts, 
               function (a,b) { return a + b },
               function (sol) { return 1 },
               function (val, sol) { return val });
  }


  /**
  * Collects all the subsets for the given price
  *
  * @private
  * @method countSolutions
  */

  var findSolutions = function () {
    return treeReducer([], solutions, 
               function (a,b) { return a.concat(b) },
               function (sol) { return [sol] },
               function (val, sol) { return val.map(function (s) { return s.concat(sol[1]); }); });
  }


  /**
  * Reduces the paritition tree using a custom accumulator
  *
  * @private
  * @method treeReducer
  * @param {Object} acc Accumulator object
  * @param {Object} cache A cache for memoization
  * @param {function} bModify A return value modifier for the base case
  * @param {function} rModify A return value modifier for the recursive case
  */

  var treeReducer= function (acc, cache, concat, bModify, rModify) {
    var partitions = partitionTree[goal];
    if (!partitions) return acc;

    var recur = function (partitions) {
      var price, val, partition_set;

      var partitionFilter = function (a, sol) {
        var first = sol[0], 
            last  = sol[1];

        var priceFilter = function (a,p) {
          var less = true;
          for (var i = p.length; i--;) {
            if (p[i].price >= last.price) less = false;
          }
          less && a.push(p);
          return a;
        }

        if (first.name === '__any__') {
          price = first.price;

          val = cache[price];
          if (!val) {
            partition_set = partitionTree[price].reduce(priceFilter, []);
            val = recur(partition_set);
            cache[price] = val;
          } 

          return concat(a, rModify(val, sol));
        } else {
          return concat(a, bModify(sol));
        }
      }

      return partitions.reduce(partitionFilter, acc) 
    };

    return recur(partitions);
  };


  /**
  * Parses the menu string
  * TODO: error on bad format
  *
  * @private
  * @method parseMenu
  */

  var parseMenu = function (content) {
    var lines = content.split('\n'),
        price = lines.shift().trim().slice(1),
        list = [], pair = [], line = '';

    for (var i=lines.length; i--;) {
      line = lines[i].trim();
      if (line) {
        pair = lines[i].split(',');
        pair[0] = pair[0].trim();
        pair[1] = pair[1].trim().slice(1);
        list.push(pair);
      }
    }

    // multiply all amounts by 100 to avoid IEEE math
    list = list.map( function (i) { return { name: i[0], price: parseInt(i[1]*100) } });

    // menu list MUST be sorted for the above approach to work!
    list = list.sort( function (a,b) { return a.price - b.price } );

    return [price, list];
  };


  /**
  * Sums the prices for a list of menu items
  *
  * @private
  * @method parseMenu
  */

  var sumItems = function (ary) {
    return ary.reduce(function (a,i) { return a + i.price; }, 0);
  };


  /**
  * The Constructor
  */

  var menu = parseMenu(content);
  goal = parseInt(menu[0]*100);
  items = menu[1];
      

  /**
  * The Interface
  */

  // temp
  that.partitionTree = function () { return partitionTree; };
  //
  that.solve = solve;
  that.count = function () { return solve({countOnly: true}); };
  that.menu = function () { return items.slice(0); };

  return that;
};
