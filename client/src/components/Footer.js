import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-light pt-5 pb-4 mt-auto">
      <div className="container text-center text-md-start">
        <div className="row text-center text-md-start">
          <div className="col-md-4 col-lg-4 col-xl-4 mx-auto mt-3">
            <h5 className="text-uppercase mb-4 font-weight-bold text-primary">
              <i className="bi bi-mortarboard-fill me-2"></i>StudyHub
            </h5>
            <p className="text-muted small">
              Empowering students worldwide to share knowledge, access quality study materials, and achieve academic excellence together.
            </p>
          </div>

          <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mt-3">
            <h6 className="text-uppercase mb-4 font-weight-bold small">Explore</h6>
            <p className="small mb-2"><Link to="/browse" className="text-muted text-decoration-none hover-white">Materials</Link></p>
            <p className="small mb-2"><Link to="/upload" className="text-muted text-decoration-none hover-white">Share Notes</Link></p>
            <p className="small mb-2"><Link to="/signup" className="text-muted text-decoration-none hover-white">Join Community</Link></p>
          </div>

          <div className="col-md-3 col-lg-2 col-xl-2 mx-auto mt-3">
            <h6 className="text-uppercase mb-4 font-weight-bold small">Support</h6>
            <p className="small mb-2 text-muted">Help Center</p>
            <p className="small mb-2 text-muted">Terms of Use</p>
            <p className="small mb-2 text-muted">Privacy Policy</p>
          </div>

          <div className="col-md-4 col-lg-3 col-xl-3 mx-auto mt-3">
            <h6 className="text-uppercase mb-4 font-weight-bold small">Contact</h6>
            <p className="small mb-2 text-muted"><i className="bi bi-geo-alt me-2"></i> University Campus, Building 7</p>
            <p className="small mb-2 text-muted"><i className="bi bi-envelope me-2"></i> support@studyhub.com</p>
            <p className="small mb-2 text-muted"><i className="bi bi-phone me-2"></i> +1 (555) 123-4567</p>
          </div>
        </div>

        <hr className="mb-4 mt-4 bg-secondary opacity-25" />

        <div className="row align-items-center">
          <div className="col-md-7 col-lg-8">
            <p className="small text-muted mb-0">
              © {new Date().getFullYear()} StudyHub Platform. All Rights Reserved.
            </p>
          </div>
          <div className="col-md-5 col-lg-4">
            <div className="text-center text-md-end">
              <ul className="list-unstyled list-inline mb-0">
                <li className="list-inline-item me-3"><i className="bi bi-facebook text-muted"></i></li>
                <li className="list-inline-item me-3"><i className="bi bi-twitter text-muted"></i></li>
                <li className="list-inline-item me-3"><i className="bi bi-linkedin text-muted"></i></li>
                <li className="list-inline-item"><i className="bi bi-instagram text-muted"></i></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .hover-white:hover { color: white !important; }
      `}</style>
    </footer>
  );
};

export default Footer;
