import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import { login } from '../api/authApi';
import { isAdmin } from '../utils/jwtUtils';
import '../styles/global.css';

const Login = () => {
  const [formData, setFormData] = useState({ mobile: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login: authLogin, isAuthenticated, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If already authenticated: admin → /admin, customer → /dashboard
    if (!authLoading && isAuthenticated && user) {
      navigate(user.isAdmin ? '/admin' : '/dashboard', { replace: true });
    }
  }, [isAuthenticated, authLoading, user, navigate]);

  const LoginIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h10V3H12v2h8v14z"/>
    </svg>
  );

  const MobileIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
    </svg>
  );

  const PasswordIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
    </svg>
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(formData);
      if (response.success && response.token) {
        authLogin(response.token, {
          userId: response.userId,
          name: response.name,
          mobile: response.mobile,
        });
        // Admin sees only admin panel; customer sees dashboard
        const admin = isAdmin(response.token);
        navigate(admin ? '/admin' : '/dashboard');
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Don't render login page if user is authenticated
  if (authLoading) {
    return (
      <div className="page-container">
        <Container>
          <div className="loading-container">
            <div className="spinner-custom"></div>
            <p className="mt-3" style={{ color: '#667eea', fontWeight: 600 }}>Loading...</p>
          </div>
        </Container>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="page-container">
      <Container>
        <div className="page-header">
          <h1 className="page-title">Login to Your Account</h1>
          <p className="page-subtitle">Welcome back! Please enter your credentials</p>
        </div>

        <Row className="justify-content-center">
          <Col md={6}>
            {error && (
              <Alert variant="danger" className="alert-custom alert-danger-custom" onClose={() => setError('')} dismissible>
                <strong>⚠️ Error:</strong> {error}
              </Alert>
            )}

            <Card className="app-card">
              <Card.Header className="card-header-custom">
                <LoginIcon />
                Login
              </Card.Header>
              <Card.Body className="card-body-custom">
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-custom">
                      <MobileIcon />
                      Mobile Number
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      placeholder="Enter mobile number"
                      className="form-control-custom"
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-custom">
                      <PasswordIcon />
                      Password
                    </Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter password"
                      className="form-control-custom"
                      required
                    />
                  </Form.Group>
                  <Button variant="primary" type="submit" className="btn-primary-custom w-100" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Logging in...
                      </>
                    ) : (
                      <>
                        <LoginIcon style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                        Login
                      </>
                    )}
                  </Button>
                </Form>
                <div className="text-center mt-3">
                  <Link to="/forgot-password" className="link-custom d-block mb-2">Forgot password?</Link>
                  <Link to="/signup" className="link-custom">Don't have an account? Sign up</Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;
