// API Service - Load Videos from Server
const API_BASE_URL = 'https://api.yourdomain.com'; // Thay URL API của bạn

// Load danh sách videos từ API
async function loadVideosFromAPI() {
    try {
        // Show loading indicator
        showLoadingIndicator();
        
        // Fetch data from API
        const response = await fetch(`${API_BASE_URL}/videos`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': 'Bearer YOUR_TOKEN' // Nếu cần auth
            }
        });

        // Check if response is OK
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse JSON
        const data = await response.json();
        
        console.log('Loaded videos:', data);
        
        // Hide loading indicator
        hideLoadingIndicator();
        
        return data.videos || data; // Tùy format API trả về
        
    } catch (error) {
        console.error('Error loading videos:', error);
        hideLoadingIndicator();
        showErrorMessage('Không thể tải danh sách video. Vui lòng thử lại!');
        
        // Fallback to local data
        return getLocalVideos();
    }
}

// Load video detail by ID
async function loadVideoDetail(videoId) {
    try {
        const response = await fetch(`${API_BASE_URL}/videos/${videoId}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error loading video detail:', error);
        return null;
    }
}

// Get local videos (fallback when API fails)
function getLocalVideos() {
    return [
        {
            id: 1,
            title: "Văn Gòn 2B - HLS Stream",
            league: "Live Stream",
            date: "08/02/2026",
            thumbnail: "https://via.placeholder.com/400x300?text=Video+1",
            videoUrl: "https://hls.686868.me/live/THOLAN/index.m3u8",
            type: "hls"
        },
        {
            id: 2,
            title: "Văn Gòn 2B - FLV Stream",
            league: "Live Stream",
            date: "08/02/2026",
            thumbnail: "https://via.placeholder.com/400x300?text=Video+2",
            videoUrl: "https://flv.686868.me/live/VANGON2B.flv?expire=1888314540&sign=97728a067af5bf64e91cb4d51147c2a7",
            type: "flv"
        }
    ];
}

// Loading indicator functions
function showLoadingIndicator() {
    const loading = document.createElement('div');
    loading.id = 'api-loading';
    loading.className = 'api-loading-overlay';
    loading.innerHTML = `
        <div class="api-loading-spinner"></div>
        <p>Đang tải danh sách video...</p>
    `;
    document.body.appendChild(loading);
}

function hideLoadingIndicator() {
    const loading = document.getElementById('api-loading');
    if (loading) {
        loading.remove();
    }
}

function showErrorMessage(message) {
    const error = document.createElement('div');
    error.className = 'api-error-message';
    error.innerHTML = `
        <p>${message}</p>
        <button onclick="this.parentElement.remove()">Đóng</button>
    `;
    document.body.appendChild(error);
    
    // Auto remove after 5 seconds
    setTimeout(() => error.remove(), 5000);
}

// Cache management
const VIDEO_CACHE_KEY = 'sports_tv_videos_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function cacheVideos(videos) {
    const cache = {
        timestamp: Date.now(),
        data: videos
    };
    localStorage.setItem(VIDEO_CACHE_KEY, JSON.stringify(cache));
}

function getCachedVideos() {
    try {
        const cache = JSON.parse(localStorage.getItem(VIDEO_CACHE_KEY));
        if (!cache) return null;
        
        const isExpired = (Date.now() - cache.timestamp) > CACHE_DURATION;
        if (isExpired) {
            localStorage.removeItem(VIDEO_CACHE_KEY);
            return null;
        }
        
        return cache.data;
    } catch (error) {
        return null;
    }
}

// Main function: Load videos with cache
async function getVideos() {
    // Try cache first
    const cached = getCachedVideos();
    if (cached) {
        console.log('Using cached videos');
        return cached;
    }
    
    // Load from API
    const videos = await loadVideosFromAPI();
    
    // Cache the result
    if (videos && videos.length > 0) {
        cacheVideos(videos);
    }
    
    return videos;
}

// Export functions (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getVideos, loadVideoDetail };
}
