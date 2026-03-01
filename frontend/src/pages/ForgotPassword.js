import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { forgotPassword, resetPassword } from '../api/authApi';
import '../styles/global.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetTokenFromApi, setResetTokenFromApi] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestToken = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const data = await forgotPassword(mobile.trim());
      setMessage(data.message || 'Check your reset token below.');
      if (data.resetToken) {
        setResetTokenFromApi(data.resetToken);
        setToken(data.resetToken);
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const data = await resetPassword(token.trim(), newPassword);
      setMessage(data.message || 'Password reset successfully. You can now login.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. Token may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <Container>
        <div className="page-header">
          <h1 className="page-title">Forgot Password</h1>
          <p className="page-subtitle">
            {step === 1 ? 'Enter your mobile number to get a reset token' : 'Enter the reset token and your new password'}
          </p>
        </div>

        <Row className="justify-content-center">
          <Col md={6}>
            {error && (
              <Alert variant="danger" dismissible onClose={() => setError('')}>
                {error}
              </Alert>
            )}
            {message && (
              <Alert variant="success" dismissible onClose={() => setMessage('')}>
                {message}
              </Alert>
            )}

            <Card className="app-card">
              <Card.Body className="card-body-custom">
                {step === 1 ? (
                  <Form onSubmit={handleRequestToken}>
                    <Form.Group className="mb-3">
                      <Form.Label>Mobile Number</Form.Label>
                      <Form.Control
                        type="text"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="Enter registered mobile number"
                        required
                      />
                    </Form.Group>
                    <Button type="submit" variant="primary" className="w-100" disabled={loading}>
                      {loading ? 'Sending...' : 'Get reset token'}
                    </Button>
                    {resetTokenFromApi && (
                      <div className="mt-3 p-2 bg-light rounded small">
                        <strong>Your reset token (copy it):</strong>
                        <code className="d-block mt-1 text-break">{resetTokenFromApi}</code>
                        <span className="text-muted">Use this token on the next step. Valid for 15 minutes.</span>
                      </div>
                    )}
                  </Form>
                ) : (
                  <Form onSubmit={handleResetPassword}>
                    <Form.Group className="mb-3">
                      <Form.Label>Reset token</Form.Label>
                      <Form.Control
                        type="text"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="Paste the token from step 1"
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>New password</Form.Label>
                      <Form.Control
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        minLength={6}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Confirm new password</Form.Label>
                      <Form.Control
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        minLength={6}
                        required
                      />
                    </Form.Group>
                    <Button type="submit" variant="primary" className="w-100 mb-2" disabled={loading}>
                      {loading ? 'Resetting...' : 'Reset password'}
                    </Button>
                    <Button type="button" variant="outline-secondary" className="w-100" onClick={() => setStep(1)}>
                      Back to step 1
                    </Button>
                  </Form>
                )}

                <div className="text-center mt-3">
                  <Link to="/login" className="link-custom">Back to login</Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ForgotPassword;
