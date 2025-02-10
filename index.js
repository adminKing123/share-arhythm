const express = require("express");
const serverless = require("serverless-http");
const axios = require("axios");
const app = express();

const GET_APP_REDIRECT_URI = (path = "") =>
  `https://arhythm.netlify.app/${path}`;
const GET_SRC_URI = (path = "") =>
  `https://hbemasterly.pythonanywhere.com/stream/${path}`;
const API_URI = "https://arsongsapi0preprod.pythonanywhere.com/";
const APIS = {
  SONG: (id) => `${API_URI}/content/songs/${id}`,
};

const GET_SONGS_ARTISTS = (artists) =>
  artists.map((artist) => artist.name).join(", ");

const MAKE_SONG_OG = (meta) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta property="og:title" content="${meta.title}">
    <meta property="og:description" content="${meta.description}">
    <meta property="og:image" content="${meta.image}">
    <meta property="og:url" content="${meta.url}">
    <meta property="og:type" content="music.song">
    
    <meta property="music:musician" content="${meta.musician}">
    <meta property="music:release_date" content="${meta.release_date}">
    <meta property="music:duration" content="${meta.duration}">
  </head>
  </html>
`;

const DEFAULT_OG = () => `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta property="og:title" content="ARhythm - Discover & Enjoy Music" />
    <meta property="og:description" content="Listen to your favorite songs, explore new music, and create your personalized playlists on ARhythm." />
    <meta property="og:image" content="https://arhythm.netlify.app/favicon.ico" />
    <meta property="og:url" content="https://arhythm.netlify.app" />
    <meta property="og:type" content="website" />
  </head>
  </html>`;

const checkIfBot = (req, res, next) => {
  const userAgent = req.headers["user-agent"] || "";
  const isBot =
    /bot|spider|crawler|curl|facebookexternalhit|WhatsApp|Discord|Telegram|LinkedIn|WebexTeams/i.test(
      userAgent
    );

  if (isBot) {
    next(); // Allow bot requests to proceed
  } else {
    res.redirect(GET_APP_REDIRECT_URI()); // Redirect human users
  }
};


const router = express.Router();

router.get("/content/songs/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const response = await axios.get(APIS.SONG(id));
    const song = response.data;
    return res.send(
      MAKE_SONG_OG({
        title: `${song.original_name}`,
        description: `${song.album.title} • ${song.album.year} • ${song.artists[0].name} • ${song.duration}`,
        image: `${GET_SRC_URI(song.album.thumbnail300x300)}`,
        url: GET_APP_REDIRECT_URI(`/song/${id}`),
        musician: GET_SONGS_ARTISTS(song.artists),
        release_date: `${song.album.year}`,
        duration: `${song.duration}`,
      })
    );
  } catch {
    return res.send(DEFAULT_OG());
  }
});

app.use(checkIfBot);
app.use("/api/", router)

module.exports.handler = serverless(app);
