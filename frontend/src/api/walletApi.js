import http from './http';

export const getBalance = async (walletId, pin) => {
  const response = await http.get(`/api/v1/wallets/${walletId}/balance`, {
    params: { pin },
  });
  return response.data;
};

export const setPin = async (walletId, pinData) => {
  try {
    console.log('setPin API call - walletId:', walletId, 'pinData:', pinData);
    const response = await http.post(`/api/v1/wallets/${walletId}/set-pin`, pinData);
    console.log('setPin - Full axios response:', response);
    console.log('setPin - response.data:', response?.data);
    console.log('setPin - response.status:', response?.status);
    console.log('setPin - response.headers:', response?.headers);
    
    // Check if response exists
    if (!response) {
      console.error('setPin - response is null or undefined');
      throw new Error('No response received from server');
    }
    
    // Check if response.data exists
    if (response.data !== undefined && response.data !== null) {
      return response.data;
    } else {
      console.warn('setPin - response.data is undefined or null. Full response:', response);
      // If response exists but data is undefined, check status
      if (response.status === 200 || response.status === 201) {
        // HTTP 200/201 but no data - assume success
        console.log('setPin - Status 200/201 but no data, assuming success');
        return { message: 'PIN set successfully', success: true };
      }
      // If status is not 200/201, throw error
      throw new Error(`Unexpected response status: ${response.status}`);
    }
  } catch (error) {
    console.error('setPin API error:', error);
    console.error('setPin error response:', error?.response);
    console.error('setPin error message:', error?.message);
    
    // If error has response data, extract message
    if (error?.response?.data) {
      const errorData = error.response.data;
      // Create a proper error with response data
      const enhancedError = new Error(errorData.message || error.message || 'Failed to set PIN');
      enhancedError.response = error.response;
      throw enhancedError;
    }
    
    // Re-throw original error
    throw error;
  }
};

export const verifyPin = async (walletId, pinData) => {
  const response = await http.post(`/api/v1/wallets/${walletId}/verify-pin`, pinData);
  return response.data;
};

/** Request OTP for change PIN. Body: { currentPin }. Returns { message, success, otp } (otp for demo only). */
export const requestOtpForChangePin = async (walletId, body) => {
  const response = await http.post(`/api/v1/wallets/${walletId}/change-pin/request-otp`, body);
  return response.data;
};

/** Change PIN using OTP. Body: { otp, newPin }. */
export const changePin = async (walletId, pinData) => {
  const response = await http.put(`/api/v1/wallets/${walletId}/change-pin`, pinData);
  return response.data;
};

export const addFunds = async (walletId, amount, pin) => {
  const response = await http.post(`/api/v1/wallets/${walletId}/add-funds`, null, {
    params: { amount, pin },
  });
  return response.data;
};

export const withdraw = async (walletId, amount, pin) => {
  const response = await http.post(`/api/v1/wallets/${walletId}/withdraw`, null, {
    params: { amount, pin },
  });
  return response.data;
};

export const transfer = async (transferData) => {
  const response = await http.post('/api/v1/wallets/transfer', transferData);
  return response.data;
};

export const getTransactionHistory = async (walletId, pin) => {
  const response = await http.get(`/api/v1/wallets/${walletId}/history`, {
    params: { pin },
  });
  return response.data;
};

/** Dashboard summary (monthly spending, category-wise, top receivers). No PIN; wallet from JWT. */
export const getDashboardSummary = async () => {
  const response = await http.get('/api/v1/wallets/dashboard-summary');
  return response.data;
};
