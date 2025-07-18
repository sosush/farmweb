# Livestock Disease Prediction Integration

This directory contains the complete Livestock Disease Prediction system integrated within the Unified Farm App.

## Overview

The Livestock Disease Prediction system uses a Logistic Regression model (83% accuracy) to predict diseases based on animal symptoms, age, and temperature. The system is fully functional with a Flask backend and ML model already included.

## Structure

- `page.tsx` - The Next.js page component that embeds the Flask backend interface via iframe
- `application.py` - The Flask backend application
- `livestock_logistic_Model.pkl` - Pre-trained Logistic Regression model
- `Cleaned_Disease_Data.csv` - Dataset used for model training
- `requirements.txt` - Python dependencies
- `templates/index.html` - Flask UI template
- `static/css/style.css` - Styling for the Flask interface

## How It Works

1. **Navbar Entry**: A "Livestock Disease" link has been added to the main navigation bar
2. **Backend Check**: When you navigate to the page, it automatically checks if the Flask backend is running
3. **Embedded Interface**: If the backend is running, it displays the Flask app interface in an iframe
4. **Instructions Page**: If the backend is not running, it shows setup instructions

## Quick Start

### Prerequisites

- Python 3.7 or higher
- pip (Python package manager)

### Easy Start Method (Recommended)

1. **For Windows users**:
   ```bash
   cd farmweb/src/app/livestock
   start-livestock.bat
   ```

2. **For Mac/Linux users**:
   ```bash
   cd farmweb/src/app/livestock
   chmod +x start-livestock.sh
   ./start-livestock.sh
   ```

### Manual Start Method

1. **Navigate to the livestock directory**:
   ```bash
   cd farmweb/src/app/livestock
   ```

2. **Install dependencies** (first time only):
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the Flask server**:
   ```bash
   python application.py
   ```

The Flask backend will run on `http://localhost:5000`

## Features

- **Animal Selection**: Support for multiple livestock types
- **Symptom Input**: Select up to 3 symptoms from dropdown menus
- **Age Input**: Enter the animal's age
- **Temperature Input**: Enter the animal's body temperature
- **Disease Prediction**: Get instant disease predictions based on the ML model
- **83% Accuracy**: Logistic Regression model with validated accuracy

## How to Use

1. Start the Flask backend (see Quick Start above)
2. Navigate to "Livestock Disease" in the main app navbar
3. Select the animal type from the dropdown
4. Enter the animal's age and temperature
5. Select up to 3 symptoms from the dropdown menus
6. Click "Predict" to get the disease prediction

## Model Details

- **Algorithm**: Logistic Regression
- **Accuracy**: 83%
- **Input Features**: Animal type, Age, Temperature, 3 Symptoms
- **Output**: Disease prediction

## Troubleshooting

- **Backend not detected**: Ensure the Flask server is running on port 5000
- **Missing model file**: Ensure `livestock_logistic_Model.pkl` is in the livestock directory
- **Missing data file**: Ensure `Cleaned_Disease_Data.csv` is in the livestock directory
- **Port conflicts**: If port 5000 is in use, modify `application.py` to use a different port

## Integration Notes

- The page automatically checks both port 5000 and 8000 for the Flask backend
- The iframe approach allows the Flask UI to be displayed within the React app layout
- CORS is already enabled in the Flask application for seamless integration
