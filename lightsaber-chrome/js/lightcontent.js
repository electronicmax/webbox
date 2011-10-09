// lightcontent.js - content script for running in DOMspace
// in this environment, window = the window of the page 
// var background = chrome.extension.connect();

$(document).ready(
    function() {
        console.log("--- content script ready");
        console.log($("body").rdf().databank.tripleStore);
        var port = chrome.extension.connect();
        port.postMessage({joke: "Knock knock"});
        port.onMessage.addListener(function(msg) {
                                       console.log("Content script got response ", msg);
                                   });

        // jQuery("div:last").each(function(i) {  new Stars($(this), 15);     });
    });

