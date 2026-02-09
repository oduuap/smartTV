// ============================================
// UI Renderer - DOM Manipulation Functions
// ============================================

// Format view count (42000 -> 42K)
function formatViewCount(count) {
    if (count >= 1000000) {
        return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
        return (count / 1000).toFixed(0) + 'K';
    }
    return count;
}

// Format match time safely
function formatMatchTime(timestamp) {
    try {
        if (!timestamp || isNaN(timestamp)) {
            return '--:--';
        }
        var date = new Date(timestamp * 1000);
        if (isNaN(date.getTime())) {
            return '--:--';
        }
        var hours = date.getHours().toString().padStart(2, '0');
        var minutes = date.getMinutes().toString().padStart(2, '0');
        return hours + ':' + minutes;
    } catch (error) {
        console.error('Error formatting match time:', error);
        return '--:--';
    }
}

// Show loading indicator with SmartTV style spinner
function showLoadingIndicator(container, message) {
    if (!container) return;

    message = message || 'Đang tải trận đấu';

    container.innerHTML = '\
        <div class="loading-container" style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 150px 0;">\
            <div class="spinner-container" style="position: relative; width: 120px; height: 120px; margin-bottom: 40px;">\
                <div class="spinner" style="\
                    position: absolute;\
                    width: 100%;\
                    height: 100%;\
                    border: 8px solid rgba(255, 255, 255, 0.1);\
                    border-top: 8px solid #00A8E8;\
                    border-radius: 50%;\
                    animation: spin 1s linear infinite;\
                "></div>\
                <div class="spinner-inner" style="\
                    position: absolute;\
                    top: 20px;\
                    left: 20px;\
                    width: calc(100% - 40px);\
                    height: calc(100% - 40px);\
                    border: 6px solid rgba(255, 255, 255, 0.05);\
                    border-bottom: 6px solid #FF6B35;\
                    border-radius: 50%;\
                    animation: spin 1.5s linear infinite reverse;\
                "></div>\
            </div>\
            <div class="loading-text" style="\
                color: white;\
                font-size: 32px;\
                font-weight: 600;\
                text-align: center;\
                margin-bottom: 15px;\
                letter-spacing: 1px;\
            ">' + message + '</div>\
            <div class="loading-dots" style="\
                color: rgba(255, 255, 255, 0.6);\
                font-size: 48px;\
                text-align: center;\
                animation: pulse 1.5s ease-in-out infinite;\
            ">...</div>\
        </div>\
        <style>\
            @keyframes spin {\
                0% { transform: rotate(0deg); }\
                100% { transform: rotate(360deg); }\
            }\
            @keyframes pulse {\
                0%, 100% { opacity: 0.3; }\
                50% { opacity: 1; }\
            }\
        </style>\
    ';
}

// Render match list to container
function renderMatchList(matches, container, onClickCallback) {
    if (!container) {
        console.error('Container not found for rendering matches');
        return;
    }

    // Clear container
    container.innerHTML = '';

    // Show error if no matches
    if (!matches || matches.length === 0) {
        container.innerHTML = '<div class="loading-text" style="color: white; font-size: 48px; text-align: center; padding: 100px;">❌ Không có trận đấu</div>';
        return;
    }

    console.log('🎬 Rendering ' + matches.length + ' matches...');

    // Create a document fragment for better performance
    var fragment = document.createDocumentFragment();

    matches.forEach(function(match, index) {
        try {
            var matchItem = document.createElement('div');
            matchItem.className = 'match-item focusable';
            matchItem.style.display = 'flex';
            matchItem.style.visibility = 'visible';

            // Add live badge if match is live
            if (match.isLive) {
                matchItem.classList.add('live-match');
            }

            matchItem.setAttribute('data-match-id', match.matchId);
            matchItem.setAttribute('tabindex', index);

            // Get match minute for live matches
            var matchMinute = '';
            try {
                if (match.status === 1 && match.halfStartTime && !isNaN(match.halfStartTime) && match.halfStartTime > 0) {
                    var elapsed = Math.floor((Date.now() / 1000 - match.halfStartTime) / 60);
                    matchMinute = (elapsed > 0 && elapsed < 200) ? elapsed + "'" : '';
                } else if (match.status === 2) {
                    matchMinute = 'HT';
                }
            } catch (error) {
                console.error('Error calculating match minute:', error);
                matchMinute = '';
            }

            // Build HTML
            matchItem.innerHTML = '\
                <div class="match-card">\
                    <div class="match-card-header">\
                        <span class="league-name">' + (match.leagueShortName || match.league) + '</span>\
                        <div class="match-info-right">\
                            ' + (match.viewNumber ? '<span class="view-count">🔥 ' + formatViewCount(match.viewNumber) + '</span>' : '') + '\
                            ' + (match.isLive ? '<span class="live-badge-new">Live</span>' : '') + '\
                        </div>\
                    </div>\
                    <div class="match-card-body">\
                        <div class="team-side home-side">\
                            <img src="' + match.homeLogo + '" onerror="this.src=\'https://via.placeholder.com/100x100?text=?\'" alt="' + match.homeName + '" class="team-logo-big">\
                            <div class="team-name-big">' + match.homeName + '</div>\
                        </div>\
                        <div class="match-score-area">\
                            ' + (matchMinute ? '<div class="match-minute">' + matchMinute + '</div>' : '') + '\
                            ' + (match.status > 0 ? '\
                                <div class="score-box">\
                                    <span class="score-home">' + (match.homeScore || 0) + '</span>\
                                    <span class="score-separator">:</span>\
                                    <span class="score-away">' + (match.awayScore || 0) + '</span>\
                                </div>\
                            ' : '\
                                <div class="match-time-box">\
                                    ' + formatMatchTime(match.matchTime) + '\
                                </div>\
                            ') + '\
                        </div>\
                        <div class="team-side away-side">\
                            <img src="' + match.awayLogo + '" onerror="this.src=\'https://via.placeholder.com/100x100?text=?\'" alt="' + match.awayName + '" class="team-logo-big">\
                            <div class="team-name-big">' + match.awayName + '</div>\
                        </div>\
                    </div>\
                    <div class="match-card-footer">\
                        <div class="commentator-info">\
                            <img src="' + match.commentatorAvatar + '" class="commentator-avatar-new" onerror="this.src=\'https://via.placeholder.com/50x50?text=BLV\'">\
                            <span class="commentator-name-new">' + match.commentator + '</span>\
                        </div>\
                    </div>\
                </div>\
            ';

            // Add click handler if provided
            if (onClickCallback) {
                matchItem.addEventListener('click', function() {
                    var matchId = this.getAttribute('data-match-id');
                    onClickCallback(matchId);
                });
            }

            fragment.appendChild(matchItem);
        } catch (error) {
            console.error('Error rendering match ' + (index + 1) + ':', error);
        }
    });

    // Append all items at once
    container.appendChild(fragment);

    console.log('✅ Rendered ' + container.children.length + ' match items to DOM');
}

console.log('✅ UI Renderer loaded');
