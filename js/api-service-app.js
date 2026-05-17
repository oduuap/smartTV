// ============================================
// API Service - Compatible with webOS 3.0/3.5 (Chromium 53)
// No async/await, no fetch — uses XMLHttpRequest
// ============================================

// Global variable for matches
var footballMatches = [];

// Fallback data if API fails or is geo-blocked
function loadFallbackMatches() {
    footballMatches = [
        {
            id: 1,
            matchId: 'fallback1',
            title: 'Đang tải...',
            homeName: 'Đang tải',
            awayName: 'trận đấu',
            homeLogo: 'https://via.placeholder.com/100x100?text=?',
            awayLogo: 'https://via.placeholder.com/100x100?text=?',
            league: 'Vui lòng đợi',
            leagueShortName: 'Loading',
            commentator: 'System',
            commentatorAvatar: 'https://via.placeholder.com/50x50?text=BLV',
            isLive: false,
            status: 0,
            homeScore: 0,
            awayScore: 0,
            viewNumber: 0,
            type: 'hls'
        }
    ];
}

// XMLHttpRequest wrapper — works on webOS 3.0/3.5
function xhrGet(url, timeout, onSuccess, onError) {
    var xhr = new XMLHttpRequest();
    var timedOut = false;
    var timer = setTimeout(function() {
        timedOut = true;
        xhr.abort();
        onError(new Error('Request timeout after ' + timeout + 'ms'));
    }, timeout);

    xhr.open('GET', url, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4) return;
        clearTimeout(timer);
        if (timedOut) return;
        if (xhr.status >= 200 && xhr.status < 300) {
            try {
                var data = JSON.parse(xhr.responseText);
                onSuccess(data);
            } catch (e) {
                onError(new Error('JSON parse error: ' + e.message));
            }
        } else {
            onError(new Error('HTTP error ' + xhr.status));
        }
    };
    xhr.onerror = function() {
        clearTimeout(timer);
        if (!timedOut) onError(new Error('Network error'));
    };
    xhr.send();
}

function xhrPost(url, timeout, onSuccess, onError) {
    var xhr = new XMLHttpRequest();
    var timedOut = false;
    var timer = setTimeout(function() {
        timedOut = true;
        xhr.abort();
        onError(new Error('Request timeout after ' + timeout + 'ms'));
    }, timeout);

    xhr.open('POST', url, true);
    xhr.setRequestHeader('accept', '*/*');
    xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4) return;
        clearTimeout(timer);
        if (timedOut) return;
        if (xhr.status >= 200 && xhr.status < 300) {
            try {
                var data = JSON.parse(xhr.responseText);
                onSuccess(data);
            } catch (e) {
                onError(new Error('JSON parse error: ' + e.message));
            }
        } else {
            onError(new Error('HTTP error ' + xhr.status));
        }
    };
    xhr.onerror = function() {
        clearTimeout(timer);
        if (!timedOut) onError(new Error('Network error'));
    };
    xhr.send('');
}

// Load matches from API — callback-based (no async/await)
function loadMatchesFromAPI(onDone) {
    console.log('🔄 Starting to load matches from API...');
    var url = APP_CONFIG.API_URL + '/get-livestream-group';
    console.log('API URL:', url);

    xhrGet(url, 15000, function(data) {
        console.log('📦 API Response data received');

        if (data.value && data.value.datas && Array.isArray(data.value.datas) && data.value.datas.length > 0) {
            console.log('✅ Found ' + data.value.datas.length + ' matches');

            var matches = data.value.datas.sort(function(a, b) {
                if (a.isLiveHomePage && !b.isLiveHomePage) return -1;
                if (!a.isLiveHomePage && b.isLiveHomePage) return 1;
                return 0;
            });

            footballMatches = matches.map(function(match) {
                return {
                    id: match.matchId,
                    matchId: match.matchId,
                    title: match.homeName + ' vs ' + match.awayName,
                    homeName: match.homeName,
                    awayName: match.awayName,
                    homeLogo: match.homeLogo,
                    awayLogo: match.awayLogo,
                    homeScore: match.homeScore,
                    awayScore: match.awayScore,
                    league: match.leagueName,
                    leagueShortName: match.leagueShortName,
                    leagueColor: match.leagueColor,
                    commentator: match.commentator,
                    commentatorAvatar: match.avatar,
                    isLive: match.isLiveHomePage,
                    status: match.status,
                    matchTime: match.matchTime,
                    viewNumber: match.viewNumber,
                    halfStartTime: match.halfStartTime,
                    type: 'hls'
                };
            });

            console.log('✅ Loaded ' + footballMatches.length + ' matches');
        } else {
            console.error('❌ Invalid API response format');
            loadFallbackMatches();
        }

        if (typeof onDone === 'function') onDone();
    }, function(error) {
        console.error('❌ Error loading matches from API:', error.message);
        loadFallbackMatches();
        if (typeof onDone === 'function') onDone();
    });
}

// Load match detail and video URL — callback-based (no async/await)
function loadMatchDetail(matchId, onDone) {
    console.log('🎬 Loading video for match: ' + matchId);
    var url = APP_CONFIG.API_URL + '/match-detail?matchId=' + matchId;

    xhrPost(url, 15000, function(data) {
        console.log('📦 Match detail data received');

        var videoUrl = null;
        var matchData = null;

        if (data.value && data.value.datas) {
            matchData = data.value.datas;
            videoUrl = matchData.linkLive;
        }

        if (videoUrl) {
            console.log('✅ Got video URL from match detail');
            if (typeof onDone === 'function') {
                onDone({ videoUrl: videoUrl, matchData: matchData, success: true });
            }
        } else {
            // Fallback: fetch video URL from link-register API
            console.log('⚠️ No linkLive, trying fallback API...');
            var fallbackUrl = APP_CONFIG.API_URL + '/get-link-register?domain=LinkVideo';

            xhrGet(fallbackUrl, 10000, function(fallbackData) {
                var foundUrl = null;

                if (fallbackData.value && fallbackData.value.data && Array.isArray(fallbackData.value.data)) {
                    for (var i = 0; i < fallbackData.value.data.length; i++) {
                        if (fallbackData.value.data[i].domain === 'LinkVideo' && fallbackData.value.data[i].link) {
                            foundUrl = fallbackData.value.data[i].link;
                            break;
                        }
                    }
                }

                if (foundUrl) {
                    console.log('✅ Got fallback video URL');
                } else {
                    console.error('❌ LinkVideo not found in fallback data');
                }

                if (typeof onDone === 'function') {
                    onDone({ videoUrl: foundUrl, matchData: matchData, success: !!foundUrl });
                }
            }, function(fallbackError) {
                console.error('❌ Fallback API error:', fallbackError.message);
                if (typeof onDone === 'function') {
                    onDone({ videoUrl: null, matchData: null, success: false, error: fallbackError.message });
                }
            });
        }
    }, function(error) {
        console.error('❌ Error loading match detail:', error.message);
        if (typeof onDone === 'function') {
            onDone({ videoUrl: null, matchData: null, success: false, error: error.message });
        }
    });
}

console.log('✅ API Service loaded');
