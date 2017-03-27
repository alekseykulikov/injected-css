
export function css () {
  throw new Error('Please transform your code with injected-css/babel')
}

css.inject = function inject (key, str) {
  console.log('inject "%s" with "%s"', key, str)
}
