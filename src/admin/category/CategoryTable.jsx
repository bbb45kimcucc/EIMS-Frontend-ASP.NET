import React from 'react';
import { Table, Space, Button, Popconfirm, Tag } from 'antd'; // THÊM import Tag ở đây
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

export default function CategoryTable({ dataSource, loading, onEdit, onDelete }) {
  const columns = [
    { title: 'ID', dataIndex: 'id', width: '10%' },
    { 
      title: 'Category Name', 
      dataIndex: 'name', 
      width: '30%',
      sorter: (a, b) => a.name.localeCompare(b.name), 
      render: text => <strong>{text}</strong> 
    },
    // ---> ĐÂY LÀ CỘT MỚI THÊM VÀO <---
    {
      title: 'Số lượng SP',
      align: 'center',
      width: '15%',
      // Dùng render bắt cả 2 trường hợp chữ hoa chữ thường từ Backend trả về
      render: (_, record) => {
        const count = record.ProductCount || record.productCount || 0;
        return (
          <Tag color={count > 0 ? 'blue' : 'default'}>
            {count} sản phẩm
          </Tag>
        );
      }
    },
    // ---------------------------------
    { title: 'Description', dataIndex: 'description' },
    {
      title: 'Action',
      width: '20%',
      render: (_, record) => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined />} style={{ color: '#5570F1' }} onClick={() => onEdit(record)} />
          <Popconfirm title="Bạn có chắc muốn xóa danh mục này?" onConfirm={() => onDelete(record.id)} okText="Xóa" cancelText="Hủy">
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
        pagination={{ pageSize: 5 }} 
        loading={loading} 
      />
    </>
  );
}