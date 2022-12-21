const puppeteer = require('puppeteer')
const path = require('path');
const ejs = require('ejs');
const { join } = require('path');

module.exports = function pdfGen  (bodyData,id){
    return new Promise(async(resolve, reject)=>{
        try {
		bodyData.finalImage = `https://api.gemfame.in/media/Certificate/${id}/${bodyData.image}`
            let finalPathFile = "../utils/index.html";
                let destination = path.join(__dirname, finalPathFile);
                let emailTemplate = await ejs.renderFile(destination, {
                  data:bodyData,
                });
                let today = new Date().getTime();
                let fileName = "certificatePdf" + today + ".pdf";
                const browser = await puppeteer.launch({
                  headless: true,
                  //executablePath:"/Applications/Google Chrome 2.app/Contents/MacOS/Google Chrome",
                  args: ["--no-sandbox"],
                  ignoreDefaultArgs:['--disable-extensions'],
                });
                const page = await browser.newPage();
                await page.goto("https://www.google.com/");
                await page.setContent(emailTemplate);
                await page.pdf({
                  path: path.join(__dirname, "../media/pdf/" + fileName),
		  margin: { top: '50px', right: '30px', bottom: '50px', left: '30px' },
                  printBackground: true,
                  format: "A3",
                });
                await browser.close();
                var pdf_path = "https://api.gemfame.in/media/pdf/" + fileName;
                resolve(pdf_path);
        } catch (error) {
            reject(error);
        }
    })
    
}

