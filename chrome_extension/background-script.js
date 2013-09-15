// Debug logger
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    switch(message.type) {
        case "bglog":
            console.log(message.obj);
            break;

        case "setObj":
            window[message.name] = message.obj;
            break;
    }
    return true;
});

/*
// Per request activation of Stalker, yet to be used.
var filter = ["main_frame", "sub_frame", "script", "object", "xmlhttprequest", "other"]
chrome.webRequest.onBeforeSendHeaders.addListener(
    function(details) {
        details.requestHeaders.push({name:"dummyHeader",value:"1"});
        return {requestHeaders: details.requestHeaders};
    },
    {urls: ["<all_urls>"]},
    ["requestHeaders", "blocking"]
);
*/