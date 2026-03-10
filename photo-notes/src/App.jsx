import React, { useState } from 'react';
import { createWorker } from 'tesseract.js';

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setExtractedText(''); // Clear previous text
    }
  };

  const handleExtractText = async () => {
    if (!selectedImage) return;
    setIsExtracting(true);
    const worker = await createWorker('eng');
    const { data: { text } } = await worker.recognize(selectedImage);
    await worker.terminate();
    setExtractedText(text);
    setIsExtracting(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Photo Notes</h1>
      <p>Upload an image and extract text from it.</p>
      
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleImageUpload} 
        style={{ marginBottom: '10px' }}
      />
      
      {imagePreview && (
        <div style={{ marginBottom: '10px' }}>
          <img 
            src={imagePreview} 
            alt="Preview" 
            style={{ maxWidth: '300px', border: '1px solid #ccc' }} 
          />
        </div>
      )}
      
      <button 
        onClick={handleExtractText} 
        disabled={!selectedImage || isExtracting}
        style={{ marginBottom: '10px', padding: '10px 20px' }}
      >
        {isExtracting ? 'Extracting...' : 'Extract Text'}
      </button>
      
      <textarea 
        value={extractedText} 
        onChange={(e) => setExtractedText(e.target.value)} 
        rows={10} 
        cols={50} 
        placeholder="Extracted text will appear here..."
        style={{ width: '100%', padding: '10px', fontFamily: 'monospace' }}
      />
    </div>
  );
}

export default App;