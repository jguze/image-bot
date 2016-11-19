var _config = {
    CHAT_CONNECTOR: {
        APP_ID: process.env.APP_ID, //You can obtain an APP ID and PASSWORD here: https://dev.botframework.com/bots/new
        APP_PASSWORD: process.env.APP_PASSWORD
    },
    COMPUTER_VISION_SERVICE: {
        API_URL: "https://api.projectoxford.ai/vision/v1.0/",
        API_KEY: process.env.VISION_API_KEY,  //You can obtain an COGNITIVE SERVICE API KEY: https://www.microsoft.com/cognitive-services/en-us/pricing
        API_ANALYZE_RESOURCE: "analyze",
        API_DESCRIBE_RESOURCE: "describe",
        API_OCR_RESOURCE: "ocr"
    }
};
exports.CONFIGURATIONS = _config;
