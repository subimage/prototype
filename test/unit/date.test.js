suite("Date Namespace",function(){
  test("DateToJSON() method",function() {
    assert(/^1970-01-01T00:00:00(\.000)?Z$/.match(new Date(Date.UTC(1970, 0, 1)).toJSON()));
  });
  
  test("DateToISOString() method",function() {
    assert(/^1970-01-01T00:00:00(\.000)?Z$/.match(new Date(Date.UTC(1970, 0, 1)).toISOString()));
  });
});