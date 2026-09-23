import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

print("Starting...")
print("API key loaded:", bool(os.getenv("GEMINI_API_KEY")))

client = genai.Client(
    api_key=os.environ["GEMINI_API_KEY"]
)

print("Client created")
print("Sending request...")

interaction = client.interactions.create(
     model="gemini-3.8-live-extended-thinking",
    input="Reply with exactly: Hello!"
)

print("Request sent. Waiting for response...")

print("Response received:")
print(interaction.output_text)