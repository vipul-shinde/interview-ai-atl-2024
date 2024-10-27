from crewai import Task
from agents.data_scientist_agent import data_scientist_agent
from utils.config_loader import load_yaml_config

# Load task configuration
data_scientist_tasks_config = load_yaml_config('config/data_scientist_tasks.yaml')
data_scientist_task_config = data_scientist_tasks_config['generate_interview_questions']

# Create the task
data_scientist_task = Task(
    config=data_scientist_task_config,
    agent=data_scientist_agent
)