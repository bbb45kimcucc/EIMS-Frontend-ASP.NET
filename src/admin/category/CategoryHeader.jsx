import React from 'react';
import { Typography, Space, Input, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function CategoryHeader({ onSearch, onAdd }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
      <Title level={4} style={{ margin: 0 }}>Categories List</Title>
      <Space>
        {/* Đã thêm thanh tìm kiếm */}
        <Input.Search
          placeholder="Tìm tên danh mục..."
          allowClear
          onChange={(e) => onSearch(e.target.value)}
          style={{ width: 250 }}
        />
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          style={{ background: '#5570F1' }} 
          onClick={onAdd}
        >
          Add Category
        </Button>
      </Space>
    </div>
  );
}