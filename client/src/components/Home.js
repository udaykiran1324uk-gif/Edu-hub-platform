import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/browse');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser || null);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary text-white py-5 position-relative overflow-hidden" style={{minHeight: '450px'}}>
        <div className="container position-relative py-5">
          <div className="row align-items-center">
            <div className="col-lg-7">
              <h1 className="display-3 fw-bold mb-4 tracking-tight">Your Academic Success <br /><span className="text-warning">Starts Here.</span></h1>
              <p className="lead mb-5 opacity-90 fs-4 pe-lg-5">Access the world's most collaborative study platform. Share notes, download resources, and earn rewards while you learn.</p>
              
              <form onSubmit={handleSearch} className="mb-4">
                <div className="input-group input-group-lg shadow-lg rounded-pill overflow-hidden bg-white p-1">
                  <span className="input-group-text bg-white border-0 ps-4">
                    <i className="bi bi-search text-primary"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-0 py-3 ps-2"
                    placeholder="Search for notes, subjects, or modules..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{boxShadow: 'none'}}
                  />
                  <button className="btn btn-dark rounded-pill px-4 fw-bold" type="submit">Search</button>
                </div>
              </form>

              <div className="d-flex gap-3">
                <button className="btn btn-warning btn-lg rounded-pill px-5 fw-bold shadow-sm d-flex align-items-center gap-2" onClick={() => navigate('/browse')}>
                  <i className="bi bi-grid-fill"></i> Browse All
                </button>
                <button className="btn btn-light btn-lg rounded-pill px-5 fw-bold shadow-sm d-flex align-items-center gap-2" onClick={() => navigate('/upload')}>
                  <i className="bi bi-cloud-arrow-up-fill text-primary"></i> Upload
                </button>
              </div>
            </div>
            <div className="col-lg-5 d-none d-lg-block">
              <div className="position-absolute translate-middle-y end-0 opacity-10" style={{top: '50%'}}>
                 <i className="bi bi-journal-bookmark-fill" style={{fontSize: '300px'}}></i>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-light py-5 border-top border-bottom">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold mb-0">Browse by Category</h4>
            <button className="btn btn-link text-decoration-none fw-bold" onClick={() => navigate('/browse')}>View All <i className="bi bi-chevron-right small"></i></button>
          </div>
          <div className="row g-3">
            {['Computer Science', 'Mathematics', 'Engineering', 'Business', 'Arts', 'Science'].map((cat) => (
              <div key={cat} className="col-6 col-md-4 col-lg-2">
                <div 
                  className="card h-100 border-0 shadow-sm rounded-4 text-center p-3 cursor-pointer hover-lift transition"
                  onClick={() => navigate(`/browse?subject=${encodeURIComponent(cat)}`)}
                >
                  <div className="bg-primary bg-opacity-10 text-primary rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center" style={{width: '50px', height: '50px'}}>
                    <i className={`bi bi-${cat === 'Computer Science' ? 'cpu' : cat === 'Mathematics' ? 'calculator' : cat === 'Engineering' ? 'gear' : cat === 'Business' ? 'graph-up' : cat === 'Arts' ? 'palette' : 'flask'} fs-4`}></i>
                  </div>
                  <div className="small fw-bold">{cat}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <div className="container py-5 my-5">
        <div className="text-center mb-5">
          <h2 className="fw-bold display-6 mb-3">How StudyHub Works</h2>
          <div className="bg-primary mx-auto rounded-pill" style={{width: '60px', height: '4px'}}></div>
        </div>
        
        <div className="row g-4 mt-2">
          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm rounded-4 p-4 text-center hover-lift transition">
              <div className="icon-circle bg-success bg-opacity-10 text-success mx-auto mb-4">
                <i className="bi bi-cloud-arrow-up fs-2"></i>
              </div>
              <h4 className="fw-bold mb-3">Upload & Share</h4>
              <p className="text-secondary px-2">Upload your verified notes and materials. Each upload earns you <span className="text-primary fw-bold">10 Points</span> toward rewards.</p>
              <button className="btn btn-link text-decoration-none fw-bold mt-auto" onClick={() => navigate('/upload')}>Upload Now <i className="bi bi-arrow-right ms-1"></i></button>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm rounded-4 p-4 text-center hover-lift transition">
              <div className="icon-circle bg-info bg-opacity-10 text-info mx-auto mb-4">
                <i className="bi bi-search-heart fs-2"></i>
              </div>
              <h4 className="fw-bold mb-3">Smart Discovery</h4>
              <p className="text-secondary px-2">Use our advanced search to find exactly what you need by subject, module, or university keyword.</p>
              <button className="btn btn-link text-decoration-none fw-bold mt-auto text-info" onClick={() => navigate('/browse')}>Start Browsing <i className="bi bi-arrow-right ms-1"></i></button>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm rounded-4 p-4 text-center hover-lift transition">
              <div className="icon-circle bg-warning bg-opacity-10 text-warning mx-auto mb-4">
                <i className="bi bi-award fs-2"></i>
              </div>
              <h4 className="fw-bold mb-3">Gain Recognition</h4>
              <p className="text-secondary px-2">Build your reputation as a top contributor. The more you share, the higher your student rank climbs.</p>
              <div className="mt-auto pt-3">
                 <span className="badge bg-warning text-dark px-3 py-2 rounded-pill"><i className="bi bi-star-fill me-1"></i> Top Contributors</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!user && (
        <section className="bg-dark text-white py-5">
          <div className="container py-4 text-center">
            <h2 className="display-6 fw-bold mb-4">Ready to start your journey?</h2>
            <p className="opacity-75 mb-5 mx-auto fs-5" style={{maxWidth: '600px'}}>Join thousands of students who are already sharing and learning better together.</p>
            <button className="btn btn-primary btn-lg rounded-pill px-5 fw-bold shadow-lg" onClick={() => navigate('/signup')}>Create Free Account</button>
          </div>
        </section>
      )}

      <style>{`
        .transition { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .hover-lift:hover { transform: translateY(-12px); box-shadow: 0 1rem 3rem rgba(0,0,0,.1) !important; }
        .icon-circle { width: 70px; height: 70px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
        .tracking-tight { letter-spacing: -0.02em; }
      `}</style>
    </div>
  );
};

export default Home;
