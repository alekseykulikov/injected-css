import condenseWhitespace from 'condense-whitespace'
import deasync from 'deasync'
import postcss from 'postcss'
import nesting from 'postcss-nesting'
import loadConfig from 'postcss-load-config'
import stringHash from 'string-hash'
import path from 'path'

/**
 * Initialize postcss `processor`.
 * Use `deasync` to make async methods sync.
 */

const parseConfig = deasync(cb => {
  loadConfig({}, '', { argv: false }).then(c => cb(null, c)).catch(err => {
    if (err.toString().indexOf('No PostCSS Config found in') !== -1) return cb(null, {}) // ignore, not required
    return cb(err)
  })
})

const config = parseConfig()
const plugins = (config.plugins || []).concat(nesting())
const processor = postcss(plugins)

const processCss = deasync((src, cb) => {
  processor.process(src).then(result => cb(null, result)).catch(err => cb(err))
})

/**
 * Define babel plugin that analyze tagged template literals
 * with `css` tag or `inject.css`, example:
 *
 * const = css`{ color: red }`
 * inject.css`body { font-size: 10px }`
 */

module.exports = ({ types: t }) => {
  return {
    pre() {
      this.hashes = new Map()
      this.classes = new Map()
    },

    visitor: {
      TaggedTemplateExpression(path, state) {
        const { tag } = path.node
        if (tag.name === 'css') {
          const { src, root, prefix, noSelector } = extractCss(path, state.opts, this.classes)
          const selectors = root.nodes
            .filter(node => {
              return (
                node.type === 'rule' &&
                !node.selector.includes(':') &&
                !node.selector.includes('[') &&
                !node.selector.includes('>') &&
                !node.selector.substr(1).includes('.')
              ) // TODO: improve selectors filtering
            })
            .map(node => {
              return node.selector
            })
          const fileHash = stringHash(path.hub.file.opts.filenameRelative)
          const increment = this.hashes.get(fileHash) || 1
          this.hashes.set(fileHash, increment + 1)
          let propertiesString = `{_css: \`${condenseWhitespace(src).replace(
            /\n/g,
            ' '
          )}\`, _hash: "${fileHash}-${increment}"}`
          if (noSelector) {
            const defaultLevel = prefix.split('-').length
            const nestedObject = generateNestedObject(selectors, prefix, defaultLevel)
            propertiesString = transformNestedObjectToString(nestedObject, propertiesString)
          }
          const isVariable = path.parent.type === 'VariableDeclarator'
          path.replaceWithSourceString(isVariable ? `css.inject(${propertiesString})` : propertiesString)
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

function extractCss(path, config, classes) {
  const code = path.hub.file.code
  const stubs = path.node.quasi.expressions.map(x => code.substring(x.start, x.end))
  const strs = path.node.quasi.quasis.map(x => x.value.cooked)
  const stubCtx = stubs.reduce((o, stub, i) => {
    o['stub-' + i] = stub
    return o
  }, {})

  let ctr = 0
  const src = strs
    .reduce((arr, str, i) => {
      arr.push(str)
      if (i !== stubs.length) {
        arr.push('stub-' + ctr++)
      }
      return arr
    }, [])
    .join('')

  const prefix = generateClassName(src, path.hub.file.opts, config, classes)
  const noSelector = src.trim()[0] === '{'
  const result = processCss(noSelector ? `${prefix} ${src}` : src)
  const newSrc = result.css.replace(/stub-[0-9]+/gm, x => '${' + stubCtx[x] + '}')
  return { src: newSrc, root: result.root, prefix, noSelector }
}

/**
 * Generate class name for generic file names: style.js and index.js
 * using `filenameRelative`.
 * Cache repeating names in `classes`.
 *
 * @param {string} src
 * @param {Object} fileOpts - { basename, filenameRelative }
 * @param {Object} config - { namespace, root }
 * @return {string}
 */

function generateClassName(src, { basename, filenameRelative }, { namespace = 'c', root = '' }, classes) {
  if (basename === 'style' || basename === 'index') {
    const pathRelative = path.relative(process.cwd(), filenameRelative)
    const pathWithoutRoot = path.dirname(pathRelative).replace(new RegExp(`^${root}/`), '')
    const pathBlocks = pathWithoutRoot.split('/')
    const uniquePathBlocks = pathBlocks.filter((pathBlock, index) => {
      const nextPathBlock = pathBlocks[index + 1]
      return !nextPathBlock || nextPathBlock.indexOf(pathBlock) !== 0
    })
    const className = uniquePathBlocks.join('-')
    const increment = classes.get(className) || 1
    classes.set(className, increment + 1)
    return `.${namespace}-${className}${increment > 1 ? increment : ''}`
  }
  return `.${namespace}-${stringHash(src)}`
}

/**
 * Transform `selectors` to nested object of `{ root, children }`.
 *
 * @param {Array<string>} selectors
 * @param {string} rootSelector
 * @param {number} level - current nesting level
 * @return {Object}
 */

function generateNestedObject(selectors, rootSelector, level) {
  const childrenSelectors = selectors.filter(selector => {
    return (
      selector !== rootSelector &&
      selector.indexOf(rootSelector) === 0 &&
      selector.split('-').length === level + 1
    ) // TODO optimize selectors filtering
  })
  const children = childrenSelectors.map(childSeletor => {
    return generateNestedObject(selectors, childSeletor, level + 1)
  })
  return { root: rootSelector, children }
}

/**
 * Generate JS representation of nested object.
 *
 * @param  {Object} obj
 * @param  {String} [initialStr]
 * @return [string]
 */

function transformNestedObjectToString(obj, initialStr = '') {
  if (obj.children.length) {
    const children = obj.children.map(child => {
      const prop = child.root.replace(obj.root + '-', '')
      return `"${prop}": ${transformNestedObjectToString(child)}`
    })
    return initialStr
      ? initialStr.replace(
          /}$/,
          `,
          toString() { return "${obj.root.substr(1)}" },
          ${children.join(',')}
        }`
        )
      : `{
          toString() { return "${obj.root.substr(1)}" },
          ${children.join(',')}
        }`
  }
  return initialStr
    ? initialStr.replace(/}$/, `, toString() { return "${obj.root.substr(1)}" } }`)
    : `"${obj.root.substr(1)}"` // remove "." from begining
}
