// Load URL Params
const urlParams = new URLSearchParams(window.location.search);
const videoId = urlParams.get('id');
const site = urlParams.get('site');
const preview = urlParams.get('preview')

if (site == "yt") {
    // Load the IFrame Player API code asynchronously.
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

// Load page elements
const totalTimeSpan = document.getElementById('total-time');
const siteVideoIdInput = document.getElementById('video-id');
const siteInput = document.getElementById('video-site');
const startValueInput = document.getElementById('start-value');
const endValueInput = document.getElementById('end-value');
const startSpan = document.getElementById('start');
const goToStartButton = document.getElementById('go-to-start');
const endSpan = document.getElementById('end');
const goToEndButton = document.getElementById('go-to-end');
const currentTimeSpan = document.getElementById('current-time');
const ccSelect = document.getElementById('cc-select');
const trackCountSelect = document.getElementById('track-count-select');
const startingTrackSelect = document.getElementById('starting-track-select');
const saveRunButton = document.getElementById('save-run');
var videoDiv = document.getElementById('video-div');
const previewDiv = document.getElementById('preview-div');
const subregionDiv = document.getElementById('subregion-div');
const leftSubregion = document.getElementById('left-subregion');
const rightSubregion = document.getElementById('right-subregion');
const topSubregion = document.getElementById('top-subregion');
const bottomSubregion = document.getElementById('bottom-subregion');

if (preview == 'true') {
    previewDiv.style.visibility = 'visible';
}

// Create page variables
var start = null;
var end = null;
var currentMillis = 0;

// Fallback Player
var player = {
    seekTo: function () { throw 'unimplemented'; },
    pauseVideo: function () { throw 'unimplemented'; },
    getCurrentTime: function () { throw 'unimplemented'; },
    playVideo: function () { throw 'unimplemented'; }
};

siteVideoIdInput.value = videoId;
siteInput.value = site;

function updateCurrentTime() {
    currentMillis = Math.floor(player.getCurrentTime() * 1000);
}

function setTime(millis) {
    player.pauseVideo();
    player.seekTo(millis / 1000);
}

function stepBy(amount) {
    player.pauseVideo();
    updateCurrentTime();
    setTime(Math.max(0, currentMillis + amount));
}

function updateTotalTime() {
    if (start !== null && end !== null) {
        const timeDiff = end - start;
        var timeStr = "";

        // handle negative time I guess
        if (timeDiff < 0) {
            timeStr += "-";
            timeDiff *= -1;
        }

        const hours = Math.floor(timeDiff / (60 * 60 * 1000));
        const minutes = Math.floor(timeDiff / (60 * 1000) % 60);
        const seconds = Math.floor(timeDiff / 1000 % 60);
        const ms = timeDiff % 1000;

        if (hours !== 0) timeStr += hours + "h";
        if (minutes !== 0) timeStr += minutes + "m";

        timeStr += seconds + "s";

        if (ms >= 100) timeStr += ms + "ms";
        else if (ms >= 10) timeStr += "0" + ms + "ms";
        else if (ms >= 1) timestr += "00" + ms + "ms";
        else timeStr += "000ms";

        totalTimeSpan.innerHTML = timeStr;
    }
}

function showStart() {
    if (start === null) {
        return;
    }

    startSpan.innerHTML = start;
    goToStartButton.style.visibility = "visible";

    if (end !== null) {
        saveRunButton.style.visibility = "visible";
    }
}

function setStart() {
    updateCurrentTime();
    start = currentMillis;
    startValueInput.value = start;
    showStart();
    updateTotalTime();
}

function goToStart() {
    setTime(start);
}

function showEnd() {
    if (end === null) {
        return;
    }

    endSpan.innerHTML = end;
    goToEndButton.style.visibility = "visible";

    if (start !== null) {
        saveRunButton.style.visibility = "visible";
    }
}

function setEnd() {
    updateCurrentTime();
    end = currentMillis;
    endValueInput.value = end;
    showEnd();
    updateTotalTime();
}

function goToEnd() {
    setTime(end);
}

function updateSubregionDiv() {
    var videoBoundRect = videoDiv.getBoundingClientRect();

    var left = leftSubregion.value;
    var right = rightSubregion.value;
    var top = topSubregion.value;
    var bottom = bottomSubregion.value;

    var width = 960;
    var height = 540;

    var leftToSet = Math.floor(width * (left / 100));
    var topToSet = Math.floor(height * (top / 100));
    var rightToSet = Math.floor(width * (right / 100)) - leftToSet - 4;
    var bottomToSet = Math.floor(height * (bottom / 100)) - topToSet - 4;

    subregionDiv.style.left = (videoBoundRect.left + leftToSet) + "px";
    subregionDiv.style.width = rightToSet + "px";
    subregionDiv.style.top = (videoBoundRect.top + topToSet) + "px";
    subregionDiv.style.height = bottomToSet + "px";
}

function updateCurrentTimeSpan() {
    updateCurrentTime();
    currentTimeSpan.innerHTML = currentMillis;
}

function onPlayerReady() {
    videoDiv = document.getElementById('video-div');
    player.playVideo();
    setInterval(updateCurrentTimeSpan, 50);
    if (preview === 'true') {
        updateSubregionDiv();
        subregionDiv.style.visibility = 'visible';
    }
}

// Load the player.
if (site == "yt") {
    var youtube;
    function onYouTubePlayerAPIReady() {
        youtube = new YT.Player("video-div", {
            width: 960,
            height: 540,
            videoId: videoId,
            events: {
                'onReady': onYoutubeReady
            }
        });
    }

    function onYoutubeReady() {
        player = {
            seekTo: function (timestamp) { youtube.seekTo(timestamp); },
            pauseVideo: function () { youtube.pauseVideo(); },
            getCurrentTime: function () { return youtube.getCurrentTime(); },
            playVideo: function () { youtube.playVideo(); }
        };
        onPlayerReady();
    }
} else if (site == "ttv") {
    var twitch = new Twitch.Player("video-div", {
        width: 960,
        height: 540,
        video: videoId
    });

    twitch.setVolume(0.5);
    twitch.pause();

    player = {
        seekTo: function (timestamp) {
            player.playVideo();
            setTimeout(function () {
                twitch.seek(timestamp);
                setTimeout(function () {
                    twitch.seek(timestamp);
                    player.pauseVideo();
                }, 50)
            }, 50);
        },
        pauseVideo: function () { twitch.pause(); },
        getCurrentTime: function () { return twitch.getCurrentTime(); },
        playVideo: function () { twitch.play(); }
    };

    onPlayerReady();
}