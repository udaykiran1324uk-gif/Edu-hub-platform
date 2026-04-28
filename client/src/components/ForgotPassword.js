import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Mobile, 2: OTP, 3: Send Reset Link
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleMobileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const q = query(collection(db, "users"), where("mobile", "==", mobile));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setError('Mobile number not found.');
        return;
      }

      const nextOtp = String(Math.floor(100000 + Math.random() * 900000));
      setResetEmail(querySnapshot.docs[0].data().email);
      setGeneratedOtp(nextOtp);
      alert(`Mock OTP sent to ${mobile}: ${nextOtp}`);
      setStep(2);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (otp === generatedOtp) {
      setStep(3);
    } else {
      setError('Invalid OTP.');
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, resetEmail);
      alert(`OTP Verified! A secure password reset link has been sent to your email: ${resetEmail}. Please follow the link to set your new password.`);
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card shadow-lg border-0 rounded-4">
            <div className="card-body p-4">
              <h3 className="text-center fw-bold mb-4">Reset Password</h3>
              {error && <div className="alert alert-danger p-2 small">{error}</div>}

              {step === 1 && (
                <form onSubmit={handleMobileSubmit}>
                  <p className="text-muted small mb-3 text-center">Enter your registered mobile number to receive an OTP.</p>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Mobile Number</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0"><i className="bi bi-phone"></i></span>
                      <input
                        type="tel"
                        className="form-control bg-light border-start-0"
                        placeholder="Registered Mobile"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary w-100 fw-bold rounded-3">Send OTP</button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleOtpSubmit}>
                  <p className="text-muted small mb-3 text-center">Enter the 6-digit OTP sent to {mobile}</p>
                  <div className="mb-3 text-center">
                    <input
                      type="text"
                      className="form-control bg-light text-center fs-4 fw-bold"
                      maxLength="6"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100 fw-bold rounded-3">Verify OTP</button>
                </form>
              )}

              {step === 3 && (
                <form onSubmit={handleResetSubmit}>
                  <div className="alert alert-success small py-3">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    OTP Verified Successfully!
                  </div>
                  <p className="text-muted small mb-4">
                    Click the button below to receive a secure link on your registered email <strong>{resetEmail}</strong> to reset your password.
                  </p>
                  <button type="submit" className="btn btn-primary w-100 fw-bold rounded-3" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Reset Email'}
                  </button>
                </form>
              )}

              <div className="text-center mt-3">
                <Link to="/login" className="text-decoration-none small">Back to Login</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
