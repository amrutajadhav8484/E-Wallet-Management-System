import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import { linkBankAccount, getBankAccount } from '../api/bankApi';
import './BankAccounts.css';

const BankAccounts = () => {
  const { user, isAuthenticated } = useAuth();
  const [walletId, setWalletId] = useState('');
  const [bankData, setBankData] = useState({
    accountNumber: '',
    balance: '',
    ifscCode: '',
    bankName: '',
    mobileNumber: '',
  });
  const [linkedAccount, setLinkedAccount] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingAccount, setLoadingAccount] = useState(false);

  useEffect(() => {
    // Only load if user is authenticated
    if (!isAuthenticated || !user) {
      return;
    }
    
    // Try to get walletId from user profile if available
    if (user?.walletId) {
      setWalletId(user.walletId.toString());
      loadBankAccount(user.walletId);
    }
  }, [user, isAuthenticated]);

  const loadBankAccount = async (id, showSuccess = false) => {
    if (!id) {
      setError('Please enter a wallet ID');
      return;
    }
    
    // Don't load if not authenticated
    if (!isAuthenticated) {
      setError('Please login to view bank account');
      return;
    }
    
    setLoadingAccount(true);
    setError('');
    if (showSuccess) {
      setSuccess('');
    }
    try {
      const data = await getBankAccount(parseInt(id));
      if (data) {
        setLinkedAccount(data);
        if (showSuccess) {
          setSuccess('Bank account loaded successfully!');
        }
      } else {
        setLinkedAccount(null);
        setError('No bank account data received from server.');
      }
    } catch (err) {
      // Account might not be linked yet, that's okay
      if (err.response?.status === 404) {
        setLinkedAccount(null);
        setError('No bank account found for this wallet ID. Please link a bank account first.');
      } else if (err.response?.status === 401) {
        // Token expired or invalid
        setError('Session expired. Please login again.');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        window.location.href = '/login';
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to load bank account');
        setLinkedAccount(null);
      }
    } finally {
      setLoadingAccount(false);
    }
  };

  const handleChange = (e) => {
    setBankData({ ...bankData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!walletId) {
      setError('Please enter wallet ID');
      return;
    }
    if (!/^\d+$/.test(walletId)) {
      setError('Wallet ID must be a valid number');
      return;
    }
    if (!bankData.accountNumber || !/^\d+$/.test(bankData.accountNumber)) {
      setError('Account number must be a valid number');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Backend expects accountNumber as Integer, balance as Double
      const bankPayload = {
        accountNumber: parseInt(bankData.accountNumber),
        balance: parseFloat(bankData.balance) || 0.0,
        ifscCode: bankData.ifscCode,
        bankName: bankData.bankName,
        mobileNumber: bankData.mobileNumber,
      };
      await linkBankAccount(parseInt(walletId), bankPayload);
      setSuccess('Bank account linked successfully!');
      setBankData({
        accountNumber: '',
        balance: '',
        ifscCode: '',
        bankName: '',
        mobileNumber: '',
      });
      // Reload the linked account after a short delay
      setTimeout(() => {
        loadBankAccount(parseInt(walletId), false);
      }, 500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to link bank account');
    } finally {
      setLoading(false);
    }
  };

  // SVG Icons
  const BankIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 8h2v8H5zm7 0h2v8h-2zM2 4h4V2h2v2h4V2h2v2h4v2H2V4zm0 14H2v2h20v-2H2zm15-4h2v-4h-2v4z"/>
    </svg>
  );

  const WalletIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
    </svg>
  );

  const AccountNumberIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-4h11v4zm0-5H4V9h11v4zm5 5h-4V9h4v9z"/>
    </svg>
  );

  const BalanceIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V5h-3v2.16c-1.94.42-3.5 1.68-3.5 3.66 0 2.3 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V19h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
    </svg>
  );

  const IFSCIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
    </svg>
  );

  const BankNameIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
    </svg>
  );

  const MobileIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
    </svg>
  );

  const ViewIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
    </svg>
  );

  const LinkIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
    </svg>
  );

  const EmptyIcon = () => (
    <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
    </svg>
  );

  return (
    <div className="page-container">
      <Container>
        <div className="page-header">
          <h1 className="page-title">
            <BankIcon style={{ display: 'inline-block', marginRight: '10px', verticalAlign: 'middle' }} />
            Bank Account Management
          </h1>
          <p className="page-subtitle">Link and manage your bank accounts securely</p>
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
            <Card className="bank-card">
              <Card.Header className="card-header-custom">
                <LinkIcon />
                Link Bank Account
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
                      <AccountNumberIcon />
                      Account Number
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="accountNumber"
                      value={bankData.accountNumber}
                      onChange={handleChange}
                      placeholder="Enter account number"
                      className="form-control-custom"
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-custom">
                      <BalanceIcon />
                      Balance
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="balance"
                      value={bankData.balance}
                      onChange={handleChange}
                      placeholder="Enter balance"
                      min="0"
                      step="0.01"
                      className="form-control-custom"
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-custom">
                      <IFSCIcon />
                      IFSC Code
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="ifscCode"
                      value={bankData.ifscCode}
                      onChange={handleChange}
                      placeholder="Enter IFSC code"
                      className="form-control-custom"
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-custom">
                      <BankNameIcon />
                      Bank Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="bankName"
                      value={bankData.bankName}
                      onChange={handleChange}
                      placeholder="Enter bank name"
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
                      name="mobileNumber"
                      value={bankData.mobileNumber}
                      onChange={handleChange}
                      placeholder="Enter mobile number"
                      className="form-control-custom"
                      required
                    />
                  </Form.Group>
                  <Button variant="primary" type="submit" disabled={loading} className="btn-primary-custom w-100">
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Linking...
                      </>
                    ) : (
                      <>
                        <LinkIcon style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                        Link Bank Account
                      </>
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="bank-card mb-3">
              <Card.Header className="card-header-custom">
                <ViewIcon />
                View Bank Account
              </Card.Header>
              <Card.Body className="card-body-custom">
                <Form.Group className="mb-3">
                  <Form.Label className="form-label-custom">
                    <WalletIcon />
                    Wallet ID
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={walletId}
                    onChange={(e) => setWalletId(e.target.value)}
                    placeholder="Enter wallet ID to view bank account"
                    className="form-control-custom"
                  />
                </Form.Group>
                <Button
                  variant="primary"
                  onClick={() => loadBankAccount(walletId, true)}
                  disabled={loadingAccount || !walletId}
                  className="btn-primary-custom w-100"
                >
                  {loadingAccount ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <ViewIcon style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                      View Bank Account
                    </>
                  )}
                </Button>
              </Card.Body>
            </Card>

            <Card className="bank-card">
              <Card.Header className="card-header-custom">
                <BankIcon />
                Linked Bank Account Details
              </Card.Header>
              <Card.Body className="card-body-custom">
                {loadingAccount ? (
                  <div className="loading-container">
                    <div className="spinner-custom"></div>
                    <p className="mt-3" style={{ color: '#667eea', fontWeight: 600 }}>Loading bank account details...</p>
                  </div>
                ) : linkedAccount ? (
                  <div className="account-details-container">
                    <div className="detail-item">
                      <div className="detail-label">
                        <AccountNumberIcon />
                        Account Number:
                      </div>
                      <div className="detail-value">{linkedAccount.accountNumber}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">
                        <BankNameIcon />
                        Bank Name:
                      </div>
                      <div className="detail-value">{linkedAccount.bankName}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">
                        <IFSCIcon />
                        IFSC Code:
                      </div>
                      <div className="detail-value">{linkedAccount.ifscCode}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">
                        <BalanceIcon />
                        Balance:
                      </div>
                      <div className="detail-value balance">
                        ₹{linkedAccount.balance?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">
                        <MobileIcon />
                        Mobile:
                      </div>
                      <div className="detail-value">{linkedAccount.mobileNumber}</div>
                    </div>
                    {linkedAccount.walletId && (
                      <div className="detail-item">
                        <div className="detail-label">
                          <WalletIcon />
                          Wallet ID:
                        </div>
                        <div className="detail-value">{linkedAccount.walletId}</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="empty-state">
                    <EmptyIcon />
                    <p>No bank account linked yet. Link one using the form on the left, or enter a wallet ID above to view an existing account.</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default BankAccounts;
