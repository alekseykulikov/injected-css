const postcss = require('postcss')
const prefixer = postcss([ require('postcss-cssnext') ])

module.exports = () => {
  return {
    visitor: {
      TaggedTemplateExpression (path) {
        const { tag } = path.node
        if (tag.name === 'css') {
          console.log(extractCss(path))
        } else if (tag.object && tag.property && tag.object.name === 'inject' && tag.property.name === 'css') {
          console.log(extractCss(path))
        }
      }
    }
  }
}

/**
 * Extract content inside of css`` expression and process with postcss.
 * Stubs extraction is required, because otherwise postcss fails.
 *
 * Adopted code from:
 * https://github.com/threepointone/markdown-in-js/blob/master/src/babel.js#L73
 * https://github.com/threepointone/glamor/blob/master/src/css/babel.js#L156
 *
 * @return {String}
 */

function extractCss (path) {
  const code = path.hub.file.code
  const stubs = path.node.quasi.expressions.map(x => code.substring(x.start, x.end))
  const strs = path.node.quasi.quasis.map(x => x.value.cooked)
  const stubCtx = stubs.reduce((o, stub, i) => {
    o['stub-' + i] = stub
    return o
  }, {})

  let ctr = 0
  const src = strs.reduce((arr, str, i) => {
    arr.push(str)
    if (i !== stubs.length) {
      arr.push('stub-' + ctr++)
    }
    return arr
  }, []).join('')

  const parsedSrc = prefixer.process(src).css
  const newSrc = parsedSrc.replace(/stub-[0-9]+/gm, x => '${' + stubCtx[x] + '}')
  return newSrc
}
