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
        background: ${red};
        width: 32rem;
        padding: 2rem;
        border-radius: 0.5rem;
        border: none;
        outline: none;

        &:hover {
          background: ${white};
        }

        @media ${mobile} {
          width: 16rem;
        }

        &-icon {
          color: ${red};
        }

        &-text {
          color: ${white};
        }
      }
    }`

    expect(`${style}`).a('string')
    expect(`${style.button}`).equal(`${style}-button`)
    expect(`${style.button.icon}`).equal(`${style}-button-icon`)
    expect(`${style.button.text}`).equal(`${style}-button-text`)
  })
})
