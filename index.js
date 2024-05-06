const axios = require('axios');
const Jimp = require('jimp');
const https = require('https');
const { log } = require('console');
const fs = require('fs').promises;

const font = Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
const font1 = Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
const font2 = Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);

const overlayImagePath1 = 'ray.png';
const overlayImagePath2 = 'wheel.png';
const overlayImagePath3 = 'lefthand1.png';
const overlayImagePath4 = 'lefthand2.png';
const overlayImagePath5 = 'jionewsdark.png';

async  function fetchTextFromAPI(apiUrl){
    let response=await axios.get(apiUrl, { httpsAgent: new https.Agent({ rejectUnauthorized: false }) });
    let data = response.data
    return data;
  }

// async function fetchTextFromAPI(apiUrl) {
//     try {
//         const response = await axios.get(apiUrl, { httpsAgent: new https.Agent({ rejectUnauthorized: false }) });
//         console.log('API Response:', response.data);
//         return response
//         // const currentDate = new Date();
//         // const formattedDate = currentDate.toISOString().split('T')[0];
      
//     } catch (error) {
//         console.error('error fetching text from API:', error);
//         throw error;
//     }
// }


async function processImageWithText(imagePath, text) {
    try {
        console.log('Text:', text);
        const image = await Jimp.read(imagePath);
        image.resize(1700, 400);
        image.quality(100);

        const font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
        const font1 = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
        const font2 = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
        console.log('Font loaded successfully');

        // const textheight1 = Jimp.measureTextHeight(font, text);
        // const textWidth1 = Jimp.measureText(font, text);

        // image.print(font, alignmentX, alignmentY, text);

        image.print(font, image.bitmap.width/32, image.bitmap.height/3.5, "Lok Sabha Elections 2024");

        image.print(font2, image.bitmap.width/32, image.bitmap.height/2, "Jio urges you to Vote! Vote for a better future, better India...");

        image.print(font1, image.bitmap.width/32, image.bitmap.height/1.5, text);

        const watermark1 = await Jimp.read(overlayImagePath1);
        const watermark1X = image.bitmap.width - watermark1.bitmap.width - 80;
        const watermark1Y = image.bitmap.height - watermark1.bitmap.height - 40;
        image.composite(watermark1, watermark1X, watermark1Y, {
            mode: Jimp.BLEND_SOURCE_OVER,
            opacityDest: 1,
            opacitySource: 1
        });

        const watermark2 = await Jimp.read(overlayImagePath2);
        const watermark2X = image.bitmap.width - watermark2.bitmap.width - 80;
        const watermark2Y = image.bitmap.height - watermark2.bitmap.height - 10;
        image.composite(watermark2, watermark2X, watermark2Y, {
            mode: Jimp.BLEND_SOURCE_OVER,
            opacityDest: 1,
            opacitySource: 1
        });

        const watermark3 = await Jimp.read(overlayImagePath3);
        watermark3.resize(250, Jimp.AUTO);
        const watermark3X = image.bitmap.width - watermark3.bitmap.width - 250;
        const watermark3Y = image.bitmap.height - watermark3.bitmap.height + 110;
        image.composite(watermark3, watermark3X, watermark3Y, {
            mode: Jimp.BLEND_SOURCE_OVER,
            opacityDest: 1,
            opacitySource: 1
        });

        const watermark4 = await Jimp.read(overlayImagePath4);
        watermark4.resize(375, Jimp.AUTO);
        const watermark4X = image.bitmap.width - watermark4.bitmap.width + 50;
        const watermark4Y = image.bitmap.height - watermark4.bitmap.height + 100;
        image.composite(watermark4, watermark4X, watermark4Y, {
            mode: Jimp.BLEND_SOURCE_OVER,
            opacityDest: 1,
            opacitySource: 1
        });

        const watermark5 = await Jimp.read(overlayImagePath5);
        watermark5.resize(218, 70);
        const watermark5X = image.bitmap.width - watermark5.bitmap.width - 1450;
        const watermark5Y = image.bitmap.height - watermark5.bitmap.height - 300;
        image.composite(watermark5, watermark5X, watermark5Y, {
            mode: Jimp.BLEND_SOURCE_OVER,
            opacityDest: 1,
            opacitySource: 1
        });

        const outputPath = 'output.jpg';
        await image.writeAsync(outputPath);
        console.log('image with text and watermarks saved as output.jpg');
        return outputPath;
    } catch (error) {
        console.error('Error processing image:', error);
        throw error;
    }
}


async function saveImageToDevice(imagePath) {
    try {
        const imageBuffer = await fs.readFile(imagePath);
        const imageName = imagePath.split('/').pop();
        await fs.writeFile(imageName, imageBuffer);
        console.log('image saved to device as', imageName);
        const baseUrl = 'https://example.com/images/';
        const imageUrl = baseUrl + imageName;
        return imageUrl;
    } catch (error) {
        console.error('Error saving image to device:', error);
        throw error;
    }
}

const apiUrl = 'https://widget.jionews.com/election-services/candidates/phase3.json';
const imagePath = 'background1.png';


fetchTextFromAPI(apiUrl)
    .then(data => {
        log("api-response ", data)
        if (data.length > 0) {
            const formattedCode = '04007';
            const filteredData = data.filter(item => item.code === formattedCode);
            
            console.log('Filtered Data:', filteredData);
            if (filteredData.length > 0) {
                const text = "Phase 1 in "+filteredData[0].state+" | Poll date - "+filteredData[0].polldate+" 2024"+" | Counting date - "+filteredData[0].counting+" 2024";
                console.log('Text:', text);
                return processImageWithText(imagePath, text);
            }
        } else {
            throw new Error('No data available for the selected date');
        }
    })
    .then(imagePath => saveImageToDevice(imagePath))
    .then(imageUrl => console.log('Image URL:', imageUrl))
    .catch(error => console.error('Error:', error));
