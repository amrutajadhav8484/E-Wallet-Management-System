import http from './http';

export const addBeneficiary = async (walletId, beneficiaryData) => {
  const response = await http.post(`/api/v1/beneficiaries/${walletId}`, beneficiaryData);
  return response.data;
};

export const getBeneficiaries = async (walletId) => {
  const response = await http.get(`/api/v1/beneficiaries/${walletId}`);
  return response.data;
};

export const deleteBeneficiary = async (beneficiaryId) => {
  const response = await http.delete(`/api/v1/beneficiaries/${beneficiaryId}`);
  return response.data;
};

export const transferToBeneficiary = async (beneficiaryId, sourceWalletId, { amount, pin }) => {
  const response = await http.post(
    `/api/v1/beneficiaries/${beneficiaryId}/transfer`,
    { amount, pin },
    { params: { sourceWalletId } }
  );
  return response.data;
};
