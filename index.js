const puppeteer = require("puppeteer")
const fs = require("fs")
async function app() {
    const browser = await puppeteer.launch({
        headless: false, // browser will open
        defaultViewport: false,// browser with heigth
        userDataDir: "./tmp" //remember me
    })
    const page = await browser.newPage()
    await page.goto("https://www.amazon.com/s?rh=n%3A16225007011&fs=true&ref=lp_16225007011_sar")


    let i = 0;

    let items = [];
    let isBtnDisabled = false;

    while (!isBtnDisabled) {

        await page.waitForSelector('[data-cel-widget="search_result_0"]');
        const productsHandles = await page.$$("div.s-main-slot.s-result-list.s-search-results.sg-row > .s-result-item")

        for (const productHandle of productsHandles) {

            let title = "Null"
            let price = "Null"
            let image = "Null"

            try {
                title = await page.evaluate(
                    el => el.querySelector("h2 > a > span").textContent,
                    productHandle)
                // console.log(title)
            } catch (error) {

            }

            try {
                price = await page.evaluate(
                    (el) => el.querySelector(".a-price> .a-offscreen").textContent,
                    productHandle
                )
                // console.log(price)
            } catch (error) {

            }

            try {
                image = await page.evaluate(
                    (el) => el.querySelector(".s-image").getAttribute("src"),
                    productHandle
                )
                // console.log(image)
            } catch (error) {

            }


            
            if (title !== "Null") {
                console.log(title, price, image)
                items.push({ title, price, image })

                fs.appendFile("result.cvs",
                `${title.replace(/,/g, ".")},${price},${image}\n`,(err)=>{
                    if(err) throw err
                    console.log("saved!")
                })
            }
        }

        await page.waitForSelector("a.s-pagination-next"), { visible: true }

        const is_disabled = (await page.$("li.a-disabled.a-last")) !== null;

        isBtnDisabled = is_disabled
        if (!is_disabled) {
            await Promise.all([
                page.click("a.s-pagination-next"),
                page.waitForNavigation({waitUntil:"networkidle2"})
            ])
        }
    }

    // console.log(items.length)
    // console.log(items)

    await browser.close()
}

app();