import { CLIENT_ID, CLIENT_SECRET } from '../config.js';

const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const BASE_URL = 'https://api.spotify.com/v1';

async function fetchAccessToken() {
    const response = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: 'Basic ' + btoa(`${CLIENT_ID}:${CLIENT_SECRET}`),
        },
        body: 'grant_type=client_credentials',
    });

    const data = await response.json();
    return data.access_token;
}

async function fetchLatestAlbums() {
    const token = await fetchAccessToken();

    // Fetching new releases
    const response = await fetch(`${BASE_URL}/browse/new-releases`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();
    return data.albums.items; 
}

async function displayLatestAlbums() {
    const albumList = await fetchLatestAlbums();
    const musicContainer = document.querySelector('.latest-music');

    albumList.forEach(album => {
        const albumElement = document.createElement('div');
        albumElement.className = 'album';

        albumElement.innerHTML = `
            <img src="${album.images[0].url}" alt="${album.name}" class="album-image">
            <h3>${album.name}</h3>
            <p>Artists: ${album.artists.map(artist => artist.name).join(', ')}</p>
            <a href="${album.external_urls.spotify}" target="_blank" class="spotify-link">Listen on Spotify</a>
        `;

        musicContainer.appendChild(albumElement);
    });
}

displayLatestAlbums();
