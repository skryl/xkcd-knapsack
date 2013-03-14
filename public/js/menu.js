/**
* Title:  XKCD Knapsack Problem
* Author: Alex Skryl
*
* Description
*
* A solution for a special case of the Knapsack Problem called the Subset-Sum
* Problem. 
*
* Assumptions
*
* The implementation assumes that no two items can be repeated in a combination.
*
* Testing
*
* Testing for correctness was done against OEIS set A000009, a sequence 
* representing the result of the number of partitions of n into distinct parts.
*
* References
*
* JavaScript PowerSet Implementation:
*   http://rosettacode.org/wiki/Power_set#JavaScript
* Subset-Sum Problem:
*   http://en.wikipedia.org/wiki/Subset_sum_problem#Polynomial_time_approximate_algorithm
* Distinct Integer Partition Function:
*   http://oeis.org/A000009
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

var menu = function (content) {
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
  * @param {Function} p.success Callback, called when the number of solutions is acceptable
  * @param {Function} p.fail Callback, called when too many or no solutions were found
  * @param {Function} p.badParse Callback, called when menu cannot be parsed
  * @return {Object} Returns an info object with relevant results
  */

  var solve = function (p) {
    var info, count, solution;
    p = p || {};

    // Menu parsing failed
    //
    if (!goal|| items.length === 0) {
      p.badParse && p.badParse();
      return false;
    }

    partitionTree = partitionTree || buildPricePartitionTree();
    count = counts[goal] || countSolutions();

    info = { items: items, price: goal, count: count };
    if (count === 0 || count > (p.max || Infinity)) {
      p.fail && p.fail(info);
    } else {
      if (!p.countOnly) {
        solution = solutions[goal] || findSolutions();
        info.solution = solution;
        info.map = partitionTree;
        info.cache = solutions;
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
        sum, cur_set, cur_item;

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
               function (a,b) { return a + b; },
               function (sol) { return 1; },
               function (val, sol) { return val; });
  };


  /**
  * Collects all the subsets for the given price
  *
  * @private
  * @method countSolutions
  */

  var findSolutions = function () {
    return treeReducer([], solutions,
               function (a,b) { return a.concat(b); },
               function (sol) { return [sol]; },
               function (val, sol) { return val.map(function (s) { return s.concat(sol[1]); }); });
  };


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
      var price, cache_key, val, partition_set;

      var partitionFilter = function (a, sol) {
        var first = sol[0],
            last  = sol[1]

        // Removes all pairs where the non composite value is larger than the
        // goal price
        //
        var priceFilter = function (a,p) {
          var less = true;

          for (var i = p.length; i--;) {
            if (p[i].name !== '__any__' && p[i].price >= last.price) less = false;
          }
          less && a.push(p);
          return a;
        };

        if (first.name === '__any__') {
          cache_key = [first.price,last.price].join(',');

          // Check the cache first so we don't have to reduce the same parts of
          // the tree over and over.
          //
          val = cache[cache_key];
          if (!val) {
            partition_set = partitionTree[first.price].reduce(priceFilter, []);
            val = recur(partition_set);
            cache[cache_key] = val;
          }

          return concat(a, rModify(val, sol));
        } else {
          return concat(a, bModify(sol));
        }
      };

      return partitions.reduce(partitionFilter, acc);
    };

    return recur(partitions);
  };


  /**
  * Parses the menu string
  *
  * @private
  * @method parseMenu
  */

  var parseMenu = function (content) {

    var parseMoney = function (val) {
      return val.trim().replace('$','');
    }

    var lines = content.split('\n'),
        price = parseMoney(lines.shift());
        list = [], pair = [], line = '';

    for (var i=lines.length; i--;) {
      pair = lines[i].split(',');

      if (pair.length < 2) continue;
      pair[0] = pair[0].trim();
      pair[1] = parseMoney(pair[1]);

      if (isNaN(pair[1])) continue;
      list.push(pair);
    }

    // multiply all amounts by 100 to avoid IEEE math
    list = list.map( function (i) { return { name: i[0], price: scaleFloat(i[1]) }; });

    // menu list MUST be sorted for the powerset algorithm to work!
    list = list.sort( function (a,b) { return a.price - b.price; } );

    return [price, list];
  };


  /**
  * Random helpers
  *
  */

  var sumItems = function (ary) {
    return ary.reduce(function (a,i) { return a + i.price; }, 0);
  };

  var scaleFloat = function (dec) {
    return parseInt(dec * 100, 10);
  }


  /**
  * The Constructor
  */

  var m = parseMenu(content);
  goal = scaleFloat(m[0]);
  items = m[1];


  /**
  * The Interface
  */

  that.solve = solve;
  that.count = function () { return solve({countOnly: true}); };
  that.goal = function () { return goal; };
  that.items = function () { return items.slice(0); };

  return that;
};
