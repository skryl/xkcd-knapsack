# XKCD Knapsack Problem

You can read more about it [here](http://xkcd.com/287/).

## How it Works

To use the knapsack solver, simply drag a well formatted menu file into the
plate area. Your menu file should look like the example below. Notice that the goal amount for the solver
is on the first line. The parser isn't very smart so all formatting is required.

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
combinations is too large to display using the D3 visualization the page will
simply tell you the number of combos it found.

## The Algorithm

## Caveats

This specific implementation does not allow for identical items in a single
combination.
