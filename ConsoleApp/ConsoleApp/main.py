import os

from aws import Textract
from gpt import gpt_parse_tasks

from pathlib import Path


def get_tasks_from_text(f):
    extractor = Textract()
    text = extractor.extract_text(f)

    tasks = gpt_parse_tasks(text)
    return tasks


if __name__ == "__main__":
    # specify test file
    test_dir = Path(__file__).parent.parent.parent / "tests/texts"
    test_file = test_dir / "ECE380_Snippet.png"

    extracted_tasks = get_tasks_from_text(test_file)
    print(extracted_tasks)
    