import React, { useState, useRef } from 'react';

export default function ImageUpload({ onImagesChange, maxImages = 4, userId }) {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Debug log to check if component is rendering
  console.log('ImageUpload component rendered with userId:', userId);

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length + images.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images per post`);
      return;
    }

    setUploading(true);
    const newImages = [];

    try {
      for (const file of files) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} is not an image file`);
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} is too large. Maximum size is 5MB`);
          continue;
        }

        // Convert to base64
        const base64 = await fileToBase64(file);
        
        // Upload to server
        const response = await fetch('/api/upload-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: base64,
            userId: userId
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const result = await response.json();
        newImages.push({
          id: Date.now() + Math.random(),
          url: result.url,
          fileName: result.fileName,
          preview: base64
        });
      }

      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);
      onImagesChange(updatedImages.map(img => img.url));

    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload images: ' + error.message);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const removeImage = (imageId) => {
    const updatedImages = images.filter(img => img.id !== imageId);
    setImages(updatedImages);
    onImagesChange(updatedImages.map(img => img.url));
  };

  return (
    <div className="image-upload-container">
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
          📸 Add Images (Optional)
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          disabled={uploading || images.length >= maxImages}
          style={{ display: 'none' }}
        />
        <button
          type="button"
          className="btn-ghost"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || images.length >= maxImages}
          style={{
            padding: '8px 16px',
            border: '2px dashed #7c3aed',
            borderRadius: '6px',
            backgroundColor: 'transparent',
            color: '#7c3aed',
            cursor: uploading ? 'not-allowed' : 'pointer',
            opacity: uploading || images.length >= maxImages ? 0.5 : 1
          }}
        >
          {uploading ? '📤 Uploading...' : `📷 Choose Images (${images.length}/${maxImages})`}
        </button>
      </div>

      {images.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: '12px',
          marginBottom: '16px',
          padding: '12px',
          backgroundColor: 'rgba(124, 58, 237, 0.05)',
          borderRadius: '8px',
          border: '1px solid rgba(124, 58, 237, 0.2)'
        }}>
          {images.map((image) => (
            <div
              key={image.id}
              style={{
                position: 'relative',
                borderRadius: '6px',
                overflow: 'hidden',
                backgroundColor: '#f5f5f5'
              }}
            >
              <img
                src={image.preview}
                alt="Upload preview"
                style={{
                  width: '100%',
                  height: '80px',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
              <button
                type="button"
                onClick={() => removeImage(image.id)}
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 0, 0, 0.8)',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
          💡 Images will be attached to your scheduled post
        </p>
      )}
    </div>
  );
}
