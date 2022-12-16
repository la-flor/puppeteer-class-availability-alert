const puppeteer = require("puppeteer");
const fs = require("fs");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const { exec } = require("child_process");

dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.tz.setDefault("America/Denver");

void (async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setViewport({ width: 900, height: 1080 });
    await page.goto("https://petersenartcenter.com/schedules/pottery", {
      waitUntil: "networkidle0",
    });

    async function getScreenshot() {
      await page.screenshot({
        path: "./screenshots/page1.png",
      });

      await page.pdf({ path: "./pdfs/page1.pdf" });
    }

    await getScreenshot();

    await browser.close();
  } catch (error) {
    console.log(error);
  }
})();
