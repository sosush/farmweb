# Flask Backend Template for Livestock Disease Prediction

This is a template for creating a Flask backend for the Livestock Disease Prediction system.

## Quick Setup

1. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Create a simple Flask app** (app.py):
   ```python
   from flask import Flask, jsonify, request
   from flask_cors import CORS
   
   app = Flask(__name__)
   CORS(app)
   
   @app.route('/')
   def home():
       return '<h1>Livestock Disease Prediction API</h1>'
   
   @app.route('/predict', methods=['POST'])
   def predict():
       # Add your ML model prediction logic here
       return jsonify({
           'disease': 'Example Disease',
           'confidence': 0.85,
           'severity': 'moderate'
       })
   
   if __name__ == '__main__':
       app.run(debug=True, port=5000)
   ```

3. **Run the server**:
   ```bash
   python app.py
   ```

## Adding ML Model

To add actual disease prediction:

1. Train or load your ML model
2. Process uploaded images
3. Return predictions in the `/predict` endpoint

## Frontend Integration

The React frontend expects the Flask backend to run on:
- Primary: http://localhost:5000
- Alternative: http://localhost:8000

Make sure CORS is enabled for seamless integration.
