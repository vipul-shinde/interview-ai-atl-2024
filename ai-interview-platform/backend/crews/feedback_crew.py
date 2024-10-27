from crewai import Crew
from agents.feedback_agent import feedback_agent
from tasks.final_feedback_task import final_feedback_task

# Create the crew
feedback_crew = Crew(
    agents=[feedback_agent],
    tasks=[final_feedback_task],
    verbose=True
)