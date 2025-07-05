from fastapi import FastAPI, Query, Request
from fastapi.responses import FileResponse, JSONResponse, HTMLResponse
from fastapi.templating import Jinja2Templates
import os
import uuid
import yt_dlp

app = FastAPI()
templates = Jinja2Templates(directory="templates")

DOWNLOAD_DIR = "downloads"
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

@app.get("/", response_class=HTMLResponse)
def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/download")
def download(request: Request, url: str = Query(...), type: str = Query(...)):
    try:
        file_ext = "mp3" if type == "audio" else "mp4"
        filename = f"{uuid.uuid4()}.{file_ext}"
        output_path = os.path.join(DOWNLOAD_DIR, filename)

        ydl_opts = {
            'format': 'bestaudio/best' if type == "audio" else 'best',
            'outtmpl': output_path,
            'quiet': True
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])

        media_type = "audio/mpeg" if type == "audio" else "video/mp4"
        return FileResponse(output_path, media_type=media_type, filename=filename)

    except Exception as e:
        return templates.TemplateResponse("index.html", {
            "request": request,
            "error": str(e)
        })
