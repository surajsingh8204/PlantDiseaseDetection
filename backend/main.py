from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import numpy as np
from io import BytesIO
from PIL import Image, ImageOps
import tensorflow as tf

app = FastAPI()

# Configure CORS
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://192.168.43.93:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load all models
import os
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POTATO_MODEL = tf.keras.models.load_model(os.path.join(BASE_DIR, "models", "1.keras"))
PEPPER_MODEL = tf.keras.models.load_model(os.path.join(BASE_DIR, "models1", "2.keras"))
# Load tomato model from H5 file without compilation (inference only)
TOMATO_MODEL = tf.keras.models.load_model(os.path.join(BASE_DIR, "models2", "3.h5"), compile=False)
# Load maize model
MAIZE_MODEL = tf.keras.models.load_model(os.path.join(BASE_DIR, "models3", "4.h5"), compile=False)
# Load apple model
APPLE_MODEL = tf.keras.models.load_model(os.path.join(BASE_DIR, "models4", "5.h5"), compile=False)

# Class names for each crop
POTATO_CLASSES = ["Potato___Early_blight", "Potato___Late_blight", "Potato___healthy"]
PEPPER_CLASSES = ["Pepper__bell___Bacterial_spot", "Pepper__bell___healthy"]
TOMATO_CLASSES = [
    "Tomato_Bacterial_spot",
    "Tomato_Early_blight", 
    "Tomato_Late_blight",
    "Tomato_Leaf_Mold",
    "Tomato_Septoria_leaf_spot",
    "Tomato_Spider_mites_Two_spotted_spider_mite",
    "Tomato__Target_Spot",
    "Tomato__Tomato_YellowLeaf__Curl_Virus",
    "Tomato__Tomato_mosaic_virus",
    "Tomato_healthy"
]
MAIZE_CLASSES = [
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn_(maize)___Common_rust_",
    "Corn_(maize)___Northern_Leaf_Blight",
    "Corn_(maize)___healthy"
]
APPLE_CLASSES = [
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___Cedar_apple_rust",
    "Apple___healthy"
]

@app.get("/ping")
async def ping():
    return "Hello, I am alive"

def read_file_as_image(data) -> np.ndarray:
    image = Image.open(BytesIO(data))
    
    # Fix orientation based on EXIF data (important for smartphone photos)
    image = ImageOps.exif_transpose(image)
    
    # Convert to RGB if necessary (in case of RGBA or grayscale)
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    # Resize to match model input size using high-quality resampling
    image = image.resize((256, 256), Image.Resampling.LANCZOS)
    
    # Convert to array
    image = np.array(image)
    
    return image

@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    crop: str = Form("potato")
):
    print(f"Received crop parameter: {crop}")  # Debug print
    
    image = read_file_as_image(await file.read())
    
    # The model has Rescaling layer built-in, so keep values in 0-255 range
    # Just add batch dimension
    img_batch = np.expand_dims(image, 0)
    
    # Select model and classes based on crop type
    if crop.lower() == "pepper":
        model = PEPPER_MODEL
        class_names = PEPPER_CLASSES
        print("Using PEPPER model")
    elif crop.lower() == "tomato":
        model = TOMATO_MODEL
        class_names = TOMATO_CLASSES
        print("Using TOMATO model")
    elif crop.lower() == "maize":
        model = MAIZE_MODEL
        class_names = MAIZE_CLASSES
        print("Using MAIZE model")
    elif crop.lower() == "apple":
        model = APPLE_MODEL
        class_names = APPLE_CLASSES
        print("Using APPLE model")
    else:  # default to potato
        model = POTATO_MODEL
        class_names = POTATO_CLASSES
        print("Using POTATO model")
    
    predictions = model.predict(img_batch)
    
    # Debug: print all predictions
    print(f"Crop: {crop}")
    print(f"Predictions: {predictions[0]}")
    print(f"Class names: {class_names}")
    print(f"Predicted index: {np.argmax(predictions[0])}")

    predicted_class = class_names[np.argmax(predictions[0])]
    confidence = np.max(predictions[0])
    
    # Return all prediction probabilities for debugging
    all_preds = {}
    for i, name in enumerate(class_names):
        all_preds[name] = float(predictions[0][i])
    
    return {
        'class': predicted_class,
        'confidence': float(confidence),
        'crop': crop,
        'all_predictions': all_preds
    }

if __name__ == "__main__":
    uvicorn.run(app, host='0.0.0.0', port=8000)
