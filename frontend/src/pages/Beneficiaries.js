import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Table, Spinner, Modal } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import { addBeneficiary, getBeneficiaries, deleteBeneficiary, transferToBeneficiary } from '../api/beneficiaryApi';
import { getProfile } from '../api/authApi';
import '../styles/global.css';

const Beneficiaries = () => {
  const { user, isAuthenticated } = useAuth();
  const [walletId, setWalletId] = useState('');
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [beneficiaryData, setBeneficiaryData] = useState({
    name: '',
    mobileNo: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferBeneficiary, setTransferBeneficiary] = useState(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferPin, setTransferPin] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);

  const loadBeneficiaries = useCallback(async (id) => {
    if (!isAuthenticated) {
      setError('Please login to view beneficiaries');
      return;
    }
    setLoadingList(true);
    setError('');
    try {
      const data = await getBeneficiaries(parseInt(id));
      setBeneficiaries(data || []);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        window.location.href = '/login';
      } else {
        setError(err.response?.data?.message || 'Failed to load beneficiaries');
      }
    } finally {
      setLoadingList(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const effectiveWalletId = user.walletId;
    if (effectiveWalletId) {
      setWalletId(effectiveWalletId.toString());
      loadBeneficiaries(effectiveWalletId);
      return;
    }

    // Fallback: fetch profile so we have walletId (e.g. after refresh or old session)
    const fetchProfileAndLoad = async () => {
      try {
        const profile = await getProfile();
        if (profile?.walletId) {
          setWalletId(profile.walletId.toString());
          await loadBeneficiaries(profile.walletId);
        }
      } catch (err) {
        if (err.response?.status === 401) {
          setError('Session expired. Please login again.');
        } else {
          setError(err.response?.data?.message || 'Failed to load wallet info.');
        }
      }
    };
    fetchProfileAndLoad();
  }, [user, isAuthenticated, loadBeneficiaries]);

  const BeneficiaryIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
    </svg>
  );

  const WalletIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
    </svg>
  );

  const NameIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  );

  const MobileIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
    </svg>
  );

  const DeleteIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
    </svg>
  );

  const TransferIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
    </svg>
  );

  const RefreshIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
    </svg>
  );

  const handleChange = (e) => {
    setBeneficiaryData({ ...beneficiaryData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!walletId) {
      setError('Please enter wallet ID');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await addBeneficiary(walletId, beneficiaryData);
      setSuccess('Beneficiary added successfully!');
      setBeneficiaryData({ name: '', mobileNo: '' });
      await loadBeneficiaries(walletId);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add beneficiary');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (beneficiaryId) => {
    if (!window.confirm('Are you sure you want to delete this beneficiary?')) {
      return;
    }
    setLoading(true);
    setError('');
    try {
      await deleteBeneficiary(parseInt(beneficiaryId));
      setSuccess('Beneficiary deleted successfully!');
      if (walletId) {
        await loadBeneficiaries(parseInt(walletId));
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete beneficiary');
    } finally {
      setLoading(false);
    }
  };

  const handleTransferClick = (beneficiary) => {
    setTransferBeneficiary(beneficiary);
    setTransferAmount('');
    setTransferPin('');
    setError('');
    setSuccess('');
    setShowTransferModal(true);
  };

  const handleTransferClose = () => {
    setShowTransferModal(false);
    setTransferBeneficiary(null);
    setTransferAmount('');
    setTransferPin('');
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    if (!transferBeneficiary || !walletId) return;
    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount < 1) {
      setError('Enter a valid amount (min 1)');
      return;
    }
    if (!/^\d{4}$/.test(transferPin)) {
      setError('PIN must be exactly 4 digits');
      return;
    }
    setTransferLoading(true);
    setError('');
    setSuccess('');
    try {
      await transferToBeneficiary(transferBeneficiary.beneficiaryId, parseInt(walletId), {
        amount,
        pin: transferPin,
      });
      setSuccess(`₹${amount} transferred to ${transferBeneficiary.name} successfully!`);
      handleTransferClose();
      if (walletId) await loadBeneficiaries(parseInt(walletId));
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Transfer failed');
    } finally {
      setTransferLoading(false);
    }
  };

  return (
    <div className="page-container">
      <Container>
        <div className="page-header">
          <h1 className="page-title">
            <BeneficiaryIcon style={{ display: 'inline-block', marginRight: '15px', verticalAlign: 'middle' }} />
            Beneficiary Management
          </h1>
          <p className="page-subtitle">Add and manage your beneficiaries for quick transfers</p>
        </div>

        {error && (
          <Row className="mt-3">
            <Col>
              <Alert variant="danger" className="alert-custom alert-danger-custom" onClose={() => setError('')} dismissible>
                <strong>⚠️ Error:</strong> {error}
              </Alert>
            </Col>
          </Row>
        )}

        {success && (
          <Row className="mt-3">
            <Col>
              <Alert variant="success" className="alert-custom alert-success-custom" onClose={() => setSuccess('')} dismissible>
                <strong>✓ Success:</strong> {success}
              </Alert>
            </Col>
          </Row>
        )}

        <Row className="mt-4">
          <Col md={6}>
            <Card className="app-card">
              <Card.Header className="card-header-custom">
                <BeneficiaryIcon />
                Add Beneficiary
              </Card.Header>
              <Card.Body className="card-body-custom">
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-custom">
                      <WalletIcon />
                      Wallet ID
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={walletId}
                      onChange={(e) => setWalletId(e.target.value)}
                      placeholder="Enter wallet ID"
                      className="form-control-custom"
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-custom">
                      <NameIcon />
                      Beneficiary Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={beneficiaryData.name}
                      onChange={handleChange}
                      placeholder="Enter beneficiary name"
                      className="form-control-custom"
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-custom">
                      <MobileIcon />
                      Mobile Number
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="mobileNo"
                      value={beneficiaryData.mobileNo}
                      onChange={handleChange}
                      placeholder="Enter mobile number"
                      className="form-control-custom"
                      required
                    />
                  </Form.Group>
                  <Button variant="primary" type="submit" className="btn-primary-custom w-100" disabled={loading}>
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <BeneficiaryIcon style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                        Add Beneficiary
                      </>
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="app-card">
              <Card.Header className="card-header-custom">
                <BeneficiaryIcon />
                Beneficiaries List
                {walletId && (
                  <Button
                    variant="outline-light"
                    size="sm"
                    className="float-end"
                    onClick={() => loadBeneficiaries(walletId)}
                    disabled={loadingList}
                    style={{ border: '1px solid rgba(255,255,255,0.5)' }}
                  >
                    <RefreshIcon style={{ marginRight: '5px', verticalAlign: 'middle' }} />
                    Refresh
                  </Button>
                )}
              </Card.Header>
              <Card.Body className="card-body-custom">
                {loadingList ? (
                  <div className="loading-container">
                    <div className="spinner-custom"></div>
                    <p className="mt-2" style={{ color: '#667eea', fontWeight: 600 }}>Loading beneficiaries...</p>
                  </div>
                ) : beneficiaries.length > 0 ? (
                  <div className="table-responsive">
                    <Table className="table-custom" striped hover>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Mobile</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {beneficiaries.map((beneficiary) => (
                          <tr key={beneficiary.beneficiaryId}>
                            <td>{beneficiary.name}</td>
                            <td>{beneficiary.mobileNo}</td>
                            <td>
                              <Button
                                variant="primary"
                                size="sm"
                                className="me-2"
                                onClick={() => handleTransferClick(beneficiary)}
                                disabled={loading || !walletId}
                              >
                                <TransferIcon style={{ marginRight: '5px', verticalAlign: 'middle' }} />
                                Transfer
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDelete(beneficiary.beneficiaryId)}
                                disabled={loading}
                              >
                                <DeleteIcon style={{ marginRight: '5px', verticalAlign: 'middle' }} />
                                Delete
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="empty-state">
                    <BeneficiaryIcon />
                    <p>No beneficiaries added yet. Add one using the form on the left.</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Modal show={showTransferModal} onHide={handleTransferClose} centered>
          <Modal.Header closeButton className="card-header-custom">
            <Modal.Title>
              <TransferIcon style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Transfer to {transferBeneficiary?.name}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="card-body-custom">
            {transferBeneficiary && (
              <p className="text-muted small mb-3">
                Sending from your wallet to {transferBeneficiary.name} ({transferBeneficiary.mobileNo})
              </p>
            )}
            <Form onSubmit={handleTransferSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Amount (₹)</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max="100000"
                  step="0.01"
                  placeholder="Enter amount"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="form-control-custom"
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Wallet PIN</Form.Label>
                <Form.Control
                  type="password"
                  maxLength="4"
                  placeholder="4-digit PIN"
                  value={transferPin}
                  onChange={(e) => setTransferPin(e.target.value.replace(/\D/g, ''))}
                  className="form-control-custom"
                  required
                />
              </Form.Group>
              <div className="d-flex gap-2 justify-content-end">
                <Button variant="secondary" onClick={handleTransferClose} disabled={transferLoading}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={transferLoading}>
                  {transferLoading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Transferring...
                    </>
                  ) : (
                    <>
                      <TransferIcon style={{ marginRight: '5px', verticalAlign: 'middle' }} />
                      Transfer
                    </>
                  )}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
};

export default Beneficiaries;
