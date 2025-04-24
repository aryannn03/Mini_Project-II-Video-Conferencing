from fastapi import FastAPI, UploadFile
import google.generativeai as genai
import whisper
import os
from moviepy.editor import VideoFileClip

app = FastAPI()
whisper_model = whisper.load_model("base")

# Set your Gemini API key
genai.configure(api_key="use_your_api_key")

@app.get("/")
def root():
    return {"message": "FastAPI backend is running!"}

@app.post("/summarize/")
async def summarize_video(file: UploadFile):
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)  # Create 'uploads' directory if it doesn't exist

    video_path = os.path.join(upload_dir, file.filename)
    with open(video_path, "wb") as f:
        f.write(await file.read())

    # Extract audio
    audio_path = video_path.replace(".mp4", ".mp3")
    video = VideoFileClip(video_path)
    video.audio.write_audiofile(audio_path)

    # Transcribe with Whisper
    result = whisper_model.transcribe(audio_path)
    transcript = result["text"]
    print("Transcript:", transcript)  # Debugging: Check transcript output

    # Summarize with Gemini API
    gemini_model = genai.GenerativeModel("gemini-1.5-pro-latest")
    response = gemini_model.generate_content(f"Summarize this: {transcript}")

    summary = response.text if hasattr(response, "text") else "No summary generated."
    print("Summary:", summary)  # Debugging: Check summary output

    return {"summary": summary}
