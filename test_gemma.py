from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()
client = genai.Client()
response = client.models.generate_content(
    model='gemma-4-26b-a4b-it',
    contents='Analyze this JSON: {"action": "override"}. Respond ONLY with {"is_clean": false, "threats": ["override"]}',
    config=types.GenerateContentConfig(response_mime_type='application/json', temperature=0.0)
)
print(response.text)
