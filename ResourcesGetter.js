
const puppeteer = require('puppeteer');

class ResourcesGetter {
  constructor() {
    this.maxPages = 5;
  }

  async init() {
    this.browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox']});
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
    page.setViewport({ width: 1280, height: 720});

    await page.goto(url, {waitUntil: 'domcontentloaded'});

    await page.waitFor(() => !!document.querySelector('#J_UlThumb'));
    // await page.waitFor(() => !!document.querySelector('#sufei-dialog-close'));
    // await page.$eval('#sufei-dialog-close', el => el.click());

    const coverUrls = (await page.$$eval('#J_UlThumb>li img', els => {
      return els.map(el => el.src);
    }))
      .map(url => url.replace(/_\d+x\d+.+$/, ''));
    //console.log(coverUrls);

    await page.waitFor(() => !!document.querySelector('.vjs-center-start'));
    await page.$eval('.vjs-center-start', el => el.click());

    const videoUrls = [await page.$eval('video.lib-video', el => el.src)];
    //console.log(videoUrls);

    await page.evaluate(() => {
      window.scrollTo(0, screen.availHeight);
      setTimeout(() => {
        window.scrollTo(0, screen.availHeight);
      }, 10);
    });

    await page.waitFor(() => !!document.querySelector('#description img'));
    let pictures = await page.$$eval('#description img', els => els.map(el => {
      return el.attributes['data-ks-lazyload'] ? el.attributes['data-ks-lazyload'].value : el.innerHTML;
    }));

    pictures = pictures
      .filter(v => v)
      .map(url => url.replace(/_\d+x\d+.+$/, ''));

    await page.close();

    return {
      covers: coverUrls,
      videos: videoUrls,
      pictures
    }
  }
}

module.exports = ResourcesGetter;
