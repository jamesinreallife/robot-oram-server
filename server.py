# ORAM Public API Server (Render version)
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import os

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
MODEL_NAME = "gpt-4o-mini"
client = OpenAI(api_key=OPENAI_API_KEY)

app = Flask(__name__)
CORS(app)

@app.route('/oram', methods=['POST'])
def oram_chat():
    try:
        data = request.get_json()
        user_message = data.get("message", "").strip()
        if not user_message:
            return jsonify({"error": "No message provided"}), 400

        completion = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system",
                 "content": "You are ORAM, the Lorekeeper voice of The RoBoT Club."},
                {"role": "user", "content": user_message}
            ]
        )
        reply = completion.choices[0].message.content.strip()
        return jsonify({"reply": reply})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return {"status": "ok", "model": MODEL_NAME}, 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)
