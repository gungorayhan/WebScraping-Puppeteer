const puppeteer = require("puppeteer")

async function app() {
    const browser = await puppeteer.launch({ headless: false })
    const page = await browser.newPage();
    await page.goto("https://www.amazon.com/", {
        waitUntil: load
    })

    const is_disabled = await page.$("li.a-disabled.a-last") !== null;

    console.log(is_disabled)

    await browser.close();
}


// app()

//it writed to try in page