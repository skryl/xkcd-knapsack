describe("Menu", function() {
  var m;
  var content = '10\ncarrots,$1\nfries,$2\nfruit,$3\nsandwitch,$4\njuice,$5\nsteak,$6\nchicken,$7\ncoffee,$8\nice cream,$9\nchips,$10';
  var content_large = '50\na,1\nb,2\nc,3\nd,4\ne,5\nf,6\ng,7\nh,8\ni,9\nj,10\nk,11\nl,12\nm,13\nn,14\no,15\np,16\nq,17\nr,18\ns,19\nt,20\nu,21\nv,22\nw,23\nx,24\ny,25\nz,26\naa,27\nab,28\nac,29\nad,30\nae,31\naf,32\nag,33\nah,34\nai,35\naj,36\nak,37\nal,38\nam,39\nan,40\nao,41\nap,42\naq,43\nar,44\nas,45\nat,46\nau,47\nav,48\naw,49\nax,50'
  var content_no_solution = '$00.01\ncarrots,$1\nfries,$2\nfruit,$3\nsandwitch,$4\njuice,$5\nsteak,$6\nchicken,$7\ncoffee,$8\nice cream,$9';
  var bad_content_goal = 'carrots,$1\nfries,$2\nfruit,$3\nsandwitch,$4\njuice,$5\nsteak,$6\nchicken,$7\ncoffee,$8\nice cream,$9';
  var bad_content_format = 'carrots,fries,fruit';

  beforeEach(function() {
    m = menu(content);
  });

  it("should be able to parse a menu", function() {
    expect(m.goal()).toEqual(1000);
    console.log(m.items);
    expect(m.items().length).toEqual(10);
  });

  describe("Callbacks", function () {
    var spy;

    beforeEach(function() {
      spy = { foo: function () { return true; },
              bar: function () { return true; } };
      spyOn(spy, 'foo');
      spyOn(spy, 'bar');
    });

    it("should call the badParse callback if menu parsing fails", function() {
      m.solve({ badParse: spy.foo });
      expect(spy.foo).not.toHaveBeenCalled();

      m_bad = menu(bad_content_goal);
      m_bad.solve({ badParse: spy.foo });
      expect(spy.foo).toHaveBeenCalled();
    });

    it("should call the fail callback if no solution is found", function() {
      m.solve({ fail: spy.foo });
      expect(spy.foo).not.toHaveBeenCalled();

      m_none = menu(content_no_solution);
      m_none.solve({ fail: spy.foo });
      expect(spy.foo).toHaveBeenCalled();
    });

    it("should call the fail callback if number of solutions is more than max", function() {
      m.solve({ fail: spy.foo, max: 10 });
      expect(spy.foo).not.toHaveBeenCalled();

      m.solve({ fail: spy.foo, max: 5 });
      expect(spy.foo).toHaveBeenCalled();
    });

    it("should call the success callback if number of solutions is within limts", function() {
      m.solve({ success: spy.foo, max: 5 });
      expect(spy.foo).not.toHaveBeenCalled();

      m.solve({ success: spy.foo, max: 10 });
      expect(spy.foo).toHaveBeenCalled();
    });
  });

  describe("Return Values", function () {
    var info;

    it("should only return the number of solutions if the countOnly option is passed", function () {
      info = m.solve({ countOnly: true });
      expect(info.solution).toEqual(undefined);
    });

    it("should return the actual solution if the countOnly option is not passed", function () {
      info = m.solve();
      expect(info.solution.length).toBeGreaterThan(0);
    });
  });

  describe("Algorithmic Correctness", function () {
    var info, solution, count;

    it("should find the correct solution", function () {
      info = m.solve();
      expect(info.count).toEqual(10);

      solution = info.solution.map(function (s) { 
        return s.map(function (p) {
          return p.price/100;
        })
      }).sort();

      console.log(solution);

      expect(solution.toString()).toEqual(
        [[10],[1,9],[2,8],[3,7],[4,6],[1,2,7],[1,3,6],[1,4,5],[2,3,5],[1,2,3,4]].sort().toString())
    });

    it("should determine the correct count", function () {
      m_large = menu(content_large);
      info = m_large.solve();
      expect(info.count).toEqual(3658);
    });

  });

});
