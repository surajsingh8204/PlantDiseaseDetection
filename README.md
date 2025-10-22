# 🌱 Multi-Crop Disease Detection Web Application

AI-powered web application for detecting plant diseases using deep learning CNN models trained on TensorFlow.

## 📋 Features

- **Multi-Crop Support**: Switch between Potato, Pepper Bell, and Tomato disease detection
- **Drag & Drop Interface**: Easy-to-use image upload
- **Real-time Detection**: Instant disease classification
- **Disease Classes**:
  - **Potato** (3): Early Blight, Late Blight, Healthy
  - **Pepper Bell** (2): Bacterial Spot, Healthy
  - **Tomato** (10): Bacterial Spot, Early Blight, Late Blight, Leaf Mold, Septoria Leaf Spot, Spider Mites, Target Spot, Mosaic Virus, Yellow Leaf Curl Virus, Healthy
- **Treatment Recommendations**: Get actionable advice for detected diseases
- **Confidence Scores**: See prediction confidence levels

## 🏗️ Project Structure

```
diseastectionpotao/
├── models/
│   ├── 1/                 # TensorFlow SavedModel format
│   ├── 1.keras            # Keras model format
│   └── 1.h5              # H5 model format
├── backend/
│   ├── main.py           # FastAPI backend server
│   ├── requirements.txt  # Python dependencies
│   └── test.py          # API test script
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js       # Main React component
│   │   ├── App.css      # Styles
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
├── PlantVillage/         # Training dataset
└── training.ipynb        # Model training notebook
```

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- Node.js 14+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```powershell
cd backend
```

2. Create a virtual environment (recommended):
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

3. Install Python dependencies:
```powershell
pip install -r requirements.txt
```

4. Start the FastAPI server:
```powershell
python main.py
```

The backend will run on `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```powershell
cd frontend
```

2. Install npm dependencies:
```powershell
npm install
```

3. Start the React development server:
```powershell
npm start
```

The frontend will open automatically at `http://localhost:3000`

## 🎯 Usage

1. **Start Backend**: Run the FastAPI server (port 8000)
2. **Start Frontend**: Run the React app (port 3000)
3. **Upload Image**: Drag & drop or click to select a potato leaf image
4. **Analyze**: Click "Analyze Image" button
5. **View Results**: See the disease classification, confidence score, and recommendations

## 🧪 Testing the API

Test the backend API directly:

```powershell
cd backend
python test.py
```

Or use curl:
```powershell
curl -X POST "http://localhost:8000/predict" -F "file=@your_image.jpg"
```

## 📊 Model Information

- **Architecture**: CNN (Convolutional Neural Network)
- **Framework**: TensorFlow/Keras
- **Input Size**: 256x256 pixels
- **Classes**: 3 (Early Blight, Late Blight, Healthy)
- **Training Dataset**: PlantVillage dataset

## 🔧 TensorFlow Serving (Optional)

To use TensorFlow Serving instead of direct model loading:

1. Install TensorFlow Serving
2. Update `backend/main.py` to use TF Serving endpoint
3. Start TF Serving:
```powershell
tensorflow_model_server --rest_api_port=8501 --model_name=potato_model --model_base_path=C:\Users\Suraj\Desktop\diseastectionpotao\models
```

## 🌐 API Endpoints

### GET `/ping`
Health check endpoint

**Response:**
```json
"Hello, I am alive"
```

### POST `/predict`
Predict disease from uploaded image

**Request:**
- Content-Type: multipart/form-data
- Body: file (image)

**Response:**
```json
{
  "class": "Potato___Early_blight",
  "confidence": 0.95
}
```

## 🎨 Technologies Used

### Backend
- FastAPI - Modern web framework
- TensorFlow/Keras - Deep learning
- Pillow - Image processing
- Uvicorn - ASGI server

### Frontend
- React - UI framework
- React Dropzone - Drag & drop functionality
- Axios - HTTP client
- CSS3 - Styling

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 👤 Author

Created for potato disease detection using deep learning.

## 🙏 Acknowledgments

- PlantVillage dataset
- TensorFlow team
- FastAPI community
- React community
