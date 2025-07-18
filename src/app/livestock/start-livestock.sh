#!/bin/bash

echo "Starting Livestock Disease Prediction Service..."
echo ""

if [ ! -f "livestock_logistic_Model.pkl" ]; then
    echo "ERROR: Model file 'livestock_logistic_Model.pkl' not found!"
    echo "Please ensure the model file is in the current directory."
    exit 1
fi

if [ ! -f "Cleaned_Disease_Data.csv" ]; then
    echo "ERROR: Data file 'Cleaned_Disease_Data.csv' not found!"
    echo "Please ensure the data file is in the current directory."
    exit 1
fi

echo "Installing/Updating dependencies..."
pip install -r requirements.txt
echo ""

echo "Starting Flask server..."
echo "The service will be available at http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python application.py
