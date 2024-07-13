let pageTitle = document.head.getElementsByTagName("title")[0].innerHTML;
console.log(`title of page is ${pageTitle}`);

console.log("I am content script");
let songLyrics, songName;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.lyric) {
    console.log("Message received from background:", request.lyric);
    songName = request.name;
    songLyrics = request.lyric;
    sendResponse("All Good");
    console.log("Response sent: All Good");
  } else if (request.type === "msg_from_popup") {
    console.log("msg received from popup");

    sendResponse({ lyr: songLyrics, nam: songName });
    return true;
  }

  return true;
});
