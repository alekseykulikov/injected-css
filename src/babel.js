const { parse } = require('babylon')
const postcss = require('postcss')
const cssnext = require('postcss-cssnext')
const stringHash = require('string-hash')

/**
 * Initialize postcss `processor`.
 */

const processor = postcss([ cssnext ])

/**
 * Define babel plugin that analyze tagged template literals
 * with `css` tag or `inject.css`, example:
 *
 * const = css`{ color: red }`
 * inject.css`body { font-size: 10px }`
 */

module.exports = () => {
  return {
    visitor: {
      TaggedTemplateExpression (path) {
        const { tag } = path.node
        if (tag.name === 'css') {
          const { src, root, prefix } = extractCss(path)
          const selectors = root.nodes.filter((node) => {
            return node.type === 'rule' && node.selector.indexOf(':') === -1
          }).map((node) => {
            return node.selector
          })
          const propertiesString = transformNestedObjectToString(generateNestedObject(selectors, prefix))
          const injectExpression = parse(`css.inject(\`${src}\`);\n`).program.body[0].expression
          path.parentPath.parentPath.insertAfter(injectExpression)
          path.replaceWithSourceString(propertiesString)
        } else if (tag.object && tag.property && tag.object.name === 'inject' && tag.property.name === 'css') {
          const { src } = extractCss(path, true)
          path.replaceWithSourceString(`inject.css(\`${src}\`)`)
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
 * @param {Path} path
 * @param {boolean} isGlobal
 * @return {string}
 */

function extractCss (path, isGlobal = false) {
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

  const prefix = isGlobal ? '' : '.c' + stringHash(code)
  const result = processor.process(prefix + src)
  const newSrc = result.css.replace(/stub-[0-9]+/gm, x => '${' + stubCtx[x] + '}')
  return { src: newSrc, root: result.root, prefix }
}

/**
 * Transform `selectors` to nested object of `{ root, children }`.
 *
 * @param {Array<string>} selectors
 * @param {string} rootSelector
 * @param {number} level - current nesting level
 * @return {Object}
 */

function generateNestedObject (selectors, rootSelector, level = 1) {
  const childrenSelectors = selectors.filter(selector => {
    return selector !== rootSelector && selector.indexOf(rootSelector) === 0 && selector.split('-').length === (level + 1)
  })
  const children = childrenSelectors.map((childSeletor) => {
    return generateNestedObject(selectors, childSeletor, level + 1) // TODO optimize selectors filtering
  })
  return { root: rootSelector, children }
}

/**
 * Generate JS representation of nested object.
 *
 * @param  {Object} obj
 * @return [string]
 */

function transformNestedObjectToString (obj) {
  if (obj.children.length) {
    const children = obj.children.map((child) => {
      const prop = child.root.replace(obj.root + '-', '')
      return `"${prop}": ${transformNestedObjectToString(child)}`
    })
    return `{
      toString() { return "${obj.root.substr(1)}" },
      ${children.join(',')}
    }`
  }
  return `"${obj.root.substr(1)}"` // remove "." from begining
}
