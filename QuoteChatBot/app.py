from flask import Flask, render_template, request, jsonify
import requests
import os

app = Flask(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

def get_gemini_response(user_input):
    headers = {"Content-Type": "application/json"}
    data = {
        "contents": [{
            "parts": [{
                "text": f"You are a friendly, smart motivational chatbot. If the user asks for help, motivation, or shares their mood, reply kindly and offer motivational quotes. If the user says unrelated things, guide them back politely to motivational topics.\n\nUser: {user_input}\nBot:"
            }]
        }]
    }

    response = requests.post(
        GEMINI_API_URL + f"?key={GEMINI_API_KEY}",
        headers=headers,
        json=data
    )

    try:
        reply = response.json()["candidates"][0]["content"]["parts"][0]["text"]
    except Exception:
        reply = "Oops! I'm having trouble thinking right now. Try again later."

    return reply

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/get-quote", methods=["POST"])
def get_quote():
    user_message = request.form["message"]
    response = get_gemini_response(user_message)
    return jsonify({"response": response})

if __name__ == "__main__":
    app.run(debug=True)
