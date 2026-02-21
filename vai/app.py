import os
from flask import Flask, render_template, request, jsonify
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv() # This loads your key from the .env file

app = Flask(__name__)

# Initialize the Real-Time Client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    user_data = request.json.get("message")
    
    try:
        # Strictly Real-Time Call to GPT-4o-mini (Faster and cheaper)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are VyaparSetu AI. Provide strictly professional trade, logistics, and business data. No simulations."},
                {"role": "user", "content": user_data}
            ]
        )
        return jsonify({"response": response.choices[0].message.content})
    except Exception as e:
        return jsonify({"response": f"Connection Error: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)