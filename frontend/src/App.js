import React, { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import Cropper from 'react-easy-crop';
import './App.css';

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [selectedCrop, setSelectedCrop] = useState('potato'); // New state for crop selection
  const cameraInputRef = useRef(null);
  const [showTips, setShowTips] = useState(false);
  
  // Cropping states
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      // Clear previous results immediately
      setPrediction(null);
      setConfidence(0);
      
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Automatically trigger prediction for new image
      await analyzImage(file);
    }
  };

  const analyzImage = async (file) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('crop', selectedCrop); // Send selected crop to backend

    try {
      const apiUrl = 'https://plant-disease-api-yt7l.onrender.com';
      const response = await axios.post(`${apiUrl}/predict`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 120000 // 120 second timeout (for cold start on free tier)
      });

      setPrediction(response.data.class);
      setConfidence(response.data.confidence);
    } catch (error) {
      console.error('Error:', error);
      if (error.code === 'ECONNABORTED') {
        alert('Request timeout. The server might be slow. Please try again.');
      } else if (error.response) {
        alert(`Server error: ${error.response.status}. Please check the backend.`);
      } else if (error.request) {
        alert('Cannot connect to backend server. Please wait a moment and try again.');
      } else {
        alert('Error: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    multiple: false
  });

  const handlePredict = async () => {
    if (!selectedImage) {
      alert('Please select an image first!');
      return;
    }

    await analyzImage(selectedImage);
  };

  const handleCameraCapture = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Clear previous results immediately
      setPrediction(null);
      setConfidence(0);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCroppedImage = async () => {
    try {
      const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
      setPreview(croppedImage.url);
      setSelectedImage(croppedImage.file);
      setShowCropModal(false);
      
      // Automatically trigger prediction for cropped image
      await analyzImage(croppedImage.file);
    } catch (e) {
      console.error('Error cropping image:', e);
    }
  };

  const getCroppedImg = (imageSrc, pixelCrop) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = imageSrc;
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.drawImage(
          image,
          pixelCrop.x,
          pixelCrop.y,
          pixelCrop.width,
          pixelCrop.height,
          0,
          0,
          pixelCrop.width,
          pixelCrop.height
        );

        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'));
            return;
          }
          const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
          const url = URL.createObjectURL(blob);
          resolve({ file, url });
        }, 'image/jpeg');
      };
      image.onerror = reject;
    });
  };

  const cancelCrop = () => {
    setShowCropModal(false);
    setImageToCrop(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const openCamera = () => {
    cameraInputRef.current.click();
  };

  const formatClassName = (className) => {
    return className
      .replace(/Potato___/g, '')
      .replace(/Pepper__bell___/g, '')
      .replace(/Tomato_/g, '')
      .replace(/Tomato__/g, '')
      .replace(/Corn_\(maize\)___/g, '')
      .replace(/Apple___/g, '')
      .replace(/_/g, ' ');
  };

  const getHealthStatus = (className) => {
    if (className.includes('healthy')) {
      return { status: 'Healthy', color: '#10b981', emoji: '+' };
    } else if (className.includes('Early_blight') || className.includes('Early blight')) {
      return { status: 'Early Blight Detected', color: '#f59e0b', emoji: '⚠' };
    } else if (className.includes('Late_blight') || className.includes('Late blight')) {
      return { status: 'Late Blight Detected', color: '#ef4444', emoji: '⚠' };
    } else if (className.includes('Bacterial_spot') || className.includes('Bacterial spot')) {
      return { status: 'Bacterial Spot Detected', color: '#ef4444', emoji: '⚠' };
    } else if (className.includes('Leaf_Mold') || className.includes('Leaf Mold')) {
      return { status: 'Leaf Mold Detected', color: '#ef4444', emoji: '⚠' };
    } else if (className.includes('Septoria')) {
      return { status: 'Septoria Leaf Spot Detected', color: '#ef4444', emoji: '⚠' };
    } else if (className.includes('Spider_mites') || className.includes('Spider mites')) {
      return { status: 'Spider Mites Detected', color: '#f59e0b', emoji: '⚠' };
    } else if (className.includes('Target_Spot') || className.includes('Target Spot')) {
      return { status: 'Target Spot Detected', color: '#ef4444', emoji: '⚠' };
    } else if (className.includes('mosaic_virus') || className.includes('mosaic virus')) {
      return { status: 'Mosaic Virus Detected', color: '#ef4444', emoji: '⚠' };
    } else if (className.includes('YellowLeaf') || className.includes('Curl_Virus')) {
      return { status: 'Yellow Leaf Curl Virus Detected', color: '#ef4444', emoji: '⚠' };
    }
    return { status: 'Disease Detected', color: '#ef4444', emoji: '⚠' };
  };

  const getCropIcon = () => {
    if (selectedCrop === 'potato') return '🥔';
    if (selectedCrop === 'pepper') return '🫑';
    if (selectedCrop === 'tomato') return '🍅';
    if (selectedCrop === 'maize') return '🌽';
    if (selectedCrop === 'apple') return '🍎';
    return '🌱';
  };

  const getCropName = () => {
    if (selectedCrop === 'potato') return 'Potato';
    if (selectedCrop === 'pepper') return 'Pepper Bell';
    if (selectedCrop === 'tomato') return 'Tomato';
    if (selectedCrop === 'maize') return 'Maize';
    if (selectedCrop === 'apple') return 'Apple';
    return 'Plant';
  };

  return (
    <div className="App">
      <div className="main-title">
        <h1>Plant Disease Detection</h1>
        <p>AI-Powered Multi-Crop Health Analysis</p>
      </div>
      <div className="container">
        <header className="header">
          <h2>{getCropIcon()} {getCropName()} Disease Detection</h2>
          
          {/* Crop Selector Toggle */}
          <div className="crop-selector">
            <button 
              className={`crop-button ${selectedCrop === 'potato' ? 'active' : ''}`}
              onClick={() => {
                setSelectedCrop('potato');
                setPrediction(null);
                setConfidence(0);
              }}
            >
              🥔 Potato
            </button>
            <button 
              className={`crop-button ${selectedCrop === 'pepper' ? 'active' : ''}`}
              onClick={() => {
                setSelectedCrop('pepper');
                setPrediction(null);
                setConfidence(0);
              }}
            >
              🫑 Pepper Bell
            </button>
            <button 
              className={`crop-button ${selectedCrop === 'tomato' ? 'active' : ''}`}
              onClick={() => {
                setSelectedCrop('tomato');
                setPrediction(null);
                setConfidence(0);
              }}
            >
              🍅 Tomato
            </button>
            <button 
              className={`crop-button ${selectedCrop === 'maize' ? 'active' : ''}`}
              onClick={() => {
                setSelectedCrop('maize');
                setPrediction(null);
                setConfidence(0);
              }}
            >
              🌽 Maize
            </button>
            <button 
              className={`crop-button ${selectedCrop === 'apple' ? 'active' : ''}`}
              onClick={() => {
                setSelectedCrop('apple');
                setPrediction(null);
                setConfidence(0);
              }}
            >
              🍎 Apple
            </button>
          </div>
        </header>

        <div className="main-content">
          <div className="upload-section">
            <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
              <input {...getInputProps()} />
              {preview ? (
                <div className="preview-container">
                  <img src={preview} alt="Preview" className="preview-image" />
                </div>
              ) : (
                <div className="dropzone-content">
                  <div className="upload-icon">📁</div>
                  <p className="dropzone-text">
                    {isDragActive
                      ? 'Drop the image here...'
                      : 'Drag & drop an image here, or click to select'}
                  </p>
                  <p className="dropzone-hint">Supported formats: JPG, JPEG, PNG</p>
                </div>
              )}
            </div>

            {/* Hidden camera input */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCameraCapture}
              style={{ display: 'none' }}
            />

            {/* Camera and Tips buttons */}
            <div className="action-buttons">
              <button onClick={() => setShowTips(true)} className="tips-icon-button" title="Photo Tips">
                💡
              </button>
              <button onClick={openCamera} className="camera-button">
                📷 Take Photo
              </button>
            </div>

            {selectedImage && (
              <button
                onClick={handlePredict}
                disabled={loading}
                className="predict-button"
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Analyzing...
                  </>
                ) : (
                  'Analyze Image'
                )}
              </button>
            )}
          </div>

          {/* Tips Modal */}
          {showTips && (
            <div className="modal-overlay" onClick={() => setShowTips(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={() => setShowTips(false)}>
                  ✕
                </button>
                <h3 className="modal-title">📋 Tips for Better Results</h3>
                <ul className="modal-tips-list">
                  <li>✓ Use good lighting (natural light is best)</li>
                  <li>✓ Focus on the affected leaf area</li>
                  <li>✓ Keep the camera steady</li>
                  <li>✓ Fill the frame with the leaf</li>
                  <li>✓ Avoid blurry or dark images</li>
                  <li>✓ Capture clear details of symptoms</li>
                </ul>
              </div>
            </div>
          )}

          {prediction && (
            <div className="results-section">
              <h2>Analysis Results</h2>
              <div className="result-card">
                <div className="result-header" style={{ borderColor: getHealthStatus(prediction).color }}>
                  <span className={`result-emoji ${prediction.includes('healthy') ? 'healthy-emoji' : 'disease-emoji'}`}>
                    {getHealthStatus(prediction).emoji}
                  </span>
                  <h3 style={{ color: getHealthStatus(prediction).color }}>
                    {getHealthStatus(prediction).status}
                  </h3>
                </div>
                <div className="result-details">
                  <div className="detail-item">
                    <span className="detail-label">Disease Type:</span>
                    <span className="detail-value">{formatClassName(prediction)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Confidence:</span>
                    <span className="detail-value">{(confidence * 100).toFixed(2)}%</span>
                  </div>
                  <div className="confidence-bar">
                    <div
                      className="confidence-fill"
                      style={{
                        width: `${confidence * 100}%`,
                        backgroundColor: getHealthStatus(prediction).color
                      }}
                    ></div>
                  </div>
                </div>
                
                {!prediction.includes('healthy') && (
                  <div className="recommendations">
                    <h4>💡 Recommendations:</h4>
                    <ul>
                      {prediction.includes('Early_blight') && (
                        <>
                          <li>Remove and destroy infected plant parts</li>
                          <li>Apply fungicides containing chlorothalonil or mancozeb</li>
                          <li>Improve air circulation around plants</li>
                          <li>Water at the base of plants, avoid wetting foliage</li>
                        </>
                      )}
                      {prediction.includes('Late_blight') && (
                        <>
                          <li>Remove infected plants immediately</li>
                          <li>Apply copper-based fungicides</li>
                          <li>Ensure proper spacing between plants</li>
                          <li>Avoid overhead irrigation</li>
                          <li>Consider resistant varieties</li>
                        </>
                      )}
                      {prediction.includes('Bacterial_spot') && (
                        <>
                          <li>Remove and destroy infected leaves</li>
                          <li>Apply copper-based bactericides</li>
                          <li>Avoid working with plants when wet</li>
                          <li>Use pathogen-free seeds and transplants</li>
                          <li>Rotate crops to reduce disease pressure</li>
                        </>
                      )}
                      {prediction.includes('Leaf_Mold') && (
                        <>
                          <li>Improve ventilation and reduce humidity</li>
                          <li>Remove infected leaves immediately</li>
                          <li>Apply fungicides if necessary</li>
                          <li>Avoid overhead watering</li>
                        </>
                      )}
                      {prediction.includes('Septoria') && (
                        <>
                          <li>Remove infected lower leaves</li>
                          <li>Apply fungicides containing chlorothalonil</li>
                          <li>Mulch around plants to prevent soil splash</li>
                          <li>Rotate crops annually</li>
                        </>
                      )}
                      {prediction.includes('Spider_mites') && (
                        <>
                          <li>Spray plants with strong water jets</li>
                          <li>Apply insecticidal soap or neem oil</li>
                          <li>Introduce predatory mites</li>
                          <li>Maintain proper humidity levels</li>
                        </>
                      )}
                      {prediction.includes('Target_Spot') && (
                        <>
                          <li>Remove and destroy infected plant debris</li>
                          <li>Apply appropriate fungicides</li>
                          <li>Improve air circulation</li>
                          <li>Practice crop rotation</li>
                        </>
                      )}
                      {(prediction.includes('mosaic_virus') || prediction.includes('YellowLeaf') || prediction.includes('Curl_Virus')) && (
                        <>
                          <li>Remove and destroy infected plants immediately</li>
                          <li>Control insect vectors (whiteflies, aphids)</li>
                          <li>Use virus-resistant varieties</li>
                          <li>Maintain weed-free areas around plants</li>
                          <li>Disinfect tools between plants</li>
                        </>
                      )}
                      {prediction.includes('Cercospora') && (
                        <>
                          <li>Remove and destroy infected leaves</li>
                          <li>Apply fungicides containing azoxystrobin or propiconazole</li>
                          <li>Practice crop rotation (2-3 years)</li>
                          <li>Plant resistant varieties</li>
                          <li>Maintain proper plant spacing</li>
                        </>
                      )}
                      {prediction.includes('Common_rust') && (
                        <>
                          <li>Apply fungicides at first sign of infection</li>
                          <li>Use resistant hybrid varieties</li>
                          <li>Remove volunteer corn plants</li>
                          <li>Plant early to avoid peak rust season</li>
                        </>
                      )}
                      {prediction.includes('Northern_Leaf_Blight') && (
                        <>
                          <li>Plant resistant hybrids</li>
                          <li>Apply fungicides (azoxystrobin, pyraclostrobin)</li>
                          <li>Tillage to bury crop residue</li>
                          <li>Rotate with non-host crops</li>
                          <li>Ensure adequate spacing for air circulation</li>
                        </>
                      )}
                      {prediction.includes('Apple_scab') && (
                        <>
                          <li>Remove fallen leaves and infected fruit</li>
                          <li>Apply fungicides during spring growth</li>
                          <li>Plant scab-resistant varieties</li>
                          <li>Prune trees to improve air circulation</li>
                          <li>Avoid overhead irrigation</li>
                        </>
                      )}
                      {prediction.includes('Black_rot') && (
                        <>
                          <li>Remove infected fruit, branches and mummies</li>
                          <li>Apply fungicides during bloom period</li>
                          <li>Prune out dead and diseased branches</li>
                          <li>Maintain tree vigor with proper fertilization</li>
                          <li>Clean up fallen fruit and leaves</li>
                        </>
                      )}
                      {prediction.includes('Cedar_apple_rust') && (
                        <>
                          <li>Remove nearby cedar trees if possible</li>
                          <li>Apply fungicides in early spring</li>
                          <li>Plant resistant apple varieties</li>
                          <li>Rake and dispose of fallen leaves</li>
                          <li>Maintain good air circulation</li>
                        </>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Crop Modal */}
        {showCropModal && (
          <div className="modal-overlay">
            <div className="crop-modal-content">
              <button className="modal-close" onClick={cancelCrop}>×</button>
              <h2 className="modal-title">Crop Your Image</h2>
              
              <div className="crop-container">
                <Cropper
                  image={imageToCrop}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
              
              <div className="crop-controls">
                <label className="zoom-label">
                  Zoom
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(e.target.value)}
                    className="zoom-slider"
                  />
                </label>
              </div>
              
              <div className="crop-buttons">
                <button className="cancel-crop-button" onClick={cancelCrop}>
                  Cancel
                </button>
                <button className="apply-crop-button" onClick={createCroppedImage}>
                  ✓ Apply & Analyze
                </button>
              </div>
            </div>
          </div>
        )}

        <footer className="footer">
          <p>Powered by TensorFlow & React | Deep Learning CNN Model</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
