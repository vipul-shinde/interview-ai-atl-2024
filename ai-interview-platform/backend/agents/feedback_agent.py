import os
from crewai import Agent, LLM
from utils.config_loader import load_yaml_config
from utils.llm_instance import llm

# Load agent configuration
feedback_agents_config = load_yaml_config('config/feedback_agents.yaml')
feedback_agent_config = feedback_agents_config['feedback_agent']

# Create the agent
feedback_agent = Agent(
    config=feedback_agent_config,
    llm=llm
)