var fs = require('fs')

template = fs.readFileSync(__dirname + '/template.html', 'utf-8')
js = fs.readFileSync(__dirname + '/example.js', 'utf-8')

// Monkey patch a Hammer bug. See: 
// https://github.com/hammerjs/hammer.js/pull/637
var proto = require('hammerjs').Swipe.prototype
    , old = proto.attrTest
proto.attrTest = function(input) {
  return old.call(this, input) && input.distance > this.options.threshold
}

// Include example
require('./example.js')

// Show source
code('Template', 'html', template)
code('Javascript', 'javascript', js)

hljs.initHighlightingOnLoad()

function code(title, lang, src) {
  var enc = src.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
    return '&#'+i.charCodeAt(0)+';'
  })

  document.getElementById('sources')
  .insertAdjacentHTML('beforeend',
    '<div class="col sourcecode">'+
      '<h2>'+title+'</h2>'+
      '<pre><code class="'+lang+'">'+
        enc+
      '</code></pre>'+
    '</div>'
  )
}
