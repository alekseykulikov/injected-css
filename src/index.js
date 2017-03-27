
export function css () {
  throw new Error('Please transform your code with "injected-css/babel"')
}
export const inject = {}

inject.css = css.inject = function injectCss (str) {
  makeStyleTag(str)
}

// https://github.com/zeit/styled-jsx/blob/master/src/render.js

function makeStyleTag (str) {
  // based on implementation by glamor
  const tag = document.createElement('style')
  tag.appendChild(document.createTextNode(str))

  const head = document.head || document.getElementsByTagName('head')[0]
  head.appendChild(tag)

  return tag
}
