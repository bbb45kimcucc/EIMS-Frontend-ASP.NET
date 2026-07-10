import React from 'react';
import { Table, Image, Tag, Typography, Space, Button, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Text } = Typography;

export default function ProductTable({ dataSource, loading, onEdit, onDelete }) {
  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'avatar',
      width: '10%',
      render: (img) => img ? <Image width={50} height={50} src={img} style={{ borderRadius: '8px', objectFit: 'cover' }} /> : <Tag>No Image</Tag>
    },
    { title: 'SKU', dataIndex: 'sku', width: '10%' },
    { title: 'Tên Linh Kiện', dataIndex: 'name', width: '25%', render: text => <strong>{text}</strong> },
    { title: 'Danh mục', dataIndex: 'categoryName', width: '15%' },
    {
      title: 'Giá bán',
      dataIndex: 'averagePrice',
      width: '12%',
      render: (price) => <Text type="danger">{(price || 0).toLocaleString()} đ</Text>
    },
    {
      title: 'Tồn kho',
      dataIndex: 'quantity',
      width: '10%',
      render: (qty) => <Tag color={qty > 5 ? 'success' : 'error'}>{qty}</Tag>
    },
    {
      title: 'Hành động',
      width: '12%',
      render: (_, record) => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined />} style={{ color: '#5570F1' }} onClick={() => onEdit(record)} />
          <Popconfirm title="Xóa linh kiện này?" onConfirm={() => onDelete(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      {/* KHAI BÁO CSS TRỰC TIẾP TẠI ĐÂY */}
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
        className="custom-hover-table" /* Gọi class CSS vừa tạo ở trên */
        columns={columns} 
        dataSource={dataSource} 
        pagination={{ pageSize: 8 }} 
        loading={loading} 
      />
    </>
  );
}