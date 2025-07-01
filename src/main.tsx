
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Load Razorpay script for payments
const loadRazorpay = () => {
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.async = true;
  script.onload = () => {
    console.log('Razorpay script loaded successfully');
  };
  script.onerror = () => {
    console.error('Failed to load Razorpay script');
  };
  document.body.appendChild(script);
};

// Load Razorpay script on page load
loadRazorpay();

createRoot(document.getElementById("root")!).render(<App />);
