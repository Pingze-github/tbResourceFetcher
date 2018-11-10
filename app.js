
const path = require('path');

const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const Router = require('koa-router');
const render = require('koa-ejs');
const Static = require("koa-static");

const ResourcesGetter = require('./ResourcesGetter');

process.on('unhandledRejection', rej => {
  console.error(rej);
});

async function main() {
  const app = new Koa();
  const router = new Router();

  app.use(bodyParser());

  app.use(Static(__dirname+ "/static", { extensions: ['js', 'css']}));

  render(app, {
    root: path.join(__dirname, 'view'),
    layout: 'template',
    viewExt: 'html',
    cache: false,
    // debug: true
  });


  const reGetter = new ResourcesGetter();
  console.log(await reGetter.getByPageUrl('https://detail.tmall.com/item.htm?spm=a220o.1000855.w5003-21040130750.14.53cf45c8PKcYFB&id=572209338779&scene=taobao_shop'))

  // logger
  app.use(async (ctx, next) => {
    await next();
    const rt = ctx.response.get('X-Response-Time');
    console.log(`${ctx.method} ${ctx.url} - ${rt}`);
  });

  // x-response-time
  app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.set('X-Response-Time', `${ms}ms`);
  });

  router.get('/', async ctx => {
    await ctx.render('index');
  });

  router.post('/fetch', async ctx => {
    if (ctx.request.body.key &&
      (ctx.request.body.key.includes('detail.tmall.com/item.htm') || ctx.request.body.key.includes('https://m.tb.cn/'))) {

      const matches = ctx.request.body.key.match(/http[\w\-\.,@?^=%&:\/~\+#]+/);

      if (!matches) {
        return ctx.body = 'null';
      }

      const key = matches[0];

      const resources = await reGetter.getByPageUrl(key);
      console.log(resources);
      return ctx.body = JSON.stringify(resources);
    }
    return ctx.body = 'null';
  });

  console.log('engine start @ 10020');
  app
    .use(router.routes())
    .use(router.allowedMethods())
    .listen(10020);
}

main();