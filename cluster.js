const { Cluster } = require('puppeteer-cluster');
const fs = require("fs")

const urls = [
    "https://www.amazon.com/s?k=amazonbasics&pd_rd_r=03e5e33c-4faf-452d-8173-4a34efcf3524&pd_rd_w=EQNRr&pd_rd_wg=PygJX&pf_rd_p=9349ffb9-3aaa-476f-8532-6a4a5c3da3e7&pf_rd_r=8RYH7VRZ4HSKWWG0NEX3&ref=pd_gw_unk",
    "https://www.amazon.com/s?k=oculus&i=electronics-intl-ship&pd_rd_r=03e5e33c-4faf-452d-8173-4a34efcf3524&pd_rd_w=iMBhG&pd_rd_wg=PygJX&pf_rd_p=5c71b8eb-e4c7-4ea1-bf40-b57ee72e089f&pf_rd_r=8RYH7VRZ4HSKWWG0NEX3&ref=pd_gw_unk",
  ];

(async ()=>{

    const cluster = await Cluster.launch({
        concurrency:Cluster.CONCURRENCY_PAGE,
        maxConcurrency:10,
        monitor:true,
        puppeteerOptions:{
            headless:false,
            defaultViewport:false,
            userDataDir:"./tmp"
        }
    });

    cluster.on("taskerror",(err,data)=>{
        console.log(`Error crawling ${data} : ${err.message}`)
    })

    await cluster.task(async ({page,data:url})=>{

        //tasks
        // await page.goto(url);
    
        await page.goto(url);

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

        
    
    })

    for(const url of urls){
        await cluster.queue(url)
    }

    // await cluster.queue("http://www.google.com/")
    // await cluster.queue("http://www.wikipedia.org/");


    await cluster.idle();
    await cluster.close();
})()