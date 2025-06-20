from flask import Flask, jsonify
import check_appointment

app = Flask(__name__)

@app.route("/run-bot")
def run_bot():
    result = check_appointment.run()
    return jsonify({"status": "success", "message": result})

if __name__ == "__main__":
    app.run(debug=True)
