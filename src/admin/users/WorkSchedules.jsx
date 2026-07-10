import React, { useState, useEffect } from 'react';
import { Card, Typography, Badge, Calendar, Button, message, Modal, Form, Select, DatePicker, Tooltip, Space } from 'antd';
import { PlusOutlined, SyncOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

// 1. IMPORT NÚT IMPORT EXCEL VÀO ĐÂY
import ExcelImportButton from './ExcelImportButton';

const { Title, Text } = Typography;
const { Option } = Select;

export default function WorkSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [users, setUsers] = useState([]);
  const [isWeekModalOpen, setIsWeekModalOpen] = useState(false);
  const [weekForm] = Form.useForm();
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [swapForm] = Form.useForm();

  const currentUser = JSON.parse(localStorage.getItem('user')) || {};
  const isAdmin = currentUser.Role === 'Admin' || currentUser.role === 'Admin';

  axios.defaults.withCredentials = true;

  const fetchData = async () => {
    try {
      const [resSchedules, resUsers] = await Promise.all([
        axios.get('/api/WorkSchedules'),
        axios.get('/api/Users')
      ]);
      setSchedules(resSchedules.data);
      setUsers(resUsers.data);
    } catch (error) {
      message.error("Lỗi tải dữ liệu lịch!");
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateWeekly = async (values) => {
    try {
      const startOfWeek = moment(values.week.toDate()).startOf('isoWeek');
      const promises = []; 
      for (let i = 0; i < 7; i++) {
        const currentDate = startOfWeek.clone().add(i, 'days');
        const isSunday = currentDate.day() === 0;
        const shiftName = isSunday ? "Chủ Nhật (08:00 - 16:00)" : "Ngày Thường (08:00 - 19:00)";
        const payload = {
          userId: values.userId,
          workDate: currentDate.format('YYYY-MM-DDTHH:mm:ss'),
          shiftType: shiftName,
          notes: "Lịch mặc định tuần"
        };
        promises.push(axios.post('/api/WorkSchedules', payload).catch(() => { }));
      }
      await Promise.all(promises);
      message.success("Đã sinh lịch tuần tự động thành công!");
      setIsWeekModalOpen(false);
      weekForm.resetFields();
      fetchData();
    } catch (error) {
      message.error("Có lỗi xảy ra khi tạo lịch tuần!");
    }
  };

  const openSwapModal = (scheduleItem) => {
    if (!isAdmin) return;
    setSelectedSchedule(scheduleItem);
    swapForm.setFieldsValue({
      oldUserName: scheduleItem.UserName || scheduleItem.userName,
      workDateStr: moment(scheduleItem.WorkDate || scheduleItem.workDate).format('DD/MM/YYYY'),
      shiftType: scheduleItem.ShiftType || scheduleItem.shiftType,
    });
    setIsSwapModalOpen(true);
  };

  const handleSwapSchedule = async (values) => {
    try {
      await axios.delete(`/api/WorkSchedules/${selectedSchedule.Id || selectedSchedule.id}`);
      const payload = {
        userId: values.newUserId,
        workDate: selectedSchedule.WorkDate || selectedSchedule.workDate,
        shiftType: selectedSchedule.ShiftType || selectedSchedule.shiftType,
        notes: "Đổi ca trực"
      };
      await axios.post('/api/WorkSchedules', payload);
      message.success("Đã thay đổi người trực thành công!");
      setIsSwapModalOpen(false);
      swapForm.resetFields();
      fetchData();
    } catch (error) {
      message.error("Lỗi khi đổi người trực!");
    }
  };

  const dateCellRender = (value) => {
    const listData = schedules.filter(s =>
      moment(s.WorkDate || s.workDate).format('YYYY-MM-DD') === value.format('YYYY-MM-DD')
    );
    return (
      <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
        {listData.map(item => {
          let color = (item.ShiftType || '').includes('Chủ Nhật') ? 'warning' : 'success';
          if (!isAdmin && item.UserId !== currentUser.Id && item.userId !== currentUser.id) return null;
          return (
            <li key={item.Id || item.id} style={{ marginBottom: '4px', cursor: isAdmin ? 'pointer' : 'default' }} onClick={() => openSwapModal(item)}>
              <Tooltip title={isAdmin ? "Click để đổi người trực" : ""}>
                <Badge status={color} text={<span style={{ fontSize: '11px', fontWeight: 'bold' }}>{item.UserName || item.userName}</span>} />
              </Tooltip>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div style={{ padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Text type="secondary">Dashboard / Lịch Làm Việc (Chấm Công)</Text>
        {isAdmin && (
          <Space>
            {/* 2. GỌI COMPONENT NÚT IMPORT Ở ĐÂY */}
            <ExcelImportButton onSuccess={fetchData} />

            <Button type="primary" icon={<PlusOutlined />} style={{ background: '#52c41a' }} onClick={() => setIsWeekModalOpen(true)}>
              Tạo Lịch Tuần Tự Động
            </Button>
          </Space>
        )}
      </div>

      <Card style={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <Title level={4} style={{ marginBottom: '20px' }}>Lịch Làm Việc</Title>
        <Calendar dateCellRender={dateCellRender} />
      </Card>

      {/* Modal giữ nguyên */}
      <Modal title="Tạo Lịch Mặc Định" open={isWeekModalOpen} onCancel={() => setIsWeekModalOpen(false)} onOk={() => weekForm.submit()} okText="Phát Sinh Lịch">
        <Form form={weekForm} layout="vertical" onFinish={handleCreateWeekly}>
          <Form.Item name="userId" label="Chọn Nhân Viên" rules={[{ required: true }]}>
            <Select showSearch placeholder="Chọn nhân viên">
              {users.map(u => <Option key={u.Id || u.id} value={u.Id || u.id}>{u.FullName || u.fullName}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="week" label="Chọn Tuần" rules={[{ required: true }]}>
            <DatePicker picker="week" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}