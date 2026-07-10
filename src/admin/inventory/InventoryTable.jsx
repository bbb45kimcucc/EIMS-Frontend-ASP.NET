import React from 'react';
import { Table, Tag, Button, Tooltip } from 'antd';
import { SwapOutlined, WarningOutlined } from '@ant-design/icons';

export default function InventoryTable({ dataSource, loading, onNavigate }) {
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
      // CỘT 1: Cách Bình Thường
      title: 'Tồn Kho (Cách 1 - DB)', 
      dataIndex: 'storedStock', 
      key: 'storedStock',
      align: 'center',
      render: (val) => <strong style={{ fontSize: '16px', color: '#8c8c8c' }}>{val}</strong>
    },
    { 
      // CỘT 2: Cách Nâng Cao
      title: 'Tồn Kho (Cách 2 - Truy vấn)', 
      dataIndex: 'calculatedStock', 
      key: 'calculatedStock',
      align: 'center',
      render: (val) => <strong style={{ fontSize: '16px', color: '#5570F1' }}>{val}</strong>
    },
    { 
      // CỘT TRẠNG THÁI: So sánh tự động
      title: 'Đối Chiếu', 
      key: 'status',
      align: 'center',
      render: (_, record) => {
        const isMatch = record.storedStock === record.calculatedStock;
        
        if (isMatch) {
          return <Tag color="success">Khớp Dữ Liệu</Tag>;
        }
        
        // Nếu lệch, tính xem chênh bao nhiêu
        const diff = record.storedStock - record.calculatedStock;
        return (
          <Tooltip title={`Lệch ${Math.abs(diff)} sản phẩm`}>
            <Tag color="error" icon={<WarningOutlined />}>Lệch Kho</Tag>
          </Tooltip>
        );
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
          onClick={() => onNavigate(record.sku)}
        >
          Xem Thẻ Kho
        </Button>
      ),
    },
  ];

  return (
    <Table 
      columns={columns} 
      dataSource={dataSource} 
      pagination={{ pageSize: 8 }} 
      loading={loading}
      bordered={false}
    />
  );
}