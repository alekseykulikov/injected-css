<img width="793" alt="{:;} injected-css" src="https://cloud.githubusercontent.com/assets/158189/25124387/d92cd514-242b-11e7-9cc7-91ad902a7d7e.png">

[![](https://circleci.com/gh/alekseykulikov/injected-css.svg?style=shield)](https://circleci.com/gh/alekseykulikov/injected-css)
[![](https://img.shields.io/npm/v/injected-css.svg)](https://npmjs.com/package/injected-css)
[![](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](https://standardjs.com)

> Structured way to write CSS in JS file.

## Usage

Install the package:

```bash
$ npm install injected-css
```

Add `injected-css/babel` to plugins section in your babel config:

```json
{
  "plugins": [
    "injected-css/babel"
  ]
}
```

Define real CSS in your JS file using *css`{}`* template expression,
and refer to resulted classes using `style` object.

```js
import { css } from 'injected-css'
import { red, white, mobile } from '../my-theme' // use js variables

const style = css`
  text-align: center;

  &-button {
    background-color: ${red};
    width: 32rem;
    padding: 2rem;
    border-radius: 0.5rem;
    border: none;

    &:hover {
      background-color: ${white};
    }

    @media ${mobile} {
      width: 16rem;
    }
  }
`

document.innerHTML = `
  <div class="${style}">
    <button class="${style.button}">Click me!</button>
  </div>
`
```

It transforms to:

```js
import { css } from 'injected-css';
import { red, white, mobile } from '../my-theme';

const style = css.inject({
  toString() { return 'c3423985940'; },
  button: 'c3423985940-button',
  _css: `.c3423985940 { text-align: center } .c3423985940-button { background-color: ${red}; width: 32rem; padding: 2rem; border-radius: 0.5rem; border: none
  } .c3423985940-button:hover { background-color: ${white} } @media ${mobile} { .c3423985940-button { width: 16rem } }`  
});

document.innerHTML = `
  <div class="${style}">
    <button class="${style.button}">Click me!</button>
  </div>
`;
```

## Benefits

- Write **real CSS** and use JS for import/export, variables and dynamic strings
- Use powerful tools of JS world
  - ES modules to manage dependencies between styles and JS components
  - Eslint to ensure, it's hard to write bad CSS
  - Variables and functions
  - Webpack 2, Hot Module Replacement, code splitting, and server side render
- Built-in naming convention for component world
- Postcss integration ([100s of plugins](https://github.com/postcss/postcss/blob/master/docs/plugins.md) and custom syntaxes like SASS)
- Minimal overhead (no parsing cost, 400 byte runtime)

## Custom postcss config

Just create `.postcssrc.js` file with content similar to ([read more about postcss config](https://github.com/michael-ciniawsky/postcss-load-config)):

```js
module.exports = (ctx) => ({
  plugins: [
    require('postcss-cssnext')({ 'features': { 'rem': false } }),
    ctx.env === 'production' ? require('cssnano')({ autoprefixer: false }) : false
  ]
})

```

## Inject global styles

Use `inject()` method to insert global `css` string.
Everything tagged literal with _css``_ will be preparsed with postcss.

```js
import { inject, css } from 'injected-css'
import normalizeCss from 'normalize.css'
import { mobile } from '../my-theme';

// insert regular css, like normalize.css

inject(normalize)

// setup global typography

inject(css`
  html {
    font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
    font-weight: normal;
    font-size: 62.5%; /* 1rem ~ 10px */

    @media ${mobile} {
      font-size: 56.25%; /* 1rem ~ 9px */
    }
  }
`)
```

## Server side render

Use `flush()` method to get all css calls.

```js
import { flush } from 'injected-css'
import { App } from './App'

const body = renderToStaticMarkup(<App />)
const css = reset._css + flush().join('')

const html = `
  <!doctype html>
  <html lang='en-US'>
    <head>      
      <title>My App</title>
      <style>${css}</style>
    </head>
    <body>
      ${body}
    </body>
  </html>
`

const reset = inject(css`
  html {
    -ms-text-size-adjust: 100%;
    -webkit-text-size-adjust: 100%;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  }

  body {
    margin: 0;
  }
`)
```

## Syntax highlight

**Atom** with [language-babel](https://github.com/gandm/language-babel) plugin supports syntax highlight and autocompletion by default.
<img width="434" alt="atom-language-babel" src="https://cloud.githubusercontent.com/assets/158189/24708649/c7530534-1a17-11e7-845a-d2319a78504a.png">

## Credits

- [BEM](https://css-tricks.com/bem-101/) and [SUIT CSS](https://github.com/suitcss/suit/blob/master/doc/naming-conventions.md) - for name convention, [that works](https://gist.github.com/alekseykulikov/68a5d6ddae569f6d0456b0e9d603e892)
- [CSS modules](https://github.com/css-modules/css-modules) - for embracing CSS syntax and adding the way to reference on classes from JS code
- [style-loader](https://github.com/webpack-contrib/style-loader) - for concept of loading styles with js
- [styled-jsx](https://github.com/zeit/styled-jsx) - for idea of babel plugin and this credits section
- [@rtsao](https://github.com/rtsao) - for his open-source work on many css-in-js libraries
- [styling](https://github.com/andreypopp/styling) - for embracing ES modules to export CSS
- [react](https://facebook.github.io/react/) - for component approach and development philosophy
- [CSS: The Definitive Guide](http://shop.oreilly.com/product/0636920012726.do) - for explaining me details of CSS
- [styled-components](https://github.com/styled-components/styled-components) - for showing how to highlight CSS in tagged template literal

## License

[MIT]('./LICENSE')
