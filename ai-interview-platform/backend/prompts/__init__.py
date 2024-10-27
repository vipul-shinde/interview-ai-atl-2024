import os

def load_prompt(file_name):
    with open(os.path.join('prompts', file_name), 'r') as file:
        return file.read()

video_prompt = load_prompt('prompt_video.txt')
video_transcript = load_prompt('video_transcript.txt')
final_prompt = load_prompt('final_prompt.txt')
