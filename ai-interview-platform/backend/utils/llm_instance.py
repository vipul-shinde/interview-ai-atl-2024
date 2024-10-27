import os
from crewai import LLM

# Initialize LLM
google_api_key = os.environ.get('GOOGLE_API_KEY')
if not google_api_key:
    raise EnvironmentError('GOOGLE_API_KEY environment variable not set.')

llm = LLM(
    model="gemini/gemini-1.5-pro-latest",
    temperature=0.5,
    api_key=google_api_key,
)