import React from 'react';
import { Typography, Space, Input, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function SupplierHeader({ onSearch, onAdd }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
      <Title level={4} style={{ margin: 0 }}>Quản Lý Nhà Cung Cấp</Title>
      <Space>
        <Input.Search
          placeholder="Tìm tên, SĐT, Email..."
          allowClear
          onSearch={onSearch}
          style={{ width: 250, borderRadius: '8px' }}
        />
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          style={{ background: '#5570F1', borderRadius: '8px' }} 
          onClick={onAdd}
        >
          Add Supplier
        </Button>
      </Space>
    </div>
  );
}