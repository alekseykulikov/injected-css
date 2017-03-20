# style-slice

> CSS in .js file.

## Example

```js
import { css } from 'style-slice'
import { red, white, mobile } from '../theme'

const style = css`
  text-align: center;

  &-button {
    background-color: ${red};
    width: 32rem;
    padding: 2rem;
    border-radius: 0.5rem;
    border: none;
    outline: none;

    &:hover {
      color: ${white};
    }

    @media ${mobile} {
      width: 160px
    }
  }
`

document.innerHTML = `
  <div class="${style}">
    <button class="${style.button}">Click me!</button>
  </div>
`
```

## License

[MIT]('./LICENSE')
