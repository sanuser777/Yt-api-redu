const express = require("express");
const ytdl = require("ytdl-core");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get("/", (req, res) => {
  res.send("🟢 YouTube Downloader API is running.");
});

app.get("/download", async (req, res) => {
  const videoURL = req.query.url;
  const type = req.query.type || "audio";

  if (!ytdl.validateURL(videoURL)) {
    return res.status(400).json({ error: "Invalid YouTube URL" });
  }

  try {
    const info = await ytdl.getInfo(videoURL);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, "");

    const formats = ytdl.filterFormats(info.formats, type === "video" ? "videoandaudio" : "audioonly");
    if (!formats.length) return res.status(400).send("❌ No formats available");

    res.header("Content-Disposition", `attachment; filename="\${title}.\${type === "video" ? "mp4" : "mp3"}"`);

    ytdl(videoURL, { format: formats[0] }).pipe(res);

  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: "⚠️ Failed to download video.", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:\${PORT}`);
});
