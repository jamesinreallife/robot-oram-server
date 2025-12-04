# ===============================================================
# ORAM Bridge Server v1.1  (Render-ready, serves terminal JS)
# ===============================================================

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from openai import OpenAI
import os

# --- CONFIGURATION ---
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
MODEL_NAME = "gpt-4o-mini"

app = Flask(__name__)
CORS(app)

client = OpenAI(api_key=OPENAI_API_KEY)

# -----------------------------------------------------------
# Serve the ORAM Terminal JS file at /oram-terminal.js
# -----------------------------------------------------------
@app.route('/oram-terminal.js')
def serve_terminal_js():
    return send_from_directory(
        '.',                     # serve from the same folder as server.py
        'oram_terminal.js',      # name of the JS file
        mimetype='application/javascript'
    )

# -----------------------------------------------------------
# ORAM chat endpoint
# -----------------------------------------------------------
@app.route('/oram', methods=['POST'])
def oram_chat():
    try:
        data = request.get_json()
        user_message = data.get("message", "").strip()

        if not user_message:
            return jsonify({"error": "No message provided"}), 400

        # Send the message to OpenAI
        completion = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are ORAM, the Lore Keeper and public voice of The RoBoT Club. "
                        "Respond in elegant, poetic, intelligent tone per the Public Interface Config. "
                        "Be concise, evocative, and maintain a futuristic aesthetic."
                    ),
                },
                {"role": "user", "content": user_message},
            ],
        )

        reply = completion.choices[0].message.content.strip()
        print(f"[ORAM Bridge] {user_message} → {reply[:60]}...")

        return jsonify({"reply": reply})

    except Exception as e:
        print(f"[ERROR] {e}")
        return jsonify({"error": str(e)}), 500


# -----------------------------------------------------------
# Server entry point
# -----------------------------------------------------------
if __name__ == "__main__":
    print("[ORAM Bridge] Running on Render platform")
    app.run(host="0.0.0.0", port=5000)
