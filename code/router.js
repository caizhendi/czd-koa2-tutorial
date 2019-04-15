const router = require('koa-router')()
const HomeController = require('./controller/home')
module.exports = (app) => {
  router.post('/getIedInfo', HomeController.getIedInfo);
  router.post('/uploadScreenshot', HomeController.uploadScreenshot);
  app.use(router.routes())
     .use(router.allowedMethods())
}