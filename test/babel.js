require('babel-register')({
  presets: [
    [
      'env',
      {
        targets: {
          node: 6
        }
      }
    ]
  ],
  sourceMaps: true,
  plugins: [require('../dist/babel')]
})
