import axios from 'axios';

const API = axios.create({
  baseURL: 'https://contact-manager-backend-1-jle9.onrender.com',
});

export default API;
