import React from 'react';
import { Table, Space, Button, Popconfirm, Tag } from 'antd'; // Nhớ import thêm Tag
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

export default function BrandTable({ dataSource, loading, onEdit, onDelete }) {
  const columns = [
    { 
      title: 'ID', 
      dataIndex: 'id', 
      width: '10%',
      sorter: (a, b) => a.id - b.id 
    },
    { 
      title: 'Brand Name', 
      dataIndex: 'name', 
      width: '30%', 
      sorter: (a, b) => a.name.localeCompare(b.name), 
      render: text => <strong style={{ color: '#1890ff' }}>{text}</strong> 
    },
    // ---> THÊM CỘT SỐ LƯỢNG SẢN PHẨM Ở ĐÂY <---
    {
      title: 'Số lượng SP',
      align: 'center',
      width: '15%',
      render: (_, record) => {
        const count = record.ProductCount || record.productCount || 0;
        return (
          <Tag color={count > 0 ? 'blue' : 'default'}>
            {count} sản phẩm
          </Tag>
        );
      }
    },
    // ------------------------------------------
    { 
      title: 'Description', 
      dataIndex: 'description' 
    },
    {
      title: 'Action',
      width: '20%',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            style={{ color: '#5570F1' }} 
            onClick={() => onEdit(record)} 
          />
          <Popconfirm 
            title="Xóa thương hiệu này?" 
            description="Hành động này không thể hoàn tác."
            onConfirm={() => onDelete(record.id)} 
            okText="Xóa" 
            cancelText="Hủy"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <style>{`
        .custom-hover-table .ant-table-tbody > tr.ant-table-row:hover > td,
        .custom-hover-table .ant-table-tbody > tr:hover > td {
          background-color: #f0f5ff !important; 
          transition: background-color 0.3s ease;
        }
        .custom-hover-table .ant-table-tbody > tr.ant-table-row {
          cursor: pointer; 
        }
      `}</style>
      
      <Table 
        className="custom-hover-table"
        columns={columns} 
        dataSource={dataSource} 
        pagination={{ pageSize: 7 }} 
        loading={loading} 
      />
    </>
  );
}