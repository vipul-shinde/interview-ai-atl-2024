import os
from crewai import Agent, LLM
from utils.config_loader import load_yaml_config
from utils.llm_instance import llm

# Load agent configuration
data_scientist_agents_config = load_yaml_config('config/data_scientist_agents.yaml')
data_scientist_agent_config = data_scientist_agents_config['data_scientist_interviewer']

# Create the agent
data_scientist_agent = Agent(
    config=data_scientist_agent_config,
    llm=llm
)