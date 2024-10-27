import yaml
import os

def load_yaml_config(file_path):
    with open(file_path, 'r') as file:
        return yaml.safe_load(file)