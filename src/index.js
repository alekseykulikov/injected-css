
/**
 * Detect server render.
 */

const isServer = typeof window === 'undefined'
let styles = {}
export const flush = () => {
  const ret = Object.keys(styles).map((key) => styles[key])
  styles = {}
  return ret
}

/**
 * Cache style tags to avoid double injection.
 */

const styleTags = {}

/**
 * Inject css object (result of babel compilation) to dom.
 *
 * @param {Object|string} obj
 * @return {Object|string}
 */

export function inject (obj) {
  const str = typeof obj === 'string' ? obj : obj._css
  const hash = typeof obj === 'string' ? stringHash(str) : obj._hash

  if (isServer) {
    return new Proxy(obj, {
      get (target, prop, receiver) {
        if (prop !== '_css' && !styles[hash]) styles[hash] = str
        return target[prop]
      }
    })
  }

  if (styleTags[hash]) {
    const tag = styleTags[hash]
    tag.innerHTML = str
  } else {
    const tag = document.createElement('style')
    tag.appendChild(document.createTextNode(str))
    styleTags[hash] = tag

    const head = document.head || document.getElementsByTagName('head')[0]
    head.appendChild(tag)
  }

  return obj
}

/**
 * Placeholder for babel compiler.
 */

export function css () {
  throw new Error('Please transform your code with "injected-css/babel"')
}
css.inject = inject

/**
 * A fast string hashing function,
 * copied from https://github.com/darkskyapp/string-hash
 *
 * @param {string} str
 * @return {number} 0..4294967295
 */

function stringHash (str) {
  let hash = 5381
  let i = str.length

  while (i) {
    hash = (hash * 33) ^ str.charCodeAt(--i)
  }

  /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
   * integers. Since we want the results to be always positive, convert the
   * signed int to an unsigned by doing an unsigned bitshift. */
  return hash >>> 0
}
