/* eslint-env mocha */
import { expect } from 'chai'
import { red, white, mobile } from './support/theme'
import { css } from '../src'

describe('csswithjs', () => {
  describe('css(selector: string, declarations: string, nesting: Array<Rule>): Rule', () => {
    it('generates object class names', () => {
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

      expect(`${style}`).equal(componentName)
      expect(`${style.button}`).equal(`${componentName}-button`)
    })

    it('validates arguments')
  })
})

css.inject('string with styles', 'uniqueid')
export const style = {
  toString () { return 'MyComponent' },
  button: 'MyComponent-button'
}
