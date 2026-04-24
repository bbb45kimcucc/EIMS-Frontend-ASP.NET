import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; 

import MainLayout from './admin/layout/MainLayout';
import Dashboard from './admin/dashboard/Dashboard';
import Orders from './admin/orders/Orders';
import Categories from './admin/category/Categories';
import Products from './admin/products/Products';
import Inventory from './admin/inventory/Inventory';
import Customers from './admin/customer/Customers';
import Users from './admin/users/User';
import Suppliers from './admin/suppliers/Suppliers';
import Warehouses from './admin/warehouse/Warehouse';
import InventoryTickets from './admin/inventory/InventoryTickets'; 
import StockCards from './admin/inventory/StockCards';
import Login from './admin/auth/Login';
import Brands from './admin/brand/Brands';
import ApprovalCenter from './admin/approvals/ApprovalCenter';
import SalesOrder from './admin/customer/SalesOrder';

// 1. NÂNG CẤP COMPONENT BẢO VỆ ROUTE
const ProtectedRoute = ({ children, allowedRoles }) => {
    const userStr = localStorage.getItem('user');
    
    // Bước 1: Kiểm tra xem đã đăng nhập chưa
    if (!userStr) {
        return <Navigate to="/login" replace />;
    }
    
    const user = JSON.parse(userStr);
    const userRole = user?.Role || user?.role; // Chấp nhận cả Role (C#) hoặc role (JS)

    // Bước 2: Kiểm tra quyền truy cập (nếu trang đó có yêu cầu quyền cụ thể)
    if (allowedRoles && !allowedRoles.includes(userRole)) {
        // Nếu không đủ quyền, đá về trang chủ Dashboard
        return <Navigate to="/" replace />;
    }
    
    return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Trang Login không cần bảo vệ */}
        <Route path="/login" element={<Login />} />

        {/* Layout chính được bảo vệ: Phải login mới thấy được thanh Menu */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="categories" element={<Categories />} />
          <Route path="products" element={<Products />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="customers" element={<Customers />} />
                    <Route path="salesorders" element={<SalesOrder />} />

          <Route path="suppliers" element={<Suppliers />} />
          <Route path="tickets" element={<InventoryTickets />} />
          <Route path="stockcards" element={<StockCards />} />
          <Route path="brands" element={<Brands />} />

          {/* --- CÁC TRANG CHỈ ADMIN MỚI ĐƯỢC VÀO --- */}
          <Route 
            path="users" 
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <Users />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="warehouses" 
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <Warehouses />
              </ProtectedRoute>
            } 
          />
          
          {/* ĐÂY NÈ: TÁCH RIÊNG TRANG PHÊ DUYỆT RA THÀNH 1 ROUTE MỚI */}
          <Route 
            path="approvals" 
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <ApprovalCenter />
              </ProtectedRoute>
            } 
          />

        </Route>

        {/* Nếu gõ link bậy bạ không tồn tại -> Về trang chủ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;