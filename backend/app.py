import os
import uuid
from flask import Flask, render_template, request, jsonify
from google.cloud import dialogflow_v2 as dialogflow

app = Flask(__name__, template_folder='../frontend')  # Make sure this points to the frontend folder

# Use environment variables for configuration
PROJECT_ID = os.getenv('DIALOGFLOW_PROJECT_ID', 'smart-pie-n9vm')
CREDENTIALS_PATH = os.getenv('GOOGLE_APPLICATION_CREDENTIALS', 'downloaded-credentials.json')

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = CREDENTIALS_PATH

def get_dialogflow_response(query: str) -> str:
    try:
        session_client = dialogflow.SessionsClient()
        session = session_client.session_path(PROJECT_ID, str(uuid.uuid4()))
        
        text_input = dialogflow.TextInput(text=query, language_code="en")
        query_input = dialogflow.QueryInput(text=text_input)
        
        response = session_client.detect_intent(request={"session": session, "query_input": query_input})
        
        return response.query_result.fulfillment_text
    except Exception as e:
        return f"Error processing request: {str(e)}"

@app.route('/')
def home():
    return render_template('index.html')  # Flask will look in the 'frontend' folder for this

@app.route('/chat', methods=['POST'])  # Update the route to '/chat' for sending user input
def get_response():
    user_input = request.json.get('message')  # Get the message sent by the user
    bot_response = get_dialogflow_response(user_input)  # Get the bot response from Dialogflow
    return jsonify({'response': bot_response})  # Return the response as JSON

if __name__ == '__main__':
    app.run(debug=True)
