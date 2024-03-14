const { default: axios } = require("axios");
const express = require("express");
const router = express.Router();
const url = require('url');

async function getAccessToken(code) {
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;

    const formData = new url.URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: "http://localhost:4030/auth/discord/callback",
    });

    const output = await axios.post(`https://discord.com/api/v10/oauth2/token`,
        formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).catch((error) => { });

    if (output && output.data && output.data.access_token) return output.data.access_token;
    else return null;
}

router.get('/discord/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) return res.status(400).json({
        error: "Invalid code"
    });

    const accessToken = await getAccessToken(code);

    if (!accessToken) return res.status(400).json({
        error: "Session expired"
    });

    res.redirect(`http://localhost:3000/callback?access_token=${accessToken}`);
});

router.get('/info', async (req, res) => {
    const { access_token } = req.query;

    if (access_token) {
        const accessToken = access_token

        if (!accessToken) return res.status(400).json({
            error: "Session expired"
        });

        const userInfo = await axios.get('https://discord.com/api/v10/users/@me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        }).catch(() => {});

        const guilds = await axios.get('https://discord.com/api/v10/users/@me/guilds', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        }).catch(() => {});

        if (!userInfo || !userInfo.data || !guilds || !guilds.data) return res.status(400).json({
            error: "Session expired"
        });

        const isInDekPua = guilds.data.some(guild => guild.id == '1213126282921902230')

        return res.json({
            user: userInfo.data,
            dekpua: isInDekPua,
            guilds: guilds.data,
        });
    } else res.status(400).json({
        error: "Invalid access_token"
    });
});

router.get('/login', async (req, res) => {
    res.redirect('https://discord.com/oauth2/authorize?client_id=1213460455503302716&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A4030%2Fauth%2Fdiscord%2Fcallback&scope=identify+email+guilds');
});

module.exports = router;