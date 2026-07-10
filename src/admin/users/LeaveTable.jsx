import React from 'react';
import { Table, Tag, Button, Space } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

export default function LeaveTable({ data, loading, currentUser, onUpdateStatus }) {

  const columns = [
    {
      title: 'Nhân viên',
      dataIndex: 'user',
      key: 'user',
      render: (user) => <b>{user?.fullName || 'Chưa rõ'}</b>,
    },
    {
      title: 'Phòng ban',
      dataIndex: 'user',
      key: 'department',
      render: (user) => <span className="text-gray-500">{user?.department || 'Kỹ thuật'}</span>,
    },
    {
      title: 'Thời gian nghỉ',
      key: 'time',
      render: (_, record) => (
        <span>
          {new Date(record.startDate).toLocaleDateString('vi-VN')} <br/> 
          <span className="text-gray-400">đến</span> <br/> 
          {new Date(record.endDate).toLocaleDateString('vi-VN')}
        </span>
      ),
    },
    {
      title: 'Loại nghỉ phép',
      dataIndex: 'isUnpaid',
      key: 'isUnpaid',
      render: (isUnpaid) => isUnpaid ? <Tag color="orange">Nghỉ không lương</Tag> : <Tag color="green">Nghỉ phép năm</Tag>,
    },
    {
      title: 'Lý do xin nghỉ',
      dataIndex: 'reason',
      key: 'reason',
      width: '25%',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'gold';
        if (status === 'Approved') color = 'green';
        if (status === 'Rejected') color = 'red';
        return <Tag color={color} className="uppercase font-bold">{status === 'Pending' ? 'Chờ duyệt' : status}</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => {
        // Chỉ Admin mới thấy nút duyệt, và chỉ hiển thị khi đơn đang "Pending"
        const isAdmin = currentUser.Role === 'Admin' || currentUser.role === 'Admin';
        
        if (isAdmin && record.status === 'Pending') {
          return (
            <Space size="small">
              <Button 
                type="primary" 
                size="small"
                icon={<CheckCircleOutlined />} 
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                onClick={() => onUpdateStatus(record.id, 'Approved')}
              >
                Duyệt
              </Button>
              <Button 
                type="primary" 
                danger 
                size="small"
                icon={<CloseCircleOutlined />} 
                onClick={() => onUpdateStatus(record.id, 'Rejected')}
              >
                Từ chối
              </Button>
            </Space>
          );
        }
        return <span className="text-gray-400 italic">Không có thao tác</span>;
      },
    },
  ];

  return (
    <Table 
      columns={columns} 
      dataSource={data} 
      rowKey="id" 
      loading={loading}
      pagination={{ pageSize: 5 }}
      bordered={false}
    />
  );
}