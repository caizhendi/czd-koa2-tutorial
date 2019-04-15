const path = require('path')
const ip = require('ip')
const bodyParser = require('koa-bodyparser')
const cors = require('koa2-cors');
const miSend = require('./mi-send')
const miLog = require('./mi-log')
module.exports = (app) => {
  app.use(cors());
  app.use(miLog({
    env: app.env, // koa 提供的环境变量
    projectName: 'koa2-tutorial',
    appLogLevel: 'debug',
    dir: 'logs',
    serverIp: ip.address()
  }))
  app.use(bodyParser())
  app.use(miSend())
}