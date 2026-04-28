import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate, Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser || null);
      if (currentUser) {
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
        } catch (error) {
          console.error('Failed to fetch profile:', error);
        }
      } else {
        setUserData(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'active fw-bold' : '';

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm py-3">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <i className="bi bi-mortarboard-fill text-primary fs-3 me-2"></i>
          <span className="fw-bold tracking-tight">StudyHub</span>
        </Link>
        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
            <li className="nav-item">
              <Link className={`nav-link px-3 ${isActive('/')}`} to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link px-3 ${isActive('/browse')}`} to="/browse">Browse</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link px-3 ${isActive('/upload')}`} to="/upload">Upload</Link>
            </li>
            {userData?.isAdmin && (
              <li className="nav-item">
                <Link className={`nav-link px-3 ${isActive('/admin')}`} to="/admin">Admin</Link>
              </li>
            )}
          </ul>

          <form className="d-flex mx-auto col-lg-4 mb-3 mb-lg-0" onSubmit={handleSearch}>
            <div className="input-group input-group-sm">
              <input 
                className="form-control bg-light border-0 rounded-start-pill ps-3" 
                type="search" 
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="btn btn-primary rounded-end-pill px-3" type="submit">
                <i className="bi bi-search"></i>
              </button>
            </div>
          </form>

          <div className="d-flex align-items-center gap-3">
            {user ? (
              <div className="dropdown">
                <button className="btn btn-outline-light rounded-pill px-4 dropdown-toggle border-2 d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown">
                  <i className="bi bi-person-circle fs-5"></i>
                  <span>{userData?.username || 'Profile'}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 mt-3 p-2 rounded-3" style={{minWidth: '200px'}}>
                  <li className="px-3 py-2 border-bottom mb-2">
                    <div className="small text-muted mb-1">Total Rewards</div>
                    <div className="fw-bold text-primary d-flex align-items-center">
                      <i className="bi bi-star-fill text-warning me-2"></i>
                      {userData?.points || 0} Points
                    </div>
                  </li>
                  <li>
                    <button className="dropdown-item py-2 rounded-2 d-flex align-items-center" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-3 text-danger"></i>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link className="btn btn-link text-light text-decoration-none fw-semibold" to="/login">Login</Link>
                <Link className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" to="/signup">Get Started</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
