import React, { useState } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Upload = () => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setError('');
    if (!e.target.files[0]) return;

    const selectedFile = e.target.files[0];
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const maxSize = 10 * 1024 * 1024;

    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Only PDF, DOCX, and TXT files are allowed.');
      return;
    }

    if (selectedFile.size > maxSize) {
      setError('File is too large. Maximum size is 10MB.');
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
    if (!auth.currentUser) {
      setError('You must be logged in to upload.');
      return;
    }

    try {
      setUploading(true);
      setProgress(20);

      // Dynamically determine API URL: use same origin in production, or localhost in dev
      const apiUrl = process.env.NODE_ENV === 'production' 
        ? '' 
        : (process.env.REACT_APP_API_URL || 'http://localhost:5000');
        
      const formData = new FormData();
      formData.append('file', file);

      setProgress(40);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const uploadResponse = await fetch(`${apiUrl}/api/files/upload`, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!uploadResponse.ok) {
        let errorMessage = `Server error (${uploadResponse.status})`;
        try {
          const errorData = await uploadResponse.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // Response was not JSON
          const textError = await uploadResponse.text().catch(() => "");
          if (textError.includes("<!DOCTYPE html>")) {
            errorMessage = "Server returned an HTML page (possibly a 404 or crash). Check backend logs.";
          } else {
            errorMessage = textError || errorMessage;
          }
        }
        throw new Error(errorMessage);
      }

      const uploadData = await uploadResponse.json();
      setProgress(70);

      try {
        await addDoc(collection(db, 'resources'), {
          title,
          subject,
          description,
          fileUrl: uploadData.fileUrl,
          fileName: uploadData.fileName,
          storageType: uploadData.storageType || 'local',
          storagePath: uploadData.storagePath || uploadData.fileName,
          uploader: auth.currentUser.email,
          uploaderId: auth.currentUser.uid,
          createdAt: serverTimestamp(),
        });
      } catch (firestoreErr) {
        console.error("Firestore save error:", firestoreErr);
        throw new Error(`File uploaded to server, but failed to save to database: ${firestoreErr.message}. Check your Firebase permissions.`);
      }

      const userRef = doc(db, "users", auth.currentUser.uid);
      try {
        await updateDoc(userRef, {
          points: increment(10)
        });
      } catch (pointErr) {
        console.warn("Points update failed:", pointErr.message);
        // Don't throw here, the file is already in the database
      }

      setProgress(100);
      alert('Resource uploaded successfully! +10 Points earned.');
      navigate('/browse');
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-light min-vh-100 py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card shadow-sm border-0 rounded-4 p-4">
              <div className="card-body">
                <div className="d-flex align-items-center mb-4 text-success">
                  <i className="bi bi-cloud-arrow-up-fill fs-1 me-3"></i>
                  <h2 className="fw-bold mb-0">Upload Study Resource</h2>
                </div>
                
                {errorMsg && <div className="alert alert-danger mb-4">{errorMsg}</div>}
                
                <p className="text-muted mb-4">Share high-quality materials to help others and earn contribution points!</p>
                
                <form onSubmit={handleUpload}>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Resource Title</label>
                    <input
                      type="text"
                      className="form-control form-control-lg bg-light border-0"
                      placeholder="e.g., Advanced Calculus Notes - Week 5"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Subject / Category</label>
                    <input
                      type="text"
                      className="form-control form-control-lg bg-light border-0"
                      placeholder="e.g., Mathematics"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Description (Optional)</label>
                    <textarea
                      className="form-control bg-light border-0"
                      rows="4"
                      placeholder="Provide a brief summary of what this resource covers..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                  </div>
                  
                  <div className="mb-4">
                    <label className="form-label small fw-bold">File Selection</label>
                    <div className="border border-2 border-dashed rounded-4 p-4 text-center bg-light">
                      <input
                        type="file"
                        className="form-control d-none"
                        id="fileInput"
                        accept=".pdf,.docx,.txt"
                        onChange={handleFileChange}
                      />
                      <label htmlFor="fileInput" className="cursor-pointer">
                        <i className="bi bi-file-earmark-plus fs-2 text-primary"></i>
                        <p className="mb-0 mt-2 fw-semibold">{file ? file.name : 'Click to select PDF, DOCX, or TXT'}</p>
                        <small className="text-muted">Maximum file size: 10MB</small>
                      </label>
                    </div>
                  </div>

                  {uploading && (
                    <div className="mb-4">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="small fw-bold">Uploading...</span>
                        <span className="small fw-bold">{progress}%</span>
                      </div>
                      <div className="progress rounded-pill" style={{height: '10px'}}>
                        <div
                          className="progress-bar progress-bar-striped progress-bar-animated bg-success"
                          role="progressbar"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                    <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => navigate('/')}>
                      Discard
                    </button>
                    <button type="submit" className="btn btn-success rounded-pill px-5 fw-bold" disabled={uploading}>
                      {uploading ? 'Processing...' : 'Publish Resource'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .border-dashed { border-style: dashed !important; }
        .cursor-pointer { cursor: pointer; }
      `}</style>
    </div>
  );
};

export default Upload;
