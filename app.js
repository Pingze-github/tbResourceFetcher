
const Koa = require('koa');
const ResourcesGetter = require('./ResourcesGetter');


async function main() {
  const app = new Koa();
  const reGetter = new ResourcesGetter();

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


  app.use(async ctx => {
    if (ctx.query.key &&
      (ctx.query.key.includes('detail.tmall.com/item.htm') || ctx.query.key.startsWith('https://m.tb.cn/'))) {
      const resources = await reGetter.getByPageUrl(ctx.query.key);
      return ctx.body = JSON.stringify(resources);
    }
    return ctx.body = 'null'
  });

  console.log('engine start @ 10020');
  app.listen(10020);
}

main();