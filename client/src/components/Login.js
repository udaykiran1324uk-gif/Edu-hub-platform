import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [identifier, setIdentifier] = useState(''); // Can be email or username
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let loginEmail = identifier;

      // If identifier is not an email (doesn't contain @), look up the email by username
      if (!identifier.includes('@')) {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", identifier));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setError('Username not found.');
          setLoading(false);
          return;
        }

        // Get the email associated with this username
        loginEmail = querySnapshot.docs[0].data().email;
      }

      await signInWithEmailAndPassword(auth, loginEmail, password);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Invalid username/email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card shadow-lg border-0 rounded-4">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <i className="bi bi-mortarboard-fill text-primary fs-1"></i>
                <h2 className="fw-bold mt-2">Welcome Back</h2>
                <p className="text-muted small">Login with your Username or Email</p>
              </div>
              
              {error && <div className="alert alert-danger py-2 small">{error}</div>}
              
              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Username or Email</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><i className="bi bi-person-badge"></i></span>
                    <input
                      type="text"
                      className="form-control bg-light border-start-0"
                      placeholder="Username or Email"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between">
                    <label className="form-label small fw-semibold">Password</label>
                    <Link to="/forgot-password" size="small" className="text-decoration-none small">Forgot Password?</Link>
                  </div>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><i className="bi bi-lock"></i></span>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control bg-light border-start-0 border-end-0"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <span 
                      className="input-group-text bg-light border-start-0 cursor-pointer" 
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ cursor: 'pointer' }}
                    >
                      <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                    </span>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-100 py-2 fw-bold rounded-3 shadow-sm mt-3" disabled={loading}>
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>

              <div className="text-center mt-4">
                <span className="text-muted small">New here?</span> <Link to="/signup" className="text-decoration-none small fw-bold">Create Account</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
