import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';

const SUBJECTS = ['All', 'Mathematics', 'Science', 'History', 'Engineering', 'Medicine', 'Business', 'Arts', 'Computer Science'];

const deleteFromAvailableApi = async (payload) => {
  const apiUrl = process.env.NODE_ENV === 'production' 
    ? '' 
    : (process.env.REACT_APP_API_URL || 'http://localhost:5000');

  try {
    const response = await fetch(`${apiUrl}/api/files/delete`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      console.warn("Delete request failed on server");
    }
  } catch (error) {
    console.error("Error connecting to API for delete:", error);
  }
};

const Browse = () => {
  const [resources, setResources] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for search query or subject in URL
    const params = new URLSearchParams(location.search);
    const search = params.get('search');
    const subject = params.get('subject');
    
    if (search) {
      setSearchTerm(search);
    }
    if (subject) {
      setSelectedSubject(subject);
    }
  }, [location.search]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user || null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'resources'), orderBy('createdAt', 'desc'));
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
    if (!currentUser || resource.uploaderId !== currentUser.uid) return;
    if (!window.confirm(`Delete "${resource.title}"?`)) return;

    try {
      setDeletingId(resource.id);

      if (resource.storageType && resource.storagePath) {
        await deleteFromAvailableApi({
          storageType: resource.storageType,
          storagePath: resource.storagePath,
        });
      }

      await deleteDoc(doc(db, 'resources', resource.id));
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete resource. Please try again.');
    } finally {
      setDeletingId('');
    }
  };

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        resource.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'All' || resource.subject.toLowerCase() === selectedSubject.toLowerCase();
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="container py-5">
      <div className="row mb-5 align-items-end">
        <div className="col-md-6">
          <h2 className="fw-bold display-6 mb-2">Explore Resources</h2>
          <p className="text-secondary mb-0">Discover high-quality study materials shared by top students.</p>
        </div>
        <div className="col-md-6 text-md-end mt-3 mt-md-0">
          <button className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" onClick={() => navigate('/upload')}>
            <i className="bi bi-plus-lg me-2"></i>Share Your Notes
          </button>
        </div>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-lg-8">
          <div className="input-group input-group-lg shadow-sm rounded-4 overflow-hidden border">
            <span className="input-group-text bg-white border-0 ps-4"><i className="bi bi-search text-primary"></i></span>
            <input
              type="text"
              className="form-control border-0 py-3 ps-2"
              placeholder="Search by module, title, or topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-lg-4">
          <select 
            className="form-select form-select-lg shadow-sm rounded-4 border py-3 px-4"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            {SUBJECTS.map(sub => <option key={sub} value={sub}>{sub}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5 my-5">
          <div className="spinner-grow text-primary" role="status" style={{width: '3rem', height: '3rem'}}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted fw-semibold">Fetching study materials...</p>
        </div>
      ) : (
        <div className="row g-4">
          {filteredResources.length > 0 ? (
            filteredResources.map((resource) => (
              <div key={resource.id} className="col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-hover rounded-4 transition overflow-hidden">
                  <div className="card-header bg-primary bg-opacity-10 border-0 py-3 px-4 d-flex justify-content-between align-items-center">
                    <span className="badge bg-white text-primary rounded-pill px-3 py-2 border">{resource.subject}</span>
                    <i className="bi bi-file-earmark-pdf fs-4 text-primary opacity-75"></i>
                  </div>
                  <div className="card-body p-4">
                    <h5 className="fw-bold mb-3 text-dark leading-tight">{resource.title}</h5>
                    <p className="text-secondary small mb-4 line-clamp-3" style={{minHeight: '4.5em'}}>
                      {resource.description || 'No description provided for this resource.'}
                    </p>
                    <div className="d-flex justify-content-between align-items-center pt-3 border-top mt-auto">
                      <div className="d-flex align-items-center">
                        <div className="bg-light rounded-circle p-2 me-2">
                           <i className="bi bi-person text-primary"></i>
                        </div>
                        <span className="small text-muted text-truncate" style={{maxWidth: '120px'}}>{resource.uploader}</span>
                      </div>
                      <a
                        href={resource.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-dark rounded-pill px-3 fw-bold"
                      >
                        <i className="bi bi-download me-1"></i> View
                      </a>
                    </div>
                    {currentUser && resource.uploaderId === currentUser.uid && (
                      <div className="mt-3">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold"
                          onClick={() => handleDelete(resource)}
                          disabled={deletingId === resource.id}
                        >
                          {deletingId === resource.id ? 'Removing...' : 'Remove My File'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center py-5 my-5 bg-white rounded-4 shadow-sm">
              <i className="bi bi-emoji-frown fs-1 text-muted mb-3"></i>
              <h4 className="fw-bold">No resources found</h4>
              <p className="text-muted">Try adjusting your search terms or filters.</p>
              <button className="btn btn-outline-primary rounded-pill mt-3 px-4" onClick={() => {setSearchTerm(''); setSelectedSubject('All');}}>
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        .shadow-hover { box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075); }
        .shadow-hover:hover { transform: translateY(-5px); box-shadow: 0 1rem 2rem rgba(0,0,0,0.08) !important; }
        .leading-tight { line-height: 1.25; }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;  
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default Browse;
