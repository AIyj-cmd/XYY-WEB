const { createConfig } = require('./config/lighthouse.cjs')

module.exports = createConfig({ device: 'desktop', port: 4400 })
