import React from 'react';
import { PaymentRequestForm } from './components/PaymentRequestForm';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Hệ thống quản lý thanh toán</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 animate-fadeIn">
        <PaymentRequestForm />
      </main>
      <footer className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
        © 2025 Hệ thống quản lý thanh toán. Mọi quyền được bảo lưu.
      </footer>
    </div>
  );
}

export default App;