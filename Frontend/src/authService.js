import axios from "axios";

const API_URL = "http://localhost:5000/api/users";

export const signup = async (data) => {
  const res = await axios.post(`${API_URL}/signup`, data);
  return res.data;
};

export const verifyOtp = async (data) => {
  const res = await axios.post(`${API_URL}/verify-otp`, data);
  return res.data;
};

export const login = async (data) => {
  const res = await axios.post(`${API_URL}/login`, data);
  return res.data;
};
