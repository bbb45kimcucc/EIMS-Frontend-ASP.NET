import React, { useState, useEffect } from 'react';
import { Card, Typography, message, Form } from 'antd';
import axios from 'axios';
import moment from 'moment';

// Import các component con đã tách
import ProductHeader from './ProductHeader';
import ProductTable from './ProductTable';
import ProductModal from './ProductModal';

const { Text } = Typography;

export default function Products() {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  
  // State tìm kiếm và lọc
  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState(null);
  const [filterBrand, setFilterBrand] = useState(null);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  // 1. TẢI DỮ LIỆU
  const fetchData = async () => {
    setLoading(true);
    try {
      const [resProducts, resCategories, resBrands, resUnits] = await Promise.all([
        axios.get('/api/Products'),
        axios.get('/api/Categories'),
        axios.get('/api/Brands'),
        axios.get('/api/Units'),
      ]);

      const realData = resProducts.data.map(item => ({
        ...item,
        key: item.Id || item.id,
        id: item.Id || item.id,
        sku: item.SKU || item.sku,
        name: item.Name || item.name,
        quantity: item.Quantity ?? item.quantity ?? item.CurrentStock ?? item.currentStock ?? 0, 
        averagePrice: item.AveragePrice || item.averagePrice,
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

  // 2. LOGIC TÌM KIẾM & LỌC NÂNG CAO (Đã sửa)
  const filteredData = data.filter((item) => {
    const lowerCaseSearch = searchText.toLowerCase();
    
    // Điều kiện 1: Tìm theo chữ (SKU, Tên, Danh mục)
    const matchSearch = 
      (item.name && item.name.toLowerCase().includes(lowerCaseSearch)) ||
      (item.sku && item.sku.toLowerCase().includes(lowerCaseSearch)) ||
      (item.categoryName && item.categoryName.toLowerCase().includes(lowerCaseSearch));

    // Điều kiện 2: Lọc theo Danh mục (nếu có chọn)
    const matchCategory = filterCategory ? item.categoryName === filterCategory : true;
    
    // Điều kiện 3: Lọc theo Thương hiệu (nếu có chọn)
    const matchBrand = filterBrand ? item.brandName === filterBrand : true;

    // Phải thỏa mãn cả 3 điều kiện thì mới hiển thị
    return matchSearch && matchCategory && matchBrand;
  });

  // 3. XỬ LÝ UPLOAD ẢNH
  const handleUploadImage = async (info) => {
    const formData = new FormData();
    formData.append('file', info.file);

    try {
      message.loading({ content: 'Đang tải ảnh lên mây...', key: 'upImg' });
      const res = await axios.post('/api/Products/upload-image', formData, {
        withCredentials: true
      });
      setImageUrl(res.data.url);
      message.success({ content: 'Ảnh đã lên mây thành công!', key: 'upImg' });
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
      const response = await axios.get('/api/Products/export-excel', {
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
      setImageUrl(record.avatar);
    } else {
      setEditingId(null);
      form.resetFields();
      setImageUrl("");
    }
    setIsModalVisible(true);
  };

  // 6. LƯU DỮ LIỆU
  const handleSave = async (values) => {
    const payload = { ...values, image: imageUrl };
    try {
      if (editingId) {
        await axios.put(`/api/Products/${editingId}`, { id: editingId, ...payload });
        message.success("Cập nhật thành công!");
      } else {
        await axios.post('/api/Products', payload);
        message.success("Thêm mới thành công!");
      }
      setIsModalVisible(false);
      fetchData();
    } catch (error) {
      message.error("Lỗi khi lưu! Kiểm tra Backend.");
    }
  };

  // 7. XÓA DỮ LIỆU
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/Products/${id}`);
      message.success("Đã xóa linh kiện!");
      fetchData();
    } catch (error) {
      message.error("Lỗi khi xóa!");
    }
  };

  return (
    <>
      <div style={{ marginBottom: '20px' }}>
        <Text type="secondary">Dashboard / Products</Text>
      </div>

      <Card style={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        {/* Đã cập nhật truyền props xuống ProductHeader */}
        <ProductHeader 
          onSearch={setSearchText} 
          onExport={exportExcel} 
          onAdd={() => showModal()} 
          categories={categories}
          brands={brands}
          onFilterCategory={setFilterCategory}
          onFilterBrand={setFilterBrand}
        />
        
        <ProductTable 
          dataSource={filteredData} 
          loading={loading} 
          onEdit={showModal} 
          onDelete={handleDelete} 
        />
      </Card>

      <ProductModal 
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSave={handleSave}
        form={form}
        editingId={editingId}
        imageUrl={imageUrl}
        setImageUrl={setImageUrl}
        handleUploadImage={handleUploadImage}
        categories={categories}
        brands={brands}
        units={units}
      />
    </>
  );
}