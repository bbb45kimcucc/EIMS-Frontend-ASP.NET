import React, { useState, useEffect } from 'react';
import { Card, Typography, Table, Tag, Button, Space, message, Popconfirm, Input } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

export default function ApprovalCenter() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // STATE MỚI: Dùng để lưu từ khóa tìm kiếm
  const [searchText, setSearchText] = useState('');

  axios.defaults.withCredentials = true;

  // Lấy dữ liệu
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/ActionRequests');
      const realData = res.data.map(item => ({
        key: item.Id || item.id,
        id: item.Id || item.id,
        actionType: item.ActionType || item.actionType,
        content: item.Content || item.content,
        reason: item.Reason || item.reason,
        status: item.Status || item.status,
        createdBy: item.CreatedBy || item.createdBy,
        createdAt: item.CreatedAt || item.createdAt
      }));
      setRequests(realData);
    } catch (error) {
      message.error("Lỗi khi tải danh sách yêu cầu!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Xử lý Duyệt / Từ chối
  const handleAction = async (id, action) => {
    try {
      const url = `/api/ActionRequests/${action}/${id}`;
      await axios.post(url);
      message.success(action === 'approve' ? "Đã duyệt và thực thi thành công!" : "Đã từ chối yêu cầu!");
      fetchRequests(); // Load lại bảng
    } catch (error) {
      message.error("Lỗi khi xử lý yêu cầu!");
    }
  };

  // LOGIC TÌM KIẾM TỰ ĐỘNG (REAL-TIME)
  const filteredData = requests.filter((item) => {
    const lowerCaseSearch = searchText.toLowerCase();
    return (
      (item.content && item.content.toLowerCase().includes(lowerCaseSearch)) ||
      (item.createdBy && item.createdBy.toLowerCase().includes(lowerCaseSearch)) ||
      (item.reason && item.reason.toLowerCase().includes(lowerCaseSearch)) ||
      (item.actionType && item.actionType.toLowerCase().includes(lowerCaseSearch))
    );
  });

  const columns = [
    {
      title: 'Loại Yêu Cầu',
      dataIndex: 'actionType',
      render: text => {
        if (text === 'Delete_Customer') return <Text strong>🗑️ Xóa Khách hàng</Text>;
        if (text === 'Delete_Warehouse') return <Text strong>🗑️ Xóa Kho hàng</Text>;
        return <Text strong>{text}</Text>;
      }
    },
    {
      title: 'Mục Tiêu',
      dataIndex: 'content',
      render: text => <Text type="danger">{text}</Text>
    },
    {
      title: 'Lý Do Xin Xóa',
      dataIndex: 'reason',
      width: '25%',
      render: text => <i>{text}</i>
    },
    {
      title: 'Người Gửi',
      dataIndex: 'createdBy',
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      align: 'center',
      render: status => (
        <Tag color={status === 'Pending' ? 'warning' : status === 'Approved' ? 'success' : 'error'}>
          {status === 'Pending' ? 'Chờ duyệt' : status === 'Approved' ? 'Đã duyệt' : 'Từ chối'}
        </Tag>
      )
    },
    {
      title: 'Hành Động',
      align: 'center',
      render: (_, record) => (
        record.status === 'Pending' ? (
          <Space>
            <Popconfirm title="Chắc chắn DUYỆT xóa?" onConfirm={() => handleAction(record.id, 'approve')}>
              <Button type="primary" size="small" icon={<CheckOutlined />}>Duyệt</Button>
            </Popconfirm>
            <Popconfirm title="TỪ CHỐI yêu cầu này?" onConfirm={() => handleAction(record.id, 'reject')}>
              <Button danger size="small" icon={<CloseOutlined />}>Từ chối</Button>
            </Popconfirm>
          </Space>
        ) : (
          <Text type="secondary">Đã xử lý</Text>
        )
      )
    }
  ];

  return (
    <>
      <div style={{ marginBottom: '20px' }}>
        <Text type="secondary">Dashboard / Phê Duyệt</Text>
      </div>

      <Card style={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        {/* NÂNG CẤP GIAO DIỆN: Thêm thanh tìm kiếm nằm ngang hàng với Tiêu đề */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <Title level={4} style={{ margin: 0 }}>Trung Tâm Phê Duyệt Hệ Thống</Title>
            <Text type="secondary">Quản lý các yêu cầu xóa dữ liệu từ nhân viên.</Text>
          </div>
          
          <Space>
            <Input.Search 
              placeholder="Tìm tên, người gửi, lý do..." 
              allowClear 
              onChange={(e) => setSearchText(e.target.value)} // Gõ tới đâu lưu tới đó
              style={{ width: 280 }} 
            />
          </Space>
        </div>
        
        {/* ĐỔI DATA SOURCE THÀNH filteredData */}
        <Table 
          columns={columns} 
          dataSource={filteredData} 
          loading={loading} 
          pagination={{ pageSize: 8 }} 
        />
      </Card>
    </>
  );
}