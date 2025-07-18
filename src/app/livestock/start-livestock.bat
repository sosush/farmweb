@echo off
echo Starting Livestock Disease Prediction Service...
echo.

if not exist livestock_logistic_Model.pkl (
    echo ERROR: Model file 'livestock_logistic_Model.pkl' not found!
    echo Please ensure the model file is in the current directory.
    pause
    exit /b 1
)

if not exist Cleaned_Disease_Data.csv (
    echo ERROR: Data file 'Cleaned_Disease_Data.csv' not found!
    echo Please ensure the data file is in the current directory.
    pause
    exit /b 1
)

echo Installing/Updating dependencies...
pip install -r requirements.txt
echo.

echo Starting Flask server...
echo The service will be available at http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo.

python application.py
