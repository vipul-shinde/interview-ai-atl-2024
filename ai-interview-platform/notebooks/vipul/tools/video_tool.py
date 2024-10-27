from crewai_tools import BaseTool
import os
import time
import google.generativeai as genai
from typing import Optional
from pydantic import BaseModel, Field

class UploadVideoAndGetSummaryTool(BaseTool):
    name: str = "Upload and Analyze Video with Gemini"
    description: str = "Uploads a video file to Gemini and gets a summary based on the provided video."

    # Environment variables
    gemini_api_key: str = os.environ.get("GEMINI_API_KEY", "AIzaSyAg2zlHo7alqplyszLDItc5Ch_DeqBNs1Q")

    # # Input parameters with Pydantic Field definitions
    # video_file_path: str = Field(..., description="Path to the video file to be uploaded.")
    # prompt: str = Field(..., description="Prompt to generate the summary based on the video.")

    def _run(self) -> str:
        """Uploads a video file to Gemini and gets a summary based on the provided video."""
        try:
            # Configure the Gemini API key
            genai.configure(api_key=self.gemini_api_key)

            # Function to upload the video file to Gemini
            def upload_to_gemini(path, mime_type=None):
                """Uploads the given file to Gemini."""
                file = genai.upload_file(path, mime_type=mime_type)
                print(f"Uploaded file '{file.display_name}' as: {file.uri}")
                return file

            # Function to wait for the files to become active
            def wait_for_files_active(files):
                """Waits for the given files to be processed and become active."""
                print("Waiting for file processing...")
                for name in (file.name for file in files):
                    file = genai.get_file(name)
                    while file.state.name == "PROCESSING":
                        print(".", end="", flush=True)
                        time.sleep(10)
                        file = genai.get_file(name)
                    if file.state.name != "ACTIVE":
                        raise Exception(f"File {file.name} failed to process")
                print("...all files ready\n")

            # Upload the video file
            files = [
                upload_to_gemini(self.video_file_path, mime_type="video/mp4")
            ]

            # Wait until the file is processed and active
            wait_for_files_active(files)

            # Create the model with specified configuration
            generation_config = {
                "temperature": 0.5,
                "top_p": 0.95,
                "top_k": 40,
                "max_output_tokens": 8192,
                "response_mime_type": "text/plain",
            }

            model = genai.GenerativeModel(
                model_name="gemini-1.5-pro-002",
                generation_config=generation_config,
            )

            # Start a chat session with the uploaded video file and prompt
            chat_session = model.start_chat(
                history=[
                    {
                        "role": "user",
                        "parts": [
                            files[0],
                        ],
                    },
                ]
            )

            # Send a message to get the summary of the video
            response = chat_session.send_message(self.prompt)

            # Return the response text
            return response.text

        except Exception as e:
            return f"An error occurred: {str(e)}"
