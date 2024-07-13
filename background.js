console.log("Background Script Running");

const LYRICS_API_URL = "https://lyrics.astrid.sh/api/search?q=";
const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";

chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
  if (changeInfo.title) {
    console.log(changeInfo.title);
    let changedTitle = changeInfo.title;
    let lyricSend, reqSong;

    if (!changedTitle.includes("•")) {
      lyricSend = "Play a song on Spotify.com, retry extension button";
    } else {
      try {
        reqSong = extractSongInfo(changedTitle);
        lyricSend = await fetchLyrics(reqSong);
      } catch (error) {
        lyricSend = "Lyrics not found";
      }

      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        let activeTab = tabs[0];
        console.log(`Sending to content.js ${activeTab.title}`);
        chrome.tabs.sendMessage(
          activeTab.id,
          { lyric: lyricSend, name: reqSong },
          function (response) {
            console.log(response);
          }
        );
      });
    }
  }
});

async function fetchLyrics(song) {
  try {
    const searchUrl = `${CORS_PROXY}${LYRICS_API_URL}${song}`;
    const searchResponse = await fetch(searchUrl, {
      headers: {
        "x-requested-with": "XMLHttpRequest",
      },
    });
    const searchData = await searchResponse.json();
    if (!searchData) {
      throw new Error("No songs found");
    }
    const lyrics = searchData["lyrics"];
    console.log(lyrics);
    return lyrics || "Lyrics not found";
  } catch (error) {
    console.error("Error fetching lyrics:", error);
    return "Lyrics not found";
  }
}

function extractSongInfo(titleContent) {
  let songSend = "";

  if (titleContent.includes("•")) {
    const titleParts = titleContent.split("•");
    songSend = titleParts[0].trim();
    if (songSend.includes("(")) songSend = songSend.split("(")[0];
    console.log(`Title sent is ${songSend}`);
  } else {
    songSend = "Could not find song title or artist name on Spotify";
  }

  return songSend;
}
