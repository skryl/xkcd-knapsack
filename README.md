# XKCD Knapsack Problem

You can read more about it [here](http://xkcd.com/287/),
[here](http://en.wikipedia.org/wiki/Knapsack_problem) and
[here](http://en.wikipedia.org/wiki/Subset_sum_problem). There is also a running
demo available [here](http://xkcd287.herokuapp.com).


## How it Works

To use the knapsack solver, simply drag a well formatted menu file into the
plate area. Your menu file should look like the example below. Notice that the
goal amount for the solver is on the first line. The parser isn't very smart so
all formatting is required.

```
$15.05
mixed fruit,$2.15
french fries,$2.75
side salad,$3.35
hot wings,$3.55
mozzarella sticks,$4.20
sampler plate,$5.80
barbecue,$6.55
```

Large menus (> 50 items) may take a while to solve. If the number of
combinations is too large to display using visualization then the page will
simply tell you the number of solutions it found.


## The Algorithm

I used an approach similar to the Polynomial Time Approximation algorithm
below. In essence it builds a power set of the given set of numbers while
simultanesouly trimming all elements that are larger than the goal sum or are
close in magnitude to one another.

```
initialize a list S to contain one element 0.
 for each i from 1 to N do
   let T be a list consisting of xi + y, for all y in S
   let U be the union of T and S
   sort U
   make S empty 
   let y be the smallest element of U 
   add y to S 
   for each element z of U in increasing order do
      //trim the list by eliminating numbers close to one another
      //and throw out elements greater than s
     if y + cs/N < z ≤ s, set y = z and add z to S 
if S contains a number between (1 − c)s and s, output yes, otherwise no
```

The straight power set approach is an exponential time algorithm while the one
described here is close to O(m * n). For a proof see
[here](http://www.cs.dartmouth.edu/~ac/Teach/CS105-Winter05/Notes/nanda-scribe-3.pdf).


## Caveats

This specific implementation does not allow for identical items to appear in a
single platter combination.
