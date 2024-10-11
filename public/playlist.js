import { CLIENT_ID } from '../config.js';

const BASE_URL = 'https://api.spotify.com/v1';
const REDIRECT_URI = 'http://127.0.0.1:5500/Playlists.html'; // Ensure this matches your local setup
const SCOPES = 'playlist-modify-public playlist-modify-private user-top-read';

// Fetch user access token from URL
function getAccessTokenFromUrl() {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    console.log("Access Token:", accessToken);
    return accessToken;
}

// Redirect user to Spotify login
function redirectToSpotifyLogin() {
    const spotifyAuthUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}`;
    window.location.href = spotifyAuthUrl;
}

// Fetch user ID
async function fetchUserId(token) {
    const response = await fetch(`${BASE_URL}/me`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    const data = await response.json();
    return data.id;
}


async function fetchUserTopTracks(token) {
    const response = await fetch(`${BASE_URL}/me/top/tracks?limit=5`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        console.error('Failed to fetch top tracks:', response.status, response.statusText);
        return [];
    }

    const data = await response.json();
    return data.items; 
}

async function fetchRecommendedSongs(token, topTracks) {
    const seedTracks = topTracks.map(track => track.id).join(','); 
    const response = await fetch(`${BASE_URL}/recommendations?limit=10&seed_tracks=${seedTracks}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        console.error('Failed to fetch recommended songs:', response.status, response.statusText);
        return [];
    }

    const data = await response.json();
    return data.tracks; 
}

// Create a new playlist
async function createPlaylist(userId, token) {
    const response = await fetch(`${BASE_URL}/users/${userId}/playlists`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: 'Frisco Recommendations',
            description: 'This playlist is automatically made with your top tracks. You can thank Frisco!.',
            public: false,
        }),
    });

    const data = await response.json();
    return data.id;
}

// Add tracks to the created playlist
async function addTracksToPlaylist(playlistId, trackUris, token) {
    const response = await fetch(`${BASE_URL}/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            uris: trackUris,
        }),
    });
}

// Display the playlist on the page
function displayPlaylist(playlistId) {
    const playlistContainer = document.querySelector('.playlist-container');
    const playlistLink = document.createElement('a');
    playlistLink.href = `https://open.spotify.com/playlist/${playlistId}`;
    playlistLink.target = '_blank';
    playlistLink.innerText = 'Open your personalized playlist on Spotify';
    playlistContainer.appendChild(playlistLink);
}

// Generate personalized playlist
async function generatePlaylist() {
    const token = getAccessTokenFromUrl();

    if (!token) {
        redirectToSpotifyLogin();
    } else {
        try {
            const userId = await fetchUserId(token);
            const topTracks = await fetchUserTopTracks(token);
            const recommendedTracks = await fetchRecommendedSongs(token, topTracks);
            const trackUris = recommendedTracks.map(track => track.uri);

            const playlistId = await createPlaylist(userId, token);
            await addTracksToPlaylist(playlistId, trackUris, token);

            displayPlaylist(playlistId);
        } catch (error) {
            console.error('Error generating personalized playlist:', error);
        }
    }
}


generatePlaylist();
