function foo() {
  return (
    <div>
      <T
        _str="Text 1"
        _context="foo"
        _tags="tag1,tag2"
        _charlimit="10"
        _comment="comment" />

      <T _str="Text 2" _html/>
      <T _str="Text 3" _html _inline />
      <T _str="Text 4" />
    </div>
  );
}
