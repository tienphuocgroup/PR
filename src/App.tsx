import React, { useEffect, useState } from 'react';
import { PaymentRequestForm } from './components/PaymentRequestForm';

function App() {
  const sampleData = [
    {
      description: "OpenAI ChatGPT Subscription ngày 25-APR-25",
      quantity: 1,
      unit_price: 121.89,
      currency: "USD",
      amount: 3180107
    },
    {
      description: "Phí giao dịch nước ngoài (OpenAI)",
      quantity: 1,
      unit_price: 34981,
      currency: "VND",
      amount: 34981
    }
  ];

  const [initialData, setInitialData] = useState([]);

  useEffect(() => {
    setInitialData(sampleData);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Hệ thống quản lý thanh toán</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 animate-fadeIn">
        <PaymentRequestForm initialData={initialData} />
      </main>
      <footer className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
        © 2025 Hệ thống quản lý thanh toán. Mọi quyền được bảo lưu.
      </footer>
    </div>
  );
}

export default App;