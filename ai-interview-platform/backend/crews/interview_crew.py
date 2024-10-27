from crewai import Crew
from agents.data_scientist_agent import data_scientist_agent
from tasks.data_scientist_task import data_scientist_task

# Create the crew
interview_crew = Crew(
    agents=[data_scientist_agent],
    tasks=[data_scientist_task],
    verbose=True
)