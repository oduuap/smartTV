// ============================================
// API Service - Global Functions
// ============================================

// Global variable for matches
var footballMatches = [];

// Fallback data nếu API lỗi
function loadFallbackMatches() {
    footballMatches = [
        {
            id: 1,
            matchId: "fallback1",
            title: "Đang tải...",
            homeName: "Đang tải",
            awayName: "trận đấu",
            homeLogo: "https://via.placeholder.com/100x100?text=?",
            awayLogo: "https://via.placeholder.com/100x100?text=?",
            league: "Vui lòng đợi",
            leagueShortName: "Loading",
            commentator: "System",
            commentatorAvatar: "https://via.placeholder.com/50x50?text=BLV",
            isLive: false,
            status: 0,
            homeScore: 0,
            awayScore: 0,
            viewNumber: 0,
            type: "hls"
        }
    ];
}

// Load matches from API
async function loadMatchesFromAPI() {
    console.log('🔄 Starting to load matches from API...');
    console.log('API URL:', APP_CONFIG.API_URL + '/get-livestream-group');

    try {
        var response = await fetch(APP_CONFIG.API_URL + '/get-livestream-group');
        console.log('📡 API Response status:', response.status);

        var data = await response.json();
        console.log('📦 API Response data:', data);

        // Check if we have matches data
        if (data.value && data.value.datas && Array.isArray(data.value.datas) && data.value.datas.length > 0) {
            console.log('✅ Found ' + data.value.datas.length + ' matches in API response');

            // Sort: live matches first (isLiveHomePage = true)
            var matches = data.value.datas.sort(function(a, b) {
                if (a.isLiveHomePage && !b.isLiveHomePage) return -1;
                if (!a.isLiveHomePage && b.isLiveHomePage) return 1;
                return 0;
            });

            // Convert API format to app format
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
                    type: "hls"
                };
            });

            console.log('✅ Loaded ' + footballMatches.length + ' matches from API');
        } else {
            console.error('❌ Invalid API response format');
            loadFallbackMatches();
        }
    } catch (error) {
        console.error('❌ Error loading matches from API:', error);
        loadFallbackMatches();
    }
}

// Load match detail and video URL
async function loadMatchDetail(matchId) {
    console.log('🎬 Loading video for match: ' + matchId);

    try {
        // Call API POST to get match detail and video link
        var response = await fetch(APP_CONFIG.API_URL + '/match-detail?matchId=' + matchId, {
            method: 'POST',
            headers: {
                'accept': '*/*'
            },
            body: ''
        });

        console.log('📡 Match detail API response status:', response.status);

        var data = await response.json();
        console.log('📦 Match detail data:', data);

        var videoUrl = null;
        var matchData = null;

        // Try to get linkLive from match detail
        if (data.value && data.value.datas) {
            matchData = data.value.datas;
            videoUrl = matchData.linkLive;
        }

        // If no linkLive, try fallback API
        if (!videoUrl) {
            console.log('⚠️ No linkLive found, trying fallback API...');

            try {
                var fallbackResponse = await fetch(APP_CONFIG.API_URL + '/get-link-register?domain=LinkVideo');
                var fallbackData = await fallbackResponse.json();

                console.log('📦 Fallback API response:', fallbackData);

                // Parse response structure: value.data[] array, find domain "LinkVideo"
                if (fallbackData.value && fallbackData.value.data && Array.isArray(fallbackData.value.data)) {
                    var linkVideoItem = fallbackData.value.data.find(function(item) {
                        return item.domain === 'LinkVideo';
                    });
                    if (linkVideoItem && linkVideoItem.link) {
                        videoUrl = linkVideoItem.link;
                        console.log('✅ Got fallback video URL: ' + videoUrl);
                    } else {
                        console.error('❌ LinkVideo not found in fallback data');
                    }
                } else {
                    console.error('❌ Invalid fallback API response structure');
                }
            } catch (fallbackError) {
                console.error('❌ Fallback API error:', fallbackError);
            }
        } else {
            console.log('✅ Got video URL from match detail: ' + videoUrl);
        }

        // Return match detail with video URL
        return {
            videoUrl: videoUrl,
            matchData: matchData,
            success: !!videoUrl
        };
    } catch (error) {
        console.error('❌ Error loading match detail:', error);
        return {
            videoUrl: null,
            matchData: null,
            success: false,
            error: error.message
        };
    }
}

console.log('✅ API Service loaded');
