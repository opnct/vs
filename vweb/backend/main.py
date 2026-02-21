from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="VyaparSetu Voice Billing API")

# Configure CORS to allow requests from your React frontend in GitHub Codespaces
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the NEW Gemini API client
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise RuntimeError("GEMINI_API_KEY is not set in the environment variables.")

client = genai.Client(api_key=api_key)

@app.post("/api/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    """
    Receives an audio file from the frontend, sends it to Google Gemini,
    and returns the transcribed Hinglish text.
    """
    try:
        # Read the raw audio bytes sent from the browser
        audio_bytes = await audio.read()
        
        # Define the system prompt for the AI
        prompt = "Transcribe this retail audio accurately. It contains a mix of Hindi and English (Hinglish) regarding grocery quantities. Return ONLY the transcribed text string."

        # Call the Gemini model using the stable 2.5 Flash model
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[
                prompt,
                types.Part.from_bytes(
                    data=audio_bytes,
                    mime_type=audio.content_type or "audio/webm",
                )
            ]
        )
        
        # Return the extracted text
        return {"text": response.text.strip()}

    except Exception as e:
        print(f"Error during transcription: {e}")
        raise HTTPException(status_code=500, detail="Failed to process audio with AI engine.")

if __name__ == "__main__":
    import uvicorn
    # Runs the server on port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)