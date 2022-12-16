const chromium = require("chrome-aws-lambda");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.tz.setDefault("America/Denver");

exports.handler = async (event) => {
  console.info("Launching browser...");

  const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  });

  console.info("Opening page...");

  const page = await browser.newPage();

  await page.setViewport({ width: 900, height: 1080 });
  await page.goto("https://petersenartcenter.com/schedules/pottery", {
    waitUntil: "networkidle0",
  });

  const viewPageOptions = await page.$('[name="tablepress-16_length"]');
  await viewPageOptions.select("100");

  console.info("Parsing...");

  const data = await page.evaluate(async () => {
    let data = [];

    const viewOptions = [...document.querySelectorAll("option")];
    const desiredOption = viewOptions.filter((o) => o.innerText === "100");
    desiredOption.selected = true;

    const rows = document.querySelector("tbody").children;

    const getFromRow = (row, classname) => {
      return row.querySelector(`td.${classname}`).innerText.trim();
    };

    for (const tr of rows) {
      data.push({
        startDate: getFromRow(tr, `column-2`),
        class: getFromRow(tr, "column-3"),
        classTitle: getFromRow(tr, "column-4"),
        day: getFromRow(tr, "column-6"),
        time: getFromRow(tr, "column-7"),
      });
    }

    return data;
  });

  await browser.close();

  const januaryClasses = data.filter((d) =>
    dayjs(d.startDate).isAfter(dayjs("2022-12-25 00:00:00"))
  );

  if (januaryClasses.length) {
    return "There are new Pottery class openings! 🥳";
    // send email alerting me of class openings.
  } else {
    return "No class openings found. ☹️";
  }
};
