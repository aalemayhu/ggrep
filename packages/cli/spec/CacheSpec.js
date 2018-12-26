describe("Cache", function() {
  const { GGCache } = new require("../cache");
  
  var cache;

  beforeEach(function() {
    cache = new GGCache();
  });

  it("should pass", function() {
    expect(1).toEqual(2-1);
  })

  // TODO: check the cache entry output when writing
  // TODO: check format of cache entry when reading
  // TODO: test cache invalidation
});
