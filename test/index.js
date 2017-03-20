/* eslint-env mocha */
import { expect } from 'chai'
import { red, white, mobile } from './support/theme'
import { css } from '../src'

describe('style-slice', () => {
  describe('css(selector: string, declarations: string, nesting: Array<Rule>): Rule', () => {
    it('generates object class names', () => {
      const componentName = 'MyComponent'
      const style = css(componentName, 'text-align: center', [
        css('button', `background-color: ${red}; width: 32rem`, [
          css(':hover', `color: ${white}`),
          css(`@media ${mobile}`, 'width: 16rem')
        ])
      ])

      expect(`${style}`).equal(componentName)
      expect(`${style.button}`).equal(`${componentName}-button`)
    })

    it('validates arguments')
  })
})
