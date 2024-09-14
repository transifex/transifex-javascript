export const validSegments = [
  { body: '<div>translate</div>', segment: 'translate' },
  { body: '<div ws-content="notranslate_urls">translate2</div>', segment: 'translate2' },
  // block elements
  {
    body: '<p>paragraph with <span>inline element</span></p>',
    segment: 'paragraph with <span>inline element</span>',
  },
  { body: '<p><span>inline text within block</span></p>', segment: 'inline text within block' },
  { body: '<div><p>a paragraph</p>foo</div>', segment: 'a paragraph' },
  // attributes
  { body: '<a title="anchor title"></a>', segment: 'anchor title' },
  { body: '<img title="img title"></a>', segment: 'img title' },
  { body: '<img alt="img alt"></a>', segment: 'img alt' },
  { body: '<p custom-attr="custom attr"></p>', segment: 'custom attr' },
  // important body tags
  { body: '<h1>h1 tag</h1>', segment: 'h1 tag' },
  { body: '<H1>H1 tag</H1>', segment: 'H1 tag' },
  // translatable urls
  { body: '<div ws-content="translate_urls"><img src="#mock_img_src"/></div>', segment: '#mock_img_src' },
  { body: '<div ws-content="translate_urls"><a href="/uploads/"></a></div>', segment: '/uploads/' },
  { body: '<img ws-content="translate_urls" src="#mock_img_src2"/>', segment: '#mock_img_src2' },
  { body: '<div ws-content="translate_urls"><a><img srcset="#mock_img_srcset1"/></a></div>', segment: '#mock_img_srcset1' },
  { body: '<input type="image" src=" alt="input image alt">', segment: 'input image alt' },
  { body: '<input ws-content="translate_urls" type="image" src="input-image-src" alt="input image alt">', segment: 'input-image-src' },
  // inputs
  { body: '<input type="button" value="button value"></input>', segment: 'button value' },
  { body: '<input type="reset" value="reset value"></input>', segment: 'reset value' },
  { body: '<input type="submit" value="submit value"></input>', segment: 'submit value' },
  { body: '<input placeholder="input placeholder"></input>', segment: 'input placeholder' },
  // textarea
  { body: '<textarea placeholder="textarea placeholder"></textarea>', segment: 'textarea placeholder' },
  // fragments
  { body: '<div>fragment<img><noscript></noscript></div>', segment: 'fragment<img>' },
  { body: '<div><noscript></noscript>fragment2<img></div>', segment: 'fragment2<img>' },
  { body: '<div><noscript></noscript><img>fragment3</div>', segment: '<img>fragment3' },
  // custom attributes
  { body: '<div data-foo=\'custom attribute\' ws-attrs=\'data-foo\'></div>', segment: 'custom attribute' },
  { body: '<div data-foo="double quote custom attribute" ws-attrs="data-foo"></div>', segment: 'double quote custom attribute' },
  // head tags
  { head: '<title>head title</title>', segment: 'head title' },
  { head: '<title>company, location | head & title – 10% Off</title>', segment: 'company, location | head & title – 10% Off' },
  { head: '<meta name="keywords" content="meta tag1, tag2, tag3">', segment: 'meta tag1, tag2, tag3' },
  { head: '<meta name="description" content="meta description">', segment: 'meta description' },
  // twitter tags
  { head: '<meta name="twitter:title" content="twitter title"/>', segment: 'twitter title' },
  { head: '<meta name="twitter:description" content="twitter description"/>', segment: 'twitter description' },
  // og tags
  { head: '<meta property="og:title" content="og title"/>', segment: 'og title' },
  { head: '<meta property="og:description" content="og description"/>', segment: 'og description' },
  // google+ tags
  { head: '<meta itemprop="name" content="google+ name"/>', segment: 'google+ name' },
  { head: '<meta itemprop="description" content="google+ description"/>', segment: 'google+ description' },
  // currencies
  { body: '<div>1000.000$</div>', segment: '1000.000$' },
  { body: '<div>1000,00.0£</div>', segment: '1000,00.0£' },
  { body: '<div>0.12a</div>', segment: '0.12a' },
  // comments
  { body: '<div>This is<!-- foo --> a dog<!-- bar --></div>', segment: 'This is a dog' },
  // real world example
  { body: '<li class="dropdown mega mega-align-center sub-hidden-collapse" data-id="764" data-level="1" data-alignsub="center" data-xicon="fa fa-reorder" data-hidewcol="1"><a class=" dropdown-toggle" href="https://www.taus.net/think-tank/think-tank" data-target="#" data-toggle="dropdown"><i class="fa fa-reorder"></i>Think Tank<b class="caret"></b></a></li>', segment: '<i class="fa fa-reorder"></i>Think Tank<b class="caret"></b>' },
  { body: '<p class="p2"><span class="s2">“The woman will overtake a capital city without a drop of blood spilled,” said the war mage, but the propellers picked up speed so that no one heard him. Vox steered <i>The Audacity </i>over the gate and landed in the city square, and the throngs surrounded the airship to welcome the Star Queen home.</span></p>', segment: '“The woman will overtake a capital city without a drop of blood spilled,” said the war mage, but the propellers picked up speed so that no one heard him. Vox steered <i>The Audacity </i>over the gate and landed in the city square, and the throngs surrounded the airship to welcome the Star Queen home.' },
  { body: '<div>Text with script after<script></script> dummy text </div>', segment: 'Text with script after' },
  { body: '<div>dummy text <script></script>Text with script before</div>', segment: 'Text with script before' },
  { body: '<svg>svg</svg>', segment: 'svg' },
];

export const shadowDomHostSegments = [
  { body: '<div id="shadow_dom_host_layer"></div>', segment: '' },
];

export const shadowDomSegments = [
  { body: '<h1>Hello Shadow DOM</h1>', segment: 'Hello Shadow DOM' },
];

export const skippedSegments = [
  // textarea context
  { body: '<textarea>textarea content</textarea>', segment: 'textarea content' },
  // input without type
  { body: '<input value="unset type value"></input>', segment: 'unset type value' },
  // skip classes
  { body: '<div class="notranslate">notranslate</div>', segment: 'notranslate' },
  {
    body: '<div class="facebook_container">facebook_container</div>',
    segment: 'facebook_container',
  },
  {
    body: '<div class="wslive-meta">wslive-meta</div>',
    segment: 'wslive-meta',
  },
  {
    body: '<div class="twitter_container">twitter_container</div>',
    segment: 'twitter_container',
  },
  // user defined skip class
  {
    body: '<div class="skip-class">skip-class</div>',
    segment: 'skip-class',
  },
  // user defined skip tag
  {
    body: '<h3>h3</h3>',
    segment: 'h3',
  },
  // skip nodes
  { body: '<script>var __foo__;</script>', segment: 'var __foo__;' },
  { body: '<style>style</style>', segment: 'style' },
  { body: '<link>link</link>', segment: 'link' },
  { body: '<iframe>iframe</iframe>', segment: 'iframe' },
  { body: '<noscript>noscript</noscript>', segment: 'noscript' },
  { body: '<canvas>canvas</canvas>', segment: 'canvas' },
  { body: '<audio>audio</audio>', segment: 'audio' },
  { body: '<video>video</video>', segment: 'video' },
  { body: '<video>video</video>', segment: 'video' },
  { body: '<time>time</time>', segment: 'time' },
  { body: '<var>var</var>', segment: 'var' },
  { body: '<kbd>kbd</kbd>', segment: 'kbd' },
  // isNotTextualRegex filter Text Nodes
  { body: '<div>1234567</div>', segment: '1234567' },
  { body: '<div>123 &nbsp; ##</div>', segment: '123 &nbsp; ##' },
  { body: '<div>#123#</div>', segment: '#123#' },
  { body: '<div>1,000,00</div>', segment: '1,000,00' },
  { body: '<div>0.12</div>', segment: '0.12' },
  { body: '<div>1 2 3 4 5 6 7 8 9 10    &nbsp; ! @ # $ % ^</div>', segment: '1 2 3 4 5 6 7 8 9 10    &nbsp; ! @ # $ % ^' },
  // isNotTextualRegex filter element attributes
  { body: '<input placeholder="123"></input>', segment: '123' },
];

export const variableSegments = [
  { body: '<div>New\n\n<span class="notranslate">\nVariable\n</span>\nlines\n</div>', segment: 'New {var0} lines' },
  { body: '<div>New<span class="notranslate">\nVariable</span>line</div>', segment: 'New{var0}line' },
  { body: '<div>Hi <span class="notranslate">George Lucas</span></div>', segment: 'Hi {var0}' },
  { body: '<div>You are visitor <var>69</span></div>', segment: 'You are visitor {var0}' },
  { body: '<div>You are visitor <var>69</span></div>', segment: 'You are visitor {var0}' },
  {
    body: '<div>This is a <a href="/uploads/">url as variable</a></div>',
    segment: 'This is a <a href="{var0}">url as variable</a>',
  },
  {
    body: '<div>This is a <span ws-content="exclude">foo</span> inline exclude</div>',
    segment: 'This is a {var0} inline exclude',
  },
  {
    body: '<div>Hello <a s-href="foo">Yo</a> world</div>',
    segment: 'Hello <a {var0}>Yo</a> world',
  },
];

export const nestedSegments = [
  {
    body: '<div ws-content="exclude"><p>First text</p><p ws-content="include">nested exclusion</p><p>third text</p></div>',
    segment: 'nested exclusion',
  },
  {
    body: '<div ws-content="block"><h1>A header</h1><p>A paragraph</p></div>',
    segment: '<h1>A header</h1><p>A paragraph</p>',
  },
];

export const bindings = {
  nestedExclusion: nestedSegments[0],
  nestedBlock: nestedSegments[1],
};

// To test xpath, we start by adding into the body a special "xpath" tag,
// otherwise we have no idea about the dom structure. This way, we know
// that the xpaths will always start from /html[1]/body[1]/xpath[X]/...
export const xpathSegments = [
  { body: '<xpath>xpath1</xpath>', segment: 'xpath1', xpath: '/html[1]/body[1]/xpath[1]' },
  { body: '<xpath><div>xpath2</div></xpath>', segment: 'xpath2', xpath: '/html[1]/body[1]/xpath[2]/div[1]' },
  { body: '<xpath><div>xpath3<br>xpath4</div></xpath>', segment: 'xpath3<br>xpath4', xpath: '/html[1]/body[1]/xpath[3]/div[1]' },
];
