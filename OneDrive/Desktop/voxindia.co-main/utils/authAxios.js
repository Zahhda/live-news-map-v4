// utils/authAxios.js
import axios from 'axios';

const authAxios = () => {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('user_token') : null;

  return axios.create({
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
};

export default authAxios;
