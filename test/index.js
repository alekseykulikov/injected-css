/* eslint-env mocha */
import { expect } from 'chai'
import { jsdom } from 'jsdom'
import { red, white, mobile } from './support/theme'
import { css } from '../src'

describe('injected-css', () => {
  beforeEach(() => {
    global.document = jsdom()
  })

  it('generates object with class names', () => {
    const style = css`{
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
          width: 16rem;
        }
      }
    }`

    expect(`${style}`).a('string')
    expect(`${style.button}`).equal(`${style}-button`)
  })
})
