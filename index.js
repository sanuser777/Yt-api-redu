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

  const info = await ytdl.getInfo(videoURL);
  const title = info.videoDetails.title.replace(/[^\w\s]/gi, "");

  res.header("Content-Disposition", `attachment; filename="\${title}.\${type === "video" ? "mp4" : "mp3"}"`);

  const format = type === "video"
    ? ytdl(videoURL, { quality: "highestvideo" })
    : ytdl(videoURL, { filter: "audioonly", quality: "highestaudio" });

  format.pipe(res);
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:\${PORT}`);
});
