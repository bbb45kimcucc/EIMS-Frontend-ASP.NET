import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Table, Input, Space, Tag, message } from 'antd';
import { FilterOutlined, SwapOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

export default function Inventory() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Bật cái này để axios luôn gửi kèm Cookie Session
  axios.defaults.withCredentials = true;

  // 1. GỌI API LẤY DỮ LIỆU SẢN PHẨM (TỒN KHO)
  const fetchInventory = async (searchQuery = '') => {
    setLoading(true);
    try {
      // THÊM withCredentials vào đây
      const response = await axios.get('/api/Products', {
        withCredentials: true 
      });

      // FIX TẬN GỐC: Map lại từ PascalCase (C#) sang camelCase (JS)
      let realData = response.data.map(item => ({
        key: item.Id || item.id, // Dùng Id viết hoa nếu có
        sku: item.SKU || item.sku,
        name: item.Name || item.name,
        balance: item.CurrentStock || item.currentStock || item.Quantity || item.quantity || 0,
      }));

      // Tính năng tìm kiếm nội bộ
      if (searchQuery) {
        realData = realData.filter(item => 
          (item.sku?.toLowerCase().includes(searchQuery.toLowerCase())) || 
          (item.name?.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }

      setData(realData);
    } catch (error) {
      console.error(error);
      message.error("Lỗi khi tải dữ liệu Tồn kho! Kiểm tra quyền đăng nhập nha.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInventory(); }, []);

  const columns = [
    { 
      title: 'Mã SKU', 
      dataIndex: 'sku', 
      key: 'sku',
      render: text => <Tag color="blue">{text}</Tag>
    },
    { 
      title: 'Tên Sản Phẩm', 
      dataIndex: 'name', 
      key: 'name', 
      render: (text) => <strong>{text}</strong> 
    },
    { 
      title: 'Tồn Kho Hiện Tại', 
      dataIndex: 'balance', 
      key: 'balance',
      align: 'center',
      render: (val) => <strong style={{ fontSize: '16px', color: '#5570F1' }}>{val}</strong>
    },
    { 
      title: 'Trạng Thái', 
      key: 'status',
      align: 'center',
      render: (_, record) => {
        if (record.balance <= 0) return <Tag color="error">Hết Hàng</Tag>;
        if (record.balance < 10) return <Tag color="warning">Sắp Hết</Tag>;
        return <Tag color="success">Còn Hàng</Tag>;
      }
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'right',
      render: (_, record) => (
        <Button 
          type="link" 
          icon={<SwapOutlined />} 
          style={{ color: '#5570F1' }}
          onClick={() => {
            message.info(`Đang chuyển tới thẻ kho của ${record.sku}`);
            navigate('/stockcards');
          }}
        >
          Xem Thẻ Kho
        </Button>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: '20px' }}>
        <Text type="secondary">Dashboard / Inventory Management</Text>
      </div>

      <Card style={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <Title level={4} style={{ margin: 0 }}>Theo Dõi Tồn Kho (Stock Tracking)</Title>
          <Space>
            <Input.Search 
              placeholder="Mã SKU hoặc Tên..." 
              allowClear
              onSearch={(value) => fetchInventory(value)}
              style={{ width: 250 }} 
            />
            <Button icon={<FilterOutlined />}>Lọc</Button>
          </Space>
        </div>
        
        <Table 
          columns={columns} 
          dataSource={data} 
          pagination={{ pageSize: 8 }} 
          loading={loading}
          bordered={false}
        />
      </Card>
    </>
  );
}