from crewai_tools import tool
#from langchain_core.tools import tool
import os
import time
import google.generativeai as genai

# Set up the Gemini API key in the environment variables
os.environ["GEMINI_API_KEY"] = "AIzaSyAg2zlHo7alqplyszLDItc5Ch_DeqBNs1Q"
genai.configure(api_key=os.environ["GEMINI_API_KEY"])

@tool("Upload and Analyze Video with Gemini")
def upload_video_and_get_summary(video_file_path: str, analysis_prompt: str) -> str:
    """Uploads a video file to Gemini and gets a summary based on the provided video."""
    try:
        # Upload the video file
        def upload_to_gemini(path, mime_type=None):
            """Uploads the given file to Gemini."""
            file = genai.upload_file(path, mime_type=mime_type)
            print(f"Uploaded file '{file.display_name}' as: {file.uri}")
            return file

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
            print("...all files ready")
            print()

        # Upload the video file
        files = [
            upload_to_gemini(video_file_path, mime_type="video/mp4")
        ]

        # Wait for the files to be processed and become active
        wait_for_files_active(files)

        # Create the model
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

        # Start the chat session with the video file and prompt
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
        response = chat_session.send_message(prompt)

        # Return the response text
        return response.text

    except Exception as e:
        return f"An error occurred: {str(e)}"