import React, { useState, useEffect } from 'react';
import { Card, Typography, message } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Import các component con
import InventoryHeader from './InventoryHeader';
import InventoryTable from './InventoryTable';

const { Text } = Typography;

export default function Inventory() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  axios.defaults.withCredentials = true;

  const fetchInventory = async (searchQuery = '') => {
    setLoading(true);
    try {
      // ĐỔI LINK TỪ /api/Products SANG API SO SÁNH KHO NÀY:
      const response = await axios.get('/api/Products/inventory-comparison', {
        withCredentials: true 
      });

      // Lấy data mới theo đúng DTO của API
      let realData = response.data.map((item, index) => ({
        key: index, // hoặc item.sku nếu SKU là duy nhất
        sku: item.SKU || item.sku,
        name: item.ProductName || item.productName,
        // Phương án 1
        storedStock: item.StoredStock || item.storedStock || 0,
        // Phương án 2
        calculatedStock: item.CalculatedStock || item.calculatedStock || 0,
      }));

      // Logic Search giữ nguyên
      if (searchQuery) {
        realData = realData.filter(item => 
          (item.sku?.toLowerCase().includes(searchQuery.toLowerCase())) || 
          (item.name?.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }

      setData(realData);
    } catch (error) {
      console.error(error);
      message.error("Lỗi khi tải dữ liệu Tồn kho! Kiểm tra quyền đăng nhập hoặc Backend nha.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInventory(); }, []);

  const handleNavigate = (sku) => {
    message.info(`Đang trích xuất thẻ kho của ${sku}...`);
    navigate(`/stockcards?sku=${sku}`);
  };

  return (
    <>
      <div style={{ marginBottom: '20px' }}>
        <Text type="secondary">Dashboard / Kho Nâng Cao (So Sánh)</Text>
      </div>

      <Card style={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <InventoryHeader onSearch={(value) => fetchInventory(value)} />
        <InventoryTable 
          dataSource={data} 
          loading={loading} 
          onNavigate={handleNavigate} 
        />
      </Card>
    </>
  );
}