import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const TOKEN_URL = 'https://accounts.spotify.com/api/token';

async function getAccessToken() {
    const response = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
        },
        body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    return data.access_token;
}

app.get('/api/popular-artists', async (req, res) => {
    try {
        const token = await getAccessToken();
        const response = await fetch('https://api.spotify.com/v1/search?q=genre:pop&type=artist&limit=20', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        res.json(data.artists.items.sort((a, b) => b.popularity - a.popularity));
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching popular artists' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
