import os
import time
import google.generativeai as genai

os.environ["GEMINI_API_KEY"] = "YOUR_API_KEY"
genai.configure(api_key=os.environ["GEMINI_API_KEY"])

def upload_to_gemini(path, mime_type=None):
  """Uploads the given file to Gemini.

  See https://ai.google.dev/gemini-api/docs/prompting_with_media
  """
  file = genai.upload_file(path, mime_type=mime_type)
  print(f"Uploaded file '{file.display_name}' as: {file.uri}")
  return file

def wait_for_files_active(files):
  """Waits for the given files to be active.

  Some files uploaded to the Gemini API need to be processed before they can be
  used as prompt inputs. The status can be seen by querying the file's "state"
  field.

  This implementation uses a simple blocking polling loop. Production code
  should probably employ a more sophisticated approach.
  """
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

# Create the model
generation_config = {
  "temperature": 1,
  "top_p": 0.95,
  "top_k": 40,
  "max_output_tokens": 8192,
  "response_mime_type": "text/plain",
}

model = genai.GenerativeModel(
  model_name="gemini-1.5-pro-002",
  generation_config=generation_config,
)

# TODO Make these files available on the local file system
# You may need to update the file paths
files = [
  upload_to_gemini("/Users/sabinaashurova/Downloads/video1687979219.mp4", mime_type="video/mp4"),
]

# Some files have a processing delay. Wait for them to be ready.
wait_for_files_active(files)

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

response = chat_session.send_message("Title: Non-Verbal Communication Analysis of Mock Interview Video\n\nTask:\n\nYou are an expert communication coach specializing in non-verbal communication during interviews. Analyze the non-verbal cues exhibited by the candidate in the following mock interview session. Provide detailed feedback, including strengths, weaknesses, and actionable recommendations for improvement.\n\nInstructions:\n\nAnalyze the candidate's non-verbal behaviors in the context of a professional interview setting.\nIdentify Strengths: Highlight areas where the candidate demonstrated effective non-verbal communication.\nIdentify Weaknesses: Point out areas where non-verbal cues could be improved.\nProvide Recommendations: Offer specific, actionable advice for enhancing non-verbal communication skills.\nOverall Assessment: Summarize the candidate's non-verbal communication effectiveness.\nNon-Verbal Cues Observed:\n\n(Replace the placeholders with your actual observations from the video)\n\nFacial Expressions:\n[e.g., The candidate maintained a neutral facial expression throughout most of the interview, with occasional smiles when appropriate.]\n\nEye Contact:\n[e.g., The candidate frequently looked away from the interviewer, maintaining eye contact approximately 40% of the time.]\n\nBody Language and Posture:\n[e.g., Sat upright initially but began slouching midway through the interview.]\nGestures and Movements:\n[e.g., Used open hand gestures when explaining ideas but fidgeted with a pen repeatedly.]\n\nSpeech and Voice:\n[e.g., Spoke at a consistent pace but used filler words such as \"um\" and \"like\" frequently.]\n\nEmotional State Indicators:\n[e.g., Displayed signs of nervousness, such as tapping feet and avoiding eye contact during difficult questions.]\n\nHead Movements:\n[e.g., Nodded appropriately to show understanding but shook head slightly when uncertain.]\n\nListening Skills:\n[e.g., Demonstrated active listening by nodding but interrupted the interviewer twice.]\n\nConfidence Indicators:\n[e.g., Maintained open body language but had moments of crossing arms over the chest.]\n\nAdditional Observations:\n[e.g., The candidate's attire was professional, but grooming appeared slightly unkempt.]\nFormatting Guidelines:\n\nBegin with a brief Introduction on the importance of non-verbal communication in interviews.\nUse Headings for each non-verbal aspect analyzed.\nProvide Detailed Feedback under each heading:\nAnalysis\nStrengths\nWeaknesses\nRecommendations\nConclude with an Overall Assessment summarizing key points.")

print(response.text)