const postcss = require('postcss')
const prefixer = postcss([ require('postcss-cssnext') ])

module.exports = ({ types: t }) => {
  return {
    visitor: {
      TaggedTemplateExpression (path) {
        const { tag } = path.node
        if (tag.name === 'css') {
          const { src, root, prefix } = extractCss(path)
          root.nodes.forEach((node) => {
            if (node.type === 'rule' && node.selector !== prefix && node.selector.indexOf(':hover') === -1) {
              console.log(node.selector)
            }
          })
          const style = `{
            toString () {
              return '${prefix}'
            }
          }`
          const inject = `css.inject(\`${src}\`)`
          console.log(style)
          console.log(inject)
        } else if (tag.object && tag.property && tag.object.name === 'inject' && tag.property.name === 'css') {
          const { src } = extractCss(path)
          console.log(`css.inject(\`${src}\`)`)
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

  const prefix = '.c' + generatesHash(code)
  const result = prefixer.process(prefix + src)
  const newSrc = result.css.replace(/stub-[0-9]+/gm, x => '${' + stubCtx[x] + '}')
  return { src: newSrc, root: result.root, prefix }
}

// https://github.com/darkskyapp/string-hash

function generatesHash (str) {
  let hash = 5381
  let i = str.length

  while (i) {
    hash = (hash * 33) ^ str.charCodeAt(--i)
  }

  return hash >>> 0
}
