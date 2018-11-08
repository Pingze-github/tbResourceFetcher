
const puppeteer = require('puppeteer');

class ResourcesGetter {
  constructor() {
    this.maxPages = 5;
  }

  async init() {
    this.browser = await puppeteer.launch({ headless: true });
  }

  async getByPageUrl(url) {


    if (!this.browser) {
      await this.init();
    }

    const pagesNow = (await this.browser.pages()).length;
    if (pagesNow === this.maxPages) {
      throw new Error('Cannot open more pages! now:', pagesNow);
    }

    console.log('Start fetching...', url);

    const page = await this.browser.newPage();
    page.setViewport({ width: 1080, height: 720});
    await page.goto(url, {waitUntil: 'domcontentloaded'});

    await page.waitFor(() => !!document.querySelector('#sufei-dialog-close'));
    await page.$eval('#sufei-dialog-close', el => el.click());

    let coverUrls = await page.$$eval('ul#J_UlThumb>li>a>img', els => {
      return els.map(el => el.src);
    });
    coverUrls = coverUrls.map(url => {
      return url.replace(/_\d+x\d+.+$/, '');
    });
    //console.log(coverUrls);

    await page.waitFor(() => !!document.querySelector('.vjs-center-start'));
    await page.$eval('.vjs-center-start', el => el.click());

    let videoUrls = [];
    videoUrls.push(await page.$eval('video.lib-video', el => el.src));
    //console.log(videoUrls);

    const pictures = await page.$$eval('#description img', els => els.map(el => {
      if (el.attributes['data-ks-lazyload']) {
        return el.attributes['data-ks-lazyload'].value;
      }
    }).filter(v => v));

    await page.close();

    return {
      covers: coverUrls,
      videos: videoUrls,
      pictures
    }
  }
}

module.exports = ResourcesGetter;