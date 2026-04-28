const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Firebase Admin using Service Account from .env
try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  console.log("Service Account parsed, private_key starts with:", serviceAccount.private_key.substring(0, 30));
  // Fix for private key newlines in env variables
  if (serviceAccount.private_key.includes('\\n')) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    console.log("Fixed newlines in private_key");
  }
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
  console.log("Firebase Admin initialized successfully.");
} catch (error) {
  console.error("Firebase Admin initialization error:", error);
}

let bucket;
try {
  bucket = admin.storage().bucket();
  console.log("Firebase Storage bucket initialized.");
} catch (e) {
  console.error("Firebase Storage bucket initialization failed:", e.message);
}

app.use(cors());
app.use(express.json());

// Use Memory Storage for multer to upload directly to Firebase
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve Static Files from React in Production
const clientBuildPath = path.join(__dirname, '..', 'client', 'build');
app.use(express.static(clientBuildPath));

app.get('/api/health', (req, res) => {
  res.send('Study Resource Sharing Platform Backend is healthy.');
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { uid, newPassword } = req.body;

  if (!uid || !newPassword) {
    return res.status(400).json({ error: 'uid and newPassword are required.' });
  }

  const isStrongPassword =
    newPassword.length >= 8 &&
    /[A-Z]/.test(newPassword) &&
    /[a-z]/.test(newPassword) &&
    /[0-9]/.test(newPassword) &&
    /[!@#$%^&*]/.test(newPassword);

  if (!isStrongPassword) {
    return res.status(400).json({ error: 'Password does not meet security requirements.' });
  }

  try {
    await admin.auth().updateUser(uid, { password: newPassword });
    return res.json({ success: true, message: 'Password reset successful.' });
  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({ error: 'Unable to reset password. Please try again.' });
  }
});

app.post('/api/files/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'File is required.' });
  }

  const handleLocalFallback = () => {
    // Fallback to local storage
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    
    const localFileName = `${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const localPath = path.join(uploadsDir, localFileName);
    
    fs.writeFileSync(localPath, req.file.buffer);
    
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${localFileName}`;
    return res.json({
      success: true,
      fileUrl,
      fileName: req.file.originalname,
      storageType: 'local',
      storagePath: localFileName,
      warning: 'Uploaded to local server because Firebase Storage was unavailable.'
    });
  };

  if (!bucket) {
    console.warn("No bucket initialized, using local fallback.");
    return handleLocalFallback();
  }

  try {
    const fileName = `resources/${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const file = bucket.file(fileName);

    try {
      await file.save(req.file.buffer, {
        metadata: { contentType: req.file.mimetype },
      });
      console.log("File saved to bucket:", fileName);

      try {
        await file.makePublic();
        console.log("File made public");
      } catch (pubErr) {
        console.warn("Could not make file public:", pubErr.message);
      }
      const [signedUrl] = await file.getSignedUrl({
        action: 'read',
        expires: '03-01-2500',
      });
      return res.json({
        success: true,
        fileUrl: signedUrl,
        fileName: req.file.originalname,
        storageType: 'firebase',
        storagePath: fileName,
      });
    } catch (storageErr) {
      console.error("Firebase Storage save failed:", storageErr.message);
      return handleLocalFallback();
    }
  } catch (error) {
    console.error('File upload logic error:', error);
    return res.status(500).json({ error: 'Failed to upload file.' });
  }
});

app.delete('/api/files/delete', async (req, res) => {
  const { storageType, storagePath } = req.body || {};

  if (!storageType || !storagePath) {
    return res.status(400).json({ error: 'storageType and storagePath are required.' });
  }

  try {
    if (storageType === 'local') {
      const localPath = path.join(__dirname, 'uploads', storagePath);
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
      return res.json({ success: true });
    }

    if (storageType === 'firebase') {
      if (!bucket) {
        return res.status(500).json({ error: 'Storage bucket unavailable.' });
      }
      await bucket.file(storagePath).delete({ ignoreNotFound: true });
      return res.json({ success: true });
    }

    return res.status(400).json({ error: 'Unsupported storageType.' });
  } catch (error) {
    console.error('File delete error:', error);
    return res.status(500).json({ error: 'Failed to delete file.' });
  }
});

// All other GET requests not handled before will return the React app
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
