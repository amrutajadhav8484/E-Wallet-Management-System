import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Table, Modal } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import { getProfile } from '../api/authApi';
import {
  getBalance,
  setPin as setWalletPin,
  requestOtpForChangePin,
  changePin,
  addFunds,
  withdraw,
  transfer,
  getTransactionHistory,
} from '../api/walletApi';
import '../styles/global.css';

const Wallet = () => {
  const { user, isAuthenticated } = useAuth();
  const [walletId, setWalletId] = useState('');

  useEffect(() => {
    // Only fetch if user is authenticated
    if (!user || !isAuthenticated) {
      return;
    }

    // Try to get walletId from user profile if available
    const fetchWalletId = async () => {
      try {
        const profile = await getProfile();
        if (profile?.walletId) {
          setWalletId(profile.walletId.toString());
        }
      } catch (err) {
        // If 401, token is invalid - logout user
        if (err.response?.status === 401) {
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
        // Profile might not be available, that's okay
        console.log('Could not fetch profile for walletId');
      }
    };

    if (user && !walletId) {
      fetchWalletId();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAuthenticated]);
  const [pin, setPin] = useState('');
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // PIN Management (Change PIN: step 1 = current PIN → OTP, step 2 = OTP + new PIN)
  const [newPin, setNewPin] = useState('');
  const [oldPin, setOldPin] = useState('');
  const [changePinStep, setChangePinStep] = useState('current'); // 'current' | 'otp'
  const [otpValue, setOtpValue] = useState('');
  const [otpReceived, setOtpReceived] = useState(''); // Demo: OTP returned from API (show to user)

  // Transaction forms
  const [amount, setAmount] = useState('');
  const [transferData, setTransferData] = useState({
    fromWalletId: '',
    toWalletId: '',
    amount: '',
    description: '',
    pin: '',
  });

  const handleGetBalance = async () => {
    if (!walletId || !pin) {
      setError('Please enter wallet ID and PIN');
      return;
    }
    if (!/^\d+$/.test(walletId)) {
      setError('Wallet ID must be a valid number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await getBalance(parseInt(walletId), pin);
      setBalance(data.balance);
      setSuccess('Balance retrieved successfully');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to get balance');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPin = async () => {
    if (!walletId || walletId.trim() === '') {
      setError('Please enter wallet ID. You can find it in your Dashboard profile.');
      return;
    }
    if (!/^\d+$/.test(walletId)) {
      setError('Wallet ID must be a valid number');
      return;
    }
    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      setError('PIN must be exactly 4 digits (numbers only)');
      return;
    }
    // Warn if walletId doesn't match user's walletId
    if (user?.walletId && parseInt(walletId) !== user.walletId) {
      if (!window.confirm(`Warning: The wallet ID you entered (${walletId}) doesn't match your wallet ID (${user.walletId}). Continue anyway?`)) {
        return;
      }
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const walletIdInt = parseInt(walletId);
      console.log('Setting PIN for walletId:', walletIdInt, 'PIN:', newPin);
      
      // Call the API
      const response = await setWalletPin(walletIdInt, { pin: newPin });
      console.log('Set PIN response:', response);
      console.log('Response type:', typeof response);
      
      // Check if response is undefined or null
      if (response === undefined || response === null) {
        console.error('Response is undefined or null - PIN might still be set');
        // Even if response is undefined, the PIN might have been set
        // Try to verify by attempting to get balance
        setError('No response received from server. The PIN might have been set - please try using "Get Balance" with your PIN to verify. If it works, the PIN was set successfully.');
        setShowPinModal(false);
        setNewPin('');
        return;
      }
      
      // Handle response - ApiResponse has: message, success, timestamp
      // Backend returns: { message: "PIN set successfully", success: true, timestamp: "..." }
      // Check if success field exists and is true (handle both boolean and string)
      const isSuccess = response.success === true || response.success === 'true' || String(response.success).toLowerCase() === 'true';
      
      if (isSuccess) {
        setSuccess('PIN set successfully! You can now use this PIN for wallet operations.');
        setShowPinModal(false);
        setNewPin('');
        setBalance(null);
        return;
      }
      
      // If success is explicitly false, show error
      if (response.success === false || response.success === 'false') {
        setError(response.message || 'PIN setting failed. Please try again.');
        return;
      }
      
      // If success field doesn't exist but message contains "success" (case-insensitive)
      const message = String(response.message || '').toLowerCase();
      if (message.includes('success') || message.includes('set successfully') || message.includes('pin set')) {
        // Assume success if message indicates success
        setSuccess('PIN set successfully! You can now use this PIN for wallet operations.');
        setShowPinModal(false);
        setNewPin('');
        setBalance(null);
        return;
      }
      
      // If we got here, response structure is unexpected
      console.warn('Unexpected response structure:', response);
      console.warn('Full response:', JSON.stringify(response, null, 2));
      
      // If response exists but no clear success indicator
      // Since we got a response (not an error), it might have succeeded
      // Ask user to verify by trying to use the PIN
      setError(`Response received but unclear if successful. Response: ${JSON.stringify(response)}. Please try to get balance with your PIN to verify if it was set. Check browser console (F12) for full details.`);
    } catch (err) {
      console.error('Set PIN error:', err);
      console.error('Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      
      let errorMessage = 'Failed to set PIN. ';
      
      if (err.response) {
        // Backend returned an error
        errorMessage = err.response.data?.message || 
                      err.response.data?.error || 
                      err.response.statusText || 
                      `Server error (${err.response.status})`;
        
        // Specific error messages
        if (err.response.status === 404) {
          errorMessage = `Wallet with ID ${walletId} not found. Please check your wallet ID.`;
        } else if (err.response.status === 400) {
          if (errorMessage.includes('already set') || errorMessage.includes('PIN already')) {
            errorMessage = 'PIN already set for this wallet. Use "Change PIN" option instead.';
          } else if (errorMessage.includes('Validation failed')) {
            errorMessage = 'PIN validation failed. PIN must be exactly 4 digits.';
          }
        }
      } else if (err.request) {
        errorMessage = 'Network error: Could not reach server. Please check if backend is running.';
      } else {
        errorMessage = err.message || 'An unexpected error occurred.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtpForChangePin = async () => {
    if (!walletId || walletId.trim() === '') {
      setError('Please enter wallet ID');
      return;
    }
    if (!/^\d+$/.test(walletId)) {
      setError('Wallet ID must be a valid number');
      return;
    }
    if (oldPin.length !== 4 || !/^\d+$/.test(oldPin)) {
      setError('Current PIN must be exactly 4 digits');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await requestOtpForChangePin(parseInt(walletId), { currentPin: oldPin });
      setOtpReceived(res.otp || ''); // Demo: backend returns OTP; in production would be sent via SMS
      setChangePinStep('otp');
      setSuccess(res.message || 'OTP generated. Enter it below (valid 5 min).');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to get OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePin = async () => {
    if (!walletId || walletId.trim() === '') {
      setError('Please enter wallet ID');
      return;
    }
    if (!/^\d+$/.test(walletId)) {
      setError('Wallet ID must be a valid number');
      return;
    }
    if (otpValue.length !== 6 || !/^\d+$/.test(otpValue)) {
      setError('OTP must be exactly 6 digits');
      return;
    }
    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      setError('New PIN must be exactly 4 digits');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await changePin(parseInt(walletId), { otp: otpValue, newPin });
      setSuccess('PIN changed successfully');
      setShowChangePinModal(false);
      setOldPin('');
      setNewPin('');
      setOtpValue('');
      setOtpReceived('');
      setChangePinStep('current');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to change PIN');
    } finally {
      setLoading(false);
    }
  };

  const closeChangePinModal = () => {
    setShowChangePinModal(false);
    setOldPin('');
    setNewPin('');
    setOtpValue('');
    setOtpReceived('');
    setChangePinStep('current');
  };

  const handleAddFunds = async () => {
    if (!walletId || walletId.trim() === '') {
      setError('Please enter wallet ID');
      return;
    }
    if (!/^\d+$/.test(walletId)) {
      setError('Wallet ID must be a valid number');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (!pin || pin.length !== 4) {
      setError('Please enter a valid 4-digit PIN');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await addFunds(parseInt(walletId), parseFloat(amount), pin);
      setSuccess(`Successfully added ₹${amount} to wallet`);
      setShowAddFundsModal(false);
      setAmount('');
      if (balance !== null) {
        setBalance(balance + parseFloat(amount));
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to add funds');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!walletId || walletId.trim() === '') {
      setError('Please enter wallet ID');
      return;
    }
    if (!/^\d+$/.test(walletId)) {
      setError('Wallet ID must be a valid number');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (!pin || pin.length !== 4) {
      setError('Please enter a valid 4-digit PIN');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await withdraw(parseInt(walletId), parseFloat(amount), pin);
      setSuccess(`Successfully withdrew ₹${amount} from wallet`);
      setShowWithdrawModal(false);
      setAmount('');
      if (balance !== null) {
        setBalance(balance - parseFloat(amount));
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to withdraw funds');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!transferData.fromWalletId || !transferData.toWalletId || !transferData.amount || !transferData.pin) {
      setError('Please fill all required fields');
      return;
    }
    if (!/^\d+$/.test(transferData.fromWalletId) || !/^\d+$/.test(transferData.toWalletId)) {
      setError('Wallet IDs must be valid numbers');
      return;
    }
    if (parseFloat(transferData.amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Backend expects: sourceWalletId, targetWalletId, amount, description, type, pin
      const transferPayload = {
        sourceWalletId: parseInt(transferData.fromWalletId),
        targetWalletId: parseInt(transferData.toWalletId),
        amount: parseFloat(transferData.amount),
        description: transferData.description || `Transfer from wallet ${transferData.fromWalletId} to wallet ${transferData.toWalletId}`,
        type: 'WALLET_TO_WALLET',
        pin: transferData.pin
      };
      await transfer(transferPayload);
      setSuccess(`Successfully transferred ₹${transferData.amount}`);
      setShowTransferModal(false);
      setTransferData({ fromWalletId: '', toWalletId: '', amount: '', description: '', pin: '' });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to transfer funds');
    } finally {
      setLoading(false);
    }
  };

  const handleGetHistory = async () => {
    if (!walletId || !pin) {
      setError('Please enter wallet ID and PIN');
      return;
    }
    if (!/^\d+$/.test(walletId)) {
      setError('Wallet ID must be a valid number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await getTransactionHistory(parseInt(walletId), pin);
      setTransactions(data || []);
      setSuccess('Transaction history loaded');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to get transaction history');
    } finally {
      setLoading(false);
    }
  };

  const WalletIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
    </svg>
  );

  return (
    <div className="page-container">
      <Container>
        <div className="page-header">
          <h1 className="page-title">
            <WalletIcon style={{ display: 'inline-block', marginRight: '15px', verticalAlign: 'middle' }} />
            Wallet Management
          </h1>
          <p className="page-subtitle">
            {user?.walletId ? (
              <>Your Wallet ID: <strong>{user.walletId}</strong></>
            ) : (
              'Manage your wallet, transactions, and funds'
            )}
          </p>
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
                <WalletIcon />
                Wallet Balance
              </Card.Header>
              <Card.Body className="card-body-custom">
              {walletId && (
                <div className="mb-3 p-2 bg-light rounded">
                  <small className="text-muted">Current Wallet ID: </small>
                  <strong>{walletId}</strong>
                  {user?.walletId && parseInt(walletId) === user.walletId && (
                    <span className="badge bg-success ms-2">Your Wallet</span>
                  )}
                </div>
              )}
              <Form.Group className="mb-3">
                <Form.Label>Wallet ID {!walletId && <span className="text-danger">*</span>}</Form.Label>
                <Form.Control
                  type="text"
                  value={walletId}
                  onChange={(e) => setWalletId(e.target.value)}
                  placeholder="Enter wallet ID (check Dashboard for your wallet ID)"
                />
                {!walletId && (
                  <Form.Text className="text-muted">
                    Go to Dashboard to see your wallet ID, or enter it manually.
                  </Form.Text>
                )}
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>PIN</Form.Label>
                <Form.Control
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter 4-digit PIN"
                  maxLength={4}
                  autoComplete="off"
                />
              </Form.Group>
              <Button onClick={handleGetBalance} disabled={loading} className="me-2">
                Get Balance
              </Button>
              {balance !== null && (
                <div className="mt-3">
                  <h4>Current Balance: ₹{balance}</h4>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

          <Col md={6}>
            <Card className="app-card">
              <Card.Header className="card-header-custom">PIN Management</Card.Header>
              <Card.Body className="card-body-custom">
              <Button onClick={() => setShowPinModal(true)} className="me-2 mb-2">
                Set PIN
              </Button>
              <Button onClick={() => setShowChangePinModal(true)} variant="secondary" className="mb-2">
                Change PIN
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

        <Row className="mt-4">
          <Col md={6}>
            <Card className="app-card">
              <Card.Header className="card-header-custom">Wallet Actions</Card.Header>
              <Card.Body className="card-body-custom">
              <Button onClick={() => setShowAddFundsModal(true)} className="me-2 mb-2">
                Add Funds
              </Button>
              <Button onClick={() => setShowWithdrawModal(true)} variant="warning" className="me-2 mb-2">
                Withdraw
              </Button>
              <Button onClick={() => setShowTransferModal(true)} variant="info" className="mb-2">
                Transfer
              </Button>
            </Card.Body>
          </Card>
        </Col>

          <Col md={6}>
            <Card className="app-card">
              <Card.Header className="card-header-custom">Transaction History</Card.Header>
              <Card.Body className="card-body-custom">
              <Button onClick={handleGetHistory} disabled={loading}>
                Load History
              </Button>
              {transactions.length > 0 && (
                <Table striped bordered hover className="mt-3">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx, idx) => (
                      <tr key={idx}>
                        <td>{tx.transactionType || tx.type || 'N/A'}</td>
                        <td>₹{tx.amount}</td>
                        <td>{tx.status || 'N/A'}</td>
                        <td>{tx.date ? new Date(tx.date).toLocaleString() : (tx.timestamp ? new Date(tx.timestamp).toLocaleString() : 'N/A')}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Set PIN Modal */}
      <Modal show={showPinModal} onHide={() => setShowPinModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Set PIN</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!walletId && (
            <Alert variant="warning" className="mb-3">
              <strong>Warning:</strong> Please enter your Wallet ID first. You can find it in your Dashboard profile.
            </Alert>
          )}
          <Form.Group>
            <Form.Label>Wallet ID <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              placeholder="Enter your wallet ID"
              required
            />
            {walletId && (
              <Form.Text className="text-muted">
                Setting PIN for wallet ID: <strong>{walletId}</strong>
              </Form.Text>
            )}
          </Form.Group>
          <Form.Group className="mt-3">
            <Form.Label>New PIN (4 digits) <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="password"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="Enter 4-digit PIN"
              maxLength={4}
              autoComplete="off"
              required
            />
            <Form.Text className="text-muted">
              PIN must be exactly 4 digits (e.g., 1234)
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPinModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSetPin} disabled={loading}>
            Set PIN
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Change PIN Modal (OTP flow: current PIN → Get OTP → OTP + new PIN) */}
      <Modal show={showChangePinModal} onHide={closeChangePinModal}>
        <Modal.Header closeButton>
          <Modal.Title>Change PIN</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Wallet ID</Form.Label>
            <Form.Control
              type="text"
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              readOnly={changePinStep === 'otp'}
            />
          </Form.Group>
          {changePinStep === 'current' && (
            <>
              <Form.Group className="mt-3">
                <Form.Label>Current PIN</Form.Label>
                <Form.Control
                  type="password"
                  value={oldPin}
                  onChange={(e) => setOldPin(e.target.value)}
                  placeholder="Enter current PIN (4 digits)"
                  maxLength={4}
                  autoComplete="off"
                />
              </Form.Group>
              <p className="small text-muted mt-2 mb-0">Next: We will send you an OTP to confirm the change.</p>
            </>
          )}
          {changePinStep === 'otp' && (
            <>
              {otpReceived && (
                <Alert variant="info" className="mt-3 small">
                  Your OTP: <strong>{otpReceived}</strong> (valid 5 min — demo only; in production sent via SMS)
                </Alert>
              )}
              <Form.Group className="mt-3">
                <Form.Label>OTP (6 digits)</Form.Label>
                <Form.Control
                  type="text"
                  inputMode="numeric"
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter OTP"
                  maxLength={6}
                  autoComplete="off"
                />
              </Form.Group>
              <Form.Group className="mt-3">
                <Form.Label>New PIN (4 digits)</Form.Label>
                <Form.Control
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="Enter new PIN"
                  maxLength={4}
                  autoComplete="off"
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeChangePinModal}>
            Cancel
          </Button>
          {changePinStep === 'current' ? (
            <Button variant="primary" onClick={handleRequestOtpForChangePin} disabled={loading}>
              Get OTP
            </Button>
          ) : (
            <Button variant="primary" onClick={handleChangePin} disabled={loading}>
              Change PIN
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Add Funds Modal */}
      <Modal show={showAddFundsModal} onHide={() => setShowAddFundsModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Funds</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Wallet ID</Form.Label>
            <Form.Control
              type="text"
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mt-3">
            <Form.Label>Amount</Form.Label>
            <Form.Control
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.01"
              step="0.01"
            />
          </Form.Group>
          <Form.Group className="mt-3">
            <Form.Label>PIN</Form.Label>
            <Form.Control
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={4}
              autoComplete="off"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddFundsModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddFunds} disabled={loading}>
            Add Funds
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Withdraw Modal */}
      <Modal show={showWithdrawModal} onHide={() => setShowWithdrawModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Withdraw Funds</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Wallet ID</Form.Label>
            <Form.Control
              type="text"
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mt-3">
            <Form.Label>Amount</Form.Label>
            <Form.Control
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.01"
              step="0.01"
            />
          </Form.Group>
          <Form.Group className="mt-3">
            <Form.Label>PIN</Form.Label>
            <Form.Control
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={4}
              autoComplete="off"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowWithdrawModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleWithdraw} disabled={loading}>
            Withdraw
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Transfer Modal */}
      <Modal show={showTransferModal} onHide={() => setShowTransferModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Transfer Funds</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>From Wallet ID</Form.Label>
            <Form.Control
              type="text"
              value={transferData.fromWalletId}
              onChange={(e) => setTransferData({ ...transferData, fromWalletId: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mt-3">
            <Form.Label>To Wallet ID</Form.Label>
            <Form.Control
              type="text"
              value={transferData.toWalletId}
              onChange={(e) => setTransferData({ ...transferData, toWalletId: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mt-3">
            <Form.Label>Amount</Form.Label>
            <Form.Control
              type="number"
              value={transferData.amount}
              onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
              min="0.01"
              step="0.01"
              placeholder="Enter amount"
            />
          </Form.Group>
          <Form.Group className="mt-3">
            <Form.Label>Description (Optional)</Form.Label>
            <Form.Control
              type="text"
              value={transferData.description}
              onChange={(e) => setTransferData({ ...transferData, description: e.target.value })}
              placeholder="Enter description (optional)"
              maxLength={200}
            />
          </Form.Group>
          <Form.Group className="mt-3">
            <Form.Label>PIN</Form.Label>
            <Form.Control
              type="password"
              value={transferData.pin}
              onChange={(e) => setTransferData({ ...transferData, pin: e.target.value })}
              placeholder="Enter 4-digit PIN"
              maxLength={4}
              autoComplete="off"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTransferModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleTransfer} disabled={loading}>
            Transfer
          </Button>
        </Modal.Footer>
      </Modal>
      </Container>
    </div>
  );
};

export default Wallet;
