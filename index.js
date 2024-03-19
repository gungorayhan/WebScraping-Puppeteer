const puppeteer = require("puppeteer")

async function app(){
    const browser = await puppeteer.launch({
        headless:false // browser will open
    })
    const page = await browser.newPage()
    await page.goto("https://example.com")
    await page.screenshot({path:'example.png'})

    await browser.close()
}

app();