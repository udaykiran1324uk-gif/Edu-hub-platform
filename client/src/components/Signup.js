import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false
  });
  const navigate = useNavigate();

  const validatePassword = (pass) => {
    const strength = {
      length: pass.length >= 8,
      upper: /[A-Z]/.test(pass),
      lower: /[a-z]/.test(pass),
      number: /[0-9]/.test(pass),
      special: /[!@#$%^&*]/.test(pass)
    };
    setPasswordStrength(strength);
    return Object.values(strength).every(Boolean);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'password') {
      validatePassword(value);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);

    if (!validatePassword(formData.password)) {
      setError('Password does not meet requirements.');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Store additional profile info in Firestore. If this fails, the auth
      // account may still be created successfully, so we keep login usable.
      try {
        await setDoc(doc(db, "users", user.uid), {
          username: formData.username,
          email: formData.email,
          mobile: formData.mobile,
          points: 0,
          isAdmin: false,
          createdAt: new Date().toISOString()
        });
      } catch (profileErr) {
        console.error('Profile save failed after account creation:', profileErr);
      }

      navigate('/');
    } catch (err) {
      if (err?.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please login or use a different email.');
      } else if (err?.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (err?.code === 'auth/weak-password') {
        setError('Password is too weak. Please choose a stronger password.');
      } else {
        setError('Unable to create account right now. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-lg border-0 rounded-4">
            <div className="card-body p-5">
              <h2 className="text-center fw-bold mb-4">Create Account</h2>
              {error && <div className="alert alert-danger py-2">{error}</div>}
              
              <form onSubmit={handleSignup}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Username</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><i className="bi bi-person"></i></span>
                    <input
                      type="text"
                      name="username"
                      className="form-control bg-light border-start-0"
                      placeholder="johndoe"
                      value={formData.username}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Email</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><i className="bi bi-envelope"></i></span>
                    <input
                      type="email"
                      name="email"
                      className="form-control bg-light border-start-0"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Mobile Number</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><i className="bi bi-phone"></i></span>
                    <input
                      type="tel"
                      name="mobile"
                      className="form-control bg-light border-start-0"
                      placeholder="+1234567890"
                      value={formData.mobile}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><i className="bi bi-lock"></i></span>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className="form-control bg-light border-start-0 border-end-0"
                      value={formData.password}
                      onChange={handleChange}
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
                  
                  <div className="mt-2 small">
                    <div className={passwordStrength.length ? "text-success" : "text-muted"}>
                      <i className={`bi bi-${passwordStrength.length ? 'check-circle-fill' : 'circle'} me-1`}></i> 8-12+ characters (12+ recommended)
                    </div>
                    <div className={passwordStrength.upper ? "text-success" : "text-muted"}>
                      <i className={`bi bi-${passwordStrength.upper ? 'check-circle-fill' : 'circle'} me-1`}></i> One Uppercase (A-Z)
                    </div>
                    <div className={passwordStrength.lower ? "text-success" : "text-muted"}>
                      <i className={`bi bi-${passwordStrength.lower ? 'check-circle-fill' : 'circle'} me-1`}></i> One Lowercase (a-z)
                    </div>
                    <div className={passwordStrength.number ? "text-success" : "text-muted"}>
                      <i className={`bi bi-${passwordStrength.number ? 'check-circle-fill' : 'circle'} me-1`}></i> One Number (0-9)
                    </div>
                    <div className={passwordStrength.special ? "text-success" : "text-muted"}>
                      <i className={`bi bi-${passwordStrength.special ? 'check-circle-fill' : 'circle'} me-1`}></i> One Special Symbol
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold">Confirm Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><i className="bi bi-shield-check"></i></span>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      className="form-control bg-light border-start-0 border-end-0"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                    <span 
                      className="input-group-text bg-light border-start-0 cursor-pointer" 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{ cursor: 'pointer' }}
                    >
                      <i className={`bi bi-eye${showConfirmPassword ? '-slash' : ''}`}></i>
                    </span>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-100 py-2 fw-bold rounded-3 shadow-sm" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>

              <div className="text-center mt-4">
                <span className="text-muted small">Already have an account?</span> <Link to="/login" className="text-decoration-none small fw-bold">Login</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
