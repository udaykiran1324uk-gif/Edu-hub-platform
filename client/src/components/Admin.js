import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';

const getApiCandidates = () => {
  const fromEnv = process.env.REACT_APP_API_URL;
  const sameOrigin = window.location.origin;
  const currentHost = `${window.location.protocol}//${window.location.hostname}`;

  return [fromEnv, sameOrigin, `${currentHost}:5000`]
    .filter(Boolean);
};

const deleteFromAvailableApi = async (payload) => {
  const candidates = getApiCandidates();

  for (const apiUrl of candidates) {
    try {
      const response = await fetch(`${apiUrl}/api/files/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) return;
    } catch (error) {
      // Try next
    }
  }
};

const Admin = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = collection(db, 'resources');
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const docs = [];
      querySnapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() });
      });
      setResources(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (resource) => {
    if (window.confirm(`Are you sure you want to delete "${resource.title}"?`)) {
      try {
        if (resource.storageType && resource.storagePath) {
          await deleteFromAvailableApi({
            storageType: resource.storageType,
            storagePath: resource.storagePath,
          });
        }
        await deleteDoc(doc(db, 'resources', resource.id));
        alert('Resource and file deleted successfully.');
      } catch (error) {
        console.error("Error deleting resource: ", error);
        alert('Failed to delete resource.');
      }
    }
  };

  return (
    <div className="container py-5">
      <div className="row mb-4 align-items-center">
        <div className="col">
          <h2 className="fw-bold display-6 mb-1">Admin Control</h2>
          <p className="text-secondary">Manage platform resources and ensure content quality.</p>
        </div>
        <div className="col-auto text-end">
          <div className="bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-bold small d-flex align-items-center">
            <i className="bi bi-shield-check-fill me-2"></i> Authorized Access
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-header bg-white border-bottom py-3 px-4">
          <div className="row align-items-center">
            <div className="col">
              <h5 className="mb-0 fw-bold">Resource Inventory</h5>
            </div>
            <div className="col-auto">
               <span className="badge bg-light text-dark border px-3 py-2 rounded-pill fw-semibold">{resources.length} Total Files</span>
            </div>
          </div>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="ps-4 py-3 text-uppercase small fw-bold text-muted">Title</th>
                    <th className="py-3 text-uppercase small fw-bold text-muted">Subject</th>
                    <th className="py-3 text-uppercase small fw-bold text-muted">Uploader</th>
                    <th className="py-3 text-uppercase small fw-bold text-muted text-end pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.map((resource) => (
                    <tr key={resource.id}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center">
                          <div className="bg-light rounded p-2 me-3">
                            <i className="bi bi-file-earmark-text text-primary fs-5"></i>
                          </div>
                          <div>
                            <div className="fw-bold text-dark">{resource.title}</div>
                            <div className="small text-muted">{resource.fileName}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-primary border rounded-pill px-3 py-1 fw-normal">
                          {resource.subject}
                        </span>
                      </td>
                      <td className="small text-muted">{resource.uploader}</td>
                      <td className="text-end pe-4">
                        <button
                          className="btn btn-outline-danger btn-sm rounded-pill px-3"
                          onClick={() => handleDelete(resource)}
                        >
                          <i className="bi bi-trash3 me-1"></i> Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                  {resources.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-5 text-muted">
                        <i className="bi bi-inbox fs-1 d-block mb-3 opacity-25"></i>
                        No resources found in the database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
