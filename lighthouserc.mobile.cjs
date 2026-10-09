const { createConfig } = require('./config/lighthouse.cjs')

module.exports = createConfig({ device: 'mobile', port: 4401 })
