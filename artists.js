import { CLIENT_ID, CLIENT_SECRET } from './config.js';

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


async function fetchPopularArtists() {
    const response = await fetch('http://localhost:3000/api/popular-artists');
    const data = await response.json();
    return data;
}


async function displayPopularArtists() {
    const artistsList = await fetchPopularArtists();
    const artistsContainer = document.querySelector('.artists-list');

    artistsList.forEach(artist => {
        const artistElement = document.createElement('div');
        artistElement.className = 'artist';

        artistElement.innerHTML = `
            <img src="${artist.images[0]?.url || 'default-image-url.png'}" alt="${artist.name}">
            <h3>${artist.name}</h3>
            <a href="${artist.external_urls.spotify}" target="_blank">Listen on Spotify</a>
        `;

        artistsContainer.appendChild(artistElement);
    });
}

displayPopularArtists();
