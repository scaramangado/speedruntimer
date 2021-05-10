const inputUrl = document.getElementById('video-url');

function parseYoutubeId(videoUrl) {
    var reg1 = videoUrl.match(/youtube\..+?\/watch.*?v=(.*?)(?:&|\/|$)/);
    if (reg1 && reg1.length >= 2) {
        return reg1[1];
    }

    var reg2 = videoUrl.match(/youtu\.be\/(.*?)(?:\?|&|\/|$)/);
    if (reg2 && reg2.length >= 2) {
        return reg2[1];
    }

    var reg3 = videoUrl.match(/youtube\..+?\/embed\/(.*?)(?:\?|&|\/|$)/);
    if (reg3 && reg3.length >= 2) {
        return reg3[1];
    }

    return videoUrl;
}

function loadYoutubeVideo() {
    window.location.href = "new_run.html?site=yt&id=" + parseYoutubeId(inputUrl.value);
}

function parseTwitchId(videoUrl) {
    var reg = videoUrl.match(/twitch\.tv\/videos\/(\d+)/);
    if (reg && reg.length >= 2) {
        return reg[1];
    }

    return videoUrl;
}

function loadTwitchVideo() {
    window.location.href = "new_run.html?site=ttv&id=" + parseTwitchId(inputUrl.value);
}
