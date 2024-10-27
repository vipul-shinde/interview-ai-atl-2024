from crewai import Crew
from agents.feedback_agent import feedback_agent
from tasks.video_gemini_task import video_gemini_task
from tasks.final_feedback_task import final_feedback_task

# Create the crew
feedback_crew = Crew(
    agents=[feedback_agent],
    tasks=[video_gemini_task, final_feedback_task],
    verbose=True
)