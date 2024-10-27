from crewai import Task
from agents.feedback_agent import feedback_agent
from utils.config_loader import load_yaml_config

# Load task configuration
feedback_agent_tasks_config = load_yaml_config('config/feedback_agent_tasks.yaml')
final_feedback_task_config = feedback_agent_tasks_config['generate_final_feedback_report']

# Create the task
final_feedback_task = Task(
    config=final_feedback_task_config,
    agent=feedback_agent
)