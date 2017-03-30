# injected-css

[![](https://travis-ci.org/alekseykulikov/injected-css.png)](https://travis-ci.org/alekseykulikov/injected-css)
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

const style = css`{
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
}`

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

css.inject(`.c3423985940 { text-align: center } .c3423985940-button { background-color: ${red}; width: 32rem; padding: 2rem; border-radius: 0.5rem; border: none
} .c3423985940-button:hover { background-color: ${white} } @media ${mobile} { .c3423985940-button { width: 16rem } }`);

const style = {
  toString() { return 'c3423985940'; },
  button: 'c3423985940-button'
};

document.innerHTML = `
  <div class="${style}">
    <button class="${style.button}">Click me!</button>
  </div>
`;
```

## Benefits

- Write **real CSS** and use JS for import/export, variables and so on
- Built-in naming convention for component world
- Eslint plugin to ensure CSS best practices
- Minimal overhead (no parsing cost, 300 byte runtime)
- Postcss integration ([100s of plugins](https://github.com/postcss/postcss/blob/master/docs/plugins.md) and custom syntaxes like SASS)
- Server side render support

## Why another CSS-in-JS library?

## Custom postcss config

## Inject global styles

## Syntax highlight

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
