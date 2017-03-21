
/**
 * Create new CSS rule, which is basically key/value record.
 * Function is inspired by `React.createElement(Component, props, children)`.
 *
 * @param  {string} selector            key (dom selector, preferably unique)
 * @param  {string} declarations        value (string of css properties)
 * @param  {Array<Object>} [nesting=[]] list of nested rules
 * @return [Object]
 */

export function css (selector, declarations, nesting = []) {
  if (typeof selector !== 'string') throw new TypeError(`invalid selector: ${selector}`)
  if (typeof declarations !== 'string') throw new TypeError(`invalid declarations: ${declarations}`)
  if (!Array.isArray(nesting)) throw new TypeError(`nesting argument has to be an array`)
  if (nesting.some(rule => !rule.isRule()).length) throw new TypeError(`nesting array accepts only rules`)

  let parentSelector = ''
  let rule = {
    getSelector () { return selector },
    getDeclarations () { return declarations },
    setParentSelector (val) { parentSelector = val },
    isRule () { return true },
    toString () {
      return parentSelector ? `${parentSelector}-${selector}` : selector
    }
  }

  nesting.forEach((nestedRule) => {
    nestedRule.setParentSelector(selector)
    rule[nestedRule.getSelector()] = nestedRule
  })

  return rule
}

// minuses:
// - nested css rules depend on parent, but they don't know about this
// - returning object has a lot of unnecessary data
