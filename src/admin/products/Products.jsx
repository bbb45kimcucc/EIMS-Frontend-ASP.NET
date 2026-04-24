import React, { useState, useEffect } from 'react';
// THÊM: Row và Col vào danh sách import từ 'antd'
import {
  Card, Typography, Button, Table, Input, Space, Tag, message,
  Modal, Form, Popconfirm, Select, InputNumber, Upload, Image,
  Row, Col
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined
} from '@ant-design/icons';
import axios from 'axios';
// THÊM: import thư viện moment
import moment from 'moment';

const { Title, Text } = Typography;
const { Option } = Select;

export default function Products() {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);

  // DÙNG 1 BIẾN DUY NHẤT ĐỂ QUẢN LÝ ẢNH
  const [imageUrl, setImageUrl] = useState("");

  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  // 1. TẢI DỮ LIỆU
  const fetchData = async () => {
    setLoading(true);
    try {
      const [resProducts, resCategories, resBrands, resUnits] = await Promise.all([
        axios.get('https://localhost:7033/api/Products'),
        axios.get('https://localhost:7033/api/Categories'),
        axios.get('https://localhost:7033/api/Brands'),
        axios.get('https://localhost:7033/api/Units'),
      ]);

      const realData = resProducts.data.map(item => ({
        ...item,
        key: item.Id || item.id,
        id: item.Id || item.id,
        sku: item.SKU || item.sku,
        name: item.Name || item.name,
        quantity: item.Quantity ?? item.quantity ?? item.CurrentStock ?? item.currentStock ?? 0, averagePrice: item.AveragePrice || item.averagePrice,
        categoryName: item.Category?.Name || item.category?.name || 'Chưa phân loại',
        brandName: item.Brand?.Name || item.brand?.name || '---',
        unitName: item.Unit?.Name || item.unit?.name || '---',
        avatar: item.image || item.Image ||
          (item.images && item.images[0]?.imageUrl) ||
          (item.images && item.images[0]?.ImageUrl) ||
          (item.Images && item.Images[0]?.imageUrl) ||
          (item.Images && item.Images[0]?.ImageUrl) || null,
      }));

      setData(realData);
      setCategories(resCategories.data);
      setBrands(resBrands.data);
      setUnits(resUnits.data);
    } catch (error) {
      console.error(error);
      message.error("Lỗi khi tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // 2. LOGIC TÌM KIẾM
  const filteredData = data.filter((item) => {
    const lowerCaseSearch = searchText.toLowerCase();
    return (
      (item.name && item.name.toLowerCase().includes(lowerCaseSearch)) ||
      (item.sku && item.sku.toLowerCase().includes(lowerCaseSearch)) ||
      (item.categoryName && item.categoryName.toLowerCase().includes(lowerCaseSearch))
    );
  });

  // 3. XỬ LÝ UPLOAD ẢNH LÊN CLOUDINARY QUA BACKEND
  const handleUploadImage = async (info) => {
    const formData = new FormData();

    // SỬA CHỖ NÀY: Thay info.file.originFileObj thành info.file
    formData.append('file', info.file);

    try {
      message.loading({ content: 'Đang tải ảnh lên mây...', key: 'upImg' });

      // Lưu ý: Cúc nên bỏ hẳn cái headers: { 'Content-Type': 'multipart/form-data' }
      // Để Axios và Trình duyệt tự xử lý cái boundary của file thì sẽ mượt hơn.
      const res = await axios.post('https://localhost:7033/api/Products/upload-image', formData, {
        withCredentials: true
      });

      setImageUrl(res.data.url);
      message.success({ content: 'Ảnh đã lên mây thành công!', key: 'upImg' });

      // Gọi onSuccess để Ant Design biết là đã tải xong
      if (info.onSuccess) info.onSuccess(res.data);

    } catch (error) {
      console.error("Lỗi chi tiết:", error.response?.data);
      message.error({ content: 'Lỗi upload ảnh!', key: 'upImg' });
      if (info.onError) info.onError(error);
    }
  };

  // 4. XUẤT EXCEL
  const exportExcel = async () => {
    try {
      message.loading({ content: 'Đang tạo file Excel...', key: 'export' });
      const response = await axios.get('https://localhost:7033/api/Products/export-excel', {
        responseType: 'blob',
        withCredentials: true
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `BaoCaoTonKho_${moment().format('DDMMYYYY')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      message.success({ content: 'Đã xuất file thành công!', key: 'export', duration: 2 });
    } catch (error) {
      message.error({ content: 'Lỗi khi xuất file Excel!', key: 'export' });
    }
  };

  // 5. MỞ MODAL THÊM/SỬA
  const showModal = (record = null) => {
    if (record) {
      setEditingId(record.id);
      form.setFieldsValue(record);
      setImageUrl(record.avatar); // Hiện lại ảnh cũ khi Sửa
    } else {
      setEditingId(null);
      form.resetFields();
      setImageUrl(""); // Xóa trắng ảnh khi Thêm mới
    }
    setIsModalVisible(true);
  };

  // 6. LƯU DỮ LIỆU (ADD / EDIT)
  const handleSave = async (values) => {
    const payload = {
      ...values,
      image: imageUrl // Gửi link ảnh đã upload thành công
    };

    try {
      if (editingId) {
        await axios.put(`https://localhost:7033/api/Products/${editingId}`, { id: editingId, ...payload });
        message.success("Cập nhật thành công!");
      } else {
        await axios.post('https://localhost:7033/api/Products', payload);
        message.success("Thêm mới thành công!");
      }
      setIsModalVisible(false);
      fetchData();
    } catch (error) {
      message.error("Lỗi khi lưu! Kiểm tra Backend.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://localhost:7033/api/Products/${id}`);
      message.success("Đã xóa linh kiện!");
      fetchData();
    } catch (error) {
      message.error("Lỗi khi xóa!");
    }
  };

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
          <Button type="text" icon={<EditOutlined />} style={{ color: '#5570F1' }} onClick={() => showModal(record)} />
          <Popconfirm title="Xóa linh kiện này?" onConfirm={() => handleDelete(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: '20px' }}>
        <Text type="secondary">Dashboard / Products</Text>
      </div>

      <Card style={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <Title level={4} style={{ margin: 0 }}>Kho Linh Kiện</Title>
          <Space>
            <Input.Search
              placeholder="Tìm theo mã SKU, tên..."
              allowClear
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250 }}
            />
            <Button
              icon={<DownloadOutlined />}
              onClick={exportExcel}
              style={{ borderColor: '#237804', color: '#237804' }}
            >
              Xuất Excel
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()} style={{ background: '#5570F1' }}>
              Thêm Linh Kiện
            </Button>
          </Space>
        </div>

        <Table columns={columns} dataSource={filteredData} pagination={{ pageSize: 8 }} loading={loading} />
      </Card>

      <Modal
        title={editingId ? "Cập Nhật Linh Kiện" : "Thêm Linh Kiện Mới"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        okText="Lưu lại" cancelText="Hủy"
        width={750}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item label="Ảnh minh họa">
            <Upload
              listType="picture-card"
              showUploadList={false}
              customRequest={handleUploadImage}
            >
              {imageUrl ? (
                <img src={imageUrl} alt="Linh kiện" style={{ width: '100%', borderRadius: '8px' }} />
              ) : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                </div>
              )}
            </Upload>
            {imageUrl && <Button type="link" onClick={() => setImageUrl("")} danger>Xóa ảnh</Button>}
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="sku" label="Mã SKU" rules={[{ required: true, message: 'Không được bỏ trống!' }]}>
                <Input placeholder="VD: MCU-001" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item name="name" label="Tên linh kiện" rules={[{ required: true, message: 'Không được bỏ trống!' }]}>
                <Input placeholder="VD: Arduino Uno R3" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="categoryId" label="Danh mục">
                <Select placeholder="Chọn danh mục">
                  {categories.map(c => <Option key={c.id || c.Id} value={c.id || c.Id}>{c.name || c.Name}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="brandId" label="Thương hiệu">
                <Select placeholder="Chọn hãng">
                  {brands.map(b => <Option key={b.id || b.Id} value={b.id || b.Id}>{b.name || b.Name}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="unitId" label="Đơn vị tính">
                <Select placeholder="Chọn ĐVT">
                  {units.map(u => <Option key={u.id || u.Id} value={u.id || u.Id}>{u.name || u.Name}</Option>)}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="averagePrice" label="Giá bán ước tính (VNĐ)">
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Tồn kho hiện tại" tooltip="Số lượng này sẽ tự động thay đổi khi bạn nhập/xuất kho">
                <InputNumber value={form.getFieldValue('quantity')} disabled style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
}