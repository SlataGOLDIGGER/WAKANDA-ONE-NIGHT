from flask import Flask, render_template
from rube_goldberg_api import create_rube_goldberg_route

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

# Ajouter la route Rube Goldberg
app = create_rube_goldberg_route(app)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)

