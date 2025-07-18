from flask import Flask,render_template,request,redirect
from flask_cors import CORS,cross_origin
import pickle   # coverts python object to Byte stream-- basically sends python data over network
import pandas as pd  # library used for reading and writing in csv files
import numpy as np

app=Flask(__name__)
cors = CORS(app)
model=pickle.load(open('livestock_logistic_Model.pkl','rb')) # bytestream data of logistic regression model  is loaded to model
print('Loaded model type:', type(model))
print('Loaded model:', model)
Data=pd.read_csv('Cleaned_Disease_Data.csv') # with help of pandas we are reading csv file

@app.route('/',methods=['GET','POST'])
def index():
    Animals =sorted(Data['Animal'].unique())
    Symptom_1s =sorted(Data['Symptom 1'].unique())
    Symptom_2s = sorted(Data['Symptom 2'].unique())
    Symptom_3s = sorted(Data['Symptom 3'].unique())


    Animals.insert(0,'Select Animal')
    Symptom_1s.insert(0, 'Select Symptom 1')
    Symptom_2s.insert(0, 'Select Symptom 2')
    Symptom_3s.insert(0, 'Select Symptom 3')
    return render_template('index.html',Animals=Animals,Symptom_1s= Symptom_1s,Symptom_2s=Symptom_2s,Symptom_3s=Symptom_3s)


@app.route('/predict',methods=['POST'])
@cross_origin()
def predict():
    try:
        # Extract form data
        Animal = request.form.get('Animal')
        Age = request.form.get('Age')
        Temperature = request.form.get('Temperature')
        Symptom_1 = request.form.get('Symptom 1')
        Symptom_2 = request.form.get('Symptom 2')
        Symptom_3 = request.form.get('Symptom 3')

        # Validate input
        missing_fields = []
        for field_name, value in [
            ("Animal", Animal),
            ("Age", Age),
            ("Temperature", Temperature),
            ("Symptom 1", Symptom_1),
            ("Symptom 2", Symptom_2),
            ("Symptom 3", Symptom_3)
        ]:
            if value is None or value == '' or value.startswith('Select'):
                missing_fields.append(field_name)
        if missing_fields:
            return f"Error: Missing or invalid input for fields: {', '.join(missing_fields)}", 400

        # Prepare input DataFrame
        input_df = pd.DataFrame(
            [[Animal, Age, Temperature, Symptom_1, Symptom_2, Symptom_3]],
            columns=pd.Index(["Animal", "Age", "Temperature", "Symptom 1", "Symptom 2", "Symptom 3"])
        )
        print('Input DataFrame for prediction:')
        print(input_df)
        # Make prediction
        prediction = model.predict(input_df)
        return str(prediction[0])
    except Exception as e:
        import traceback
        print('Prediction error:', traceback.format_exc())
        return f"Internal Server Error: {str(e)}", 500


# Accuracy is 83 percent with logistic Regression

if __name__=='__main__':
    app.run()

