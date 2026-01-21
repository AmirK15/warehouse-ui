import React, { useState, useEffect } from 'react';
import { Plus, Package, ArrowDownCircle, ArrowUpCircle, Search, Trash2, Edit, RefreshCw, AlertCircle } from 'lucide-react';

const API_URL = 'https://warehouse-api-h6u3.onrender.com/api';

const WarehouseManagementSystem = () => {
    // Состояние данных
    const [products, setProducts] = useState([]);
    const [operations, setOperations] = useState([]);
    const [categories, setCategories] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Состояние интерфейса
    const [activeTab, setActiveTab] = useState('products');
    const [showProductModal, setShowProductModal] = useState(false);
    const [showOperationModal, setShowOperationModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingProduct, setEditingProduct] = useState(null);

    // Формы
    const [productForm, setProductForm] = useState({
        name: '', category_id: '', quantity: 0, unit: 'шт', price: 0, min_quantity: 10
    });

    const [operationForm, setOperationForm] = useState({
        product_id: '', operation_code: 'in', quantity: 0, note: ''
    });

    // ==================== API ЗАПРОСЫ ====================

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/products`);
            if (!response.ok) throw new Error('Ошибка загрузки товаров');
            const data = await response.json();
            setProducts(data);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error('Ошибка:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchOperations = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/operations`);
            if (!response.ok) throw new Error('Ошибка загрузки операций');
            const data = await response.json();
            setOperations(data);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error('Ошибка:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${API_URL}/categories`);
            if (!response.ok) throw new Error('Ошибка загрузки категорий');
            const data = await response.json();
            setCategories(data);
        } catch (err) {
            console.error('Ошибка:', err);
        }
    };

    const fetchStatistics = async () => {
        try {
            const response = await fetch(`${API_URL}/statistics`);
            if (!response.ok) throw new Error('Ошибка загрузки статистики');
            const data = await response.json();
            setStatistics(data);
        } catch (err) {
            console.error('Ошибка:', err);
        }
    };

    // Загрузка данных при монтировании
    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchStatistics();
    }, []);

    useEffect(() => {
        if (activeTab === 'operations') {
            fetchOperations();
        }
    }, [activeTab]);

    // ==================== CRUD ОПЕРАЦИИ ====================

    const handleSaveProduct = async () => {
        if (!productForm.name || !productForm.category_id) {
            alert('Заполните все обязательные поля');
            return;
        }

        try {
            setLoading(true);
            const url = editingProduct
                ? `${API_URL}/products/${editingProduct.id}`
                : `${API_URL}/products`;

            const method = editingProduct ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productForm)
            });

            if (!response.ok) throw new Error('Ошибка сохранения товара');

            await fetchProducts();
            await fetchStatistics();
            setShowProductModal(false);
            setProductForm({ name: '', category_id: '', quantity: 0, unit: 'шт', price: 0, min_quantity: 10 });
            setEditingProduct(null);
        } catch (err) {
            alert('Ошибка: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveOperation = async () => {
        if (!operationForm.product_id || operationForm.quantity <= 0) {
            alert('Заполните все поля корректно');
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/operations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...operationForm,
                    quantity: parseInt(operationForm.quantity),
                    created_by: 'admin'
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка добавления операции');
            }

            await fetchProducts();
            await fetchOperations();
            await fetchStatistics();
            setShowOperationModal(false);
            setOperationForm({ product_id: '', operation_code: 'in', quantity: 0, note: '' });
        } catch (err) {
            alert('Ошибка: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Удалить товар?')) return;

        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/products/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Ошибка удаления товара');

            await fetchProducts();
            await fetchStatistics();
        } catch (err) {
            alert('Ошибка: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setProductForm({
            name: product.name,
            category_id: categories.find(c => c.name === product.category_name)?.id || '',
            quantity: product.quantity,
            unit: product.unit,
            price: product.price,
            min_quantity: product.min_quantity
        });
        setShowProductModal(true);
    };

    // ==================== ФИЛЬТРАЦИЯ ====================

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.category_name && p.category_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // ==================== РЕНДЕР ====================

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Шапка */}
            <div className="bg-blue-600 text-white p-6 shadow-lg">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <Package size={36} />
                            Система управления складом
                        </h1>
                        <p className="mt-2 text-blue-100">Автоматизация логистики и складского учёта</p>
                    </div>
                    <button
                        onClick={() => {
                            fetchProducts();
                            fetchOperations();
                            fetchStatistics();
                        }}
                        className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <RefreshCw size={20} />
                        Обновить
                    </button>
                </div>
            </div>

            {/* Ошибка подключения */}
            {error && (
                <div className="max-w-7xl mx-auto mt-4 px-6">
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
                        <AlertCircle size={20} />
                        <span>Ошибка: {error}. Проверьте подключение к серверу.</span>
                    </div>
                </div>
            )}

            {/* Навигация */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex gap-8">
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`py-4 px-2 border-b-2 font-medium ${
                                activeTab === 'products'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Товары на складе
                        </button>
                        <button
                            onClick={() => setActiveTab('operations')}
                            className={`py-4 px-2 border-b-2 font-medium ${
                                activeTab === 'operations'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            История операций
                        </button>
                        <button
                            onClick={() => setActiveTab('statistics')}
                            className={`py-4 px-2 border-b-2 font-medium ${
                                activeTab === 'statistics'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Статистика
                        </button>
                    </div>
                </div>
            </div>

            {/* Контент */}
            <div className="max-w-7xl mx-auto p-6">
                {loading && <div className="text-center py-8">Загрузка...</div>}

                {/* Вкладка: Товары */}
                {activeTab === 'products' && !loading && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Поиск товаров..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setEditingProduct(null);
                                        setProductForm({ name: '', category_id: '', quantity: 0, unit: 'шт', price: 0, min_quantity: 10 });
                                        setShowProductModal(true);
                                    }}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                                >
                                    <Plus size={20} />
                                    Добавить товар
                                </button>
                                <button
                                    onClick={() => setShowOperationModal(true)}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
                                >
                                    <ArrowDownCircle size={20} />
                                    Новая операция
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Наименование</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Категория</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Количество</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Цена</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сумма</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y">
                                {filteredProducts.map(product => (
                                    <tr key={product.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">{product.name}</td>
                                        <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                          {product.category_name}
                        </span>
                                        </td>
                                        <td className="px-6 py-4">
                        <span className={`font-medium ${product.quantity < product.min_quantity ? 'text-red-600' : 'text-gray-900'}`}>
                          {product.quantity} {product.unit}
                        </span>
                                        </td>
                                        <td className="px-6 py-4">{parseFloat(product.price).toLocaleString()} ₸</td>
                                        <td className="px-6 py-4 font-medium">
                                            {parseFloat(product.total_value).toLocaleString()} ₸
                                        </td>
                                        <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                            product.status === 'Требуется заказ'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                        }`}>
                          {product.status}
                        </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditProduct(product)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProduct(product.id)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Вкладка: Операции */}
                {activeTab === 'operations' && !loading && (
                    <div>
                        <div className="mb-6">
                            <button
                                onClick={() => setShowOperationModal(true)}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
                            >
                                <Plus size={20} />
                                Добавить операцию
                            </button>
                        </div>

                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Товар</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Категория</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Тип</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Количество</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сумма</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Примечание</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y">
                                {operations.map(op => (
                                    <tr key={op.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">{new Date(op.created_at).toLocaleDateString('ru-RU')}</td>
                                        <td className="px-6 py-4">{op.product_name}</td>
                                        <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">
                          {op.category_name}
                        </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {op.operation_code === 'in' ? (
                                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm flex items-center gap-1 w-fit">
                            <ArrowDownCircle size={16} />
                            Приход
                          </span>
                                            ) : (
                                                <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm flex items-center gap-1 w-fit">
                            <ArrowUpCircle size={16} />
                            Расход
                          </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-medium">{op.quantity}</td>
                                        <td className="px-6 py-4">{parseFloat(op.operation_value).toLocaleString()} ₸</td>
                                        <td className="px-6 py-4 text-gray-600">{op.note}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Вкладка: Статистика */}
                {activeTab === 'statistics' && !loading && statistics && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-lg shadow">
                                <div className="text-gray-500 text-sm mb-2">Всего товаров</div>
                                <div className="text-3xl font-bold text-blue-600">{statistics.total_products}</div>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow">
                                <div className="text-gray-500 text-sm mb-2">Общая стоимость склада</div>
                                <div className="text-3xl font-bold text-green-600">
                                    {parseFloat(statistics.total_warehouse_value).toLocaleString()} ₸
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow">
                                <div className="text-gray-500 text-sm mb-2">Операций за всё время</div>
                                <div className="text-3xl font-bold text-purple-600">{statistics.total_operations}</div>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow">
                                <div className="text-gray-500 text-sm mb-2">Товары с низким остатком</div>
                                <div className="text-3xl font-bold text-red-600">{statistics.low_stock_count}</div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-lg font-semibold mb-4">Товары по категориям</h3>
                            <div className="space-y-3">
                                {statistics.categories.map(category => (
                                    <div key={category.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                        <span className="font-medium">{category.category_name}</span>
                                        <div className="text-right">
                                            <div className="text-sm text-gray-600">
                                                {category.products_count} товаров, {category.total_quantity} единиц
                                            </div>
                                            <div className="font-semibold">{parseFloat(category.total_value).toLocaleString()} ₸</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Модальное окно: Товар */}
            {showProductModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">
                            {editingProduct ? 'Редактировать товар' : 'Добавить товар'}
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Наименование *</label>
                                <input
                                    type="text"
                                    value={productForm.name}
                                    onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Категория *</label>
                                <select
                                    value={productForm.category_id}
                                    onChange={(e) => setProductForm({...productForm, category_id: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Выберите категорию</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Количество</label>
                                    <input
                                        type="number"
                                        value={productForm.quantity}
                                        onChange={(e) => setProductForm({...productForm, quantity: parseInt(e.target.value) || 0})}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Единица</label>
                                    <select
                                        value={productForm.unit}
                                        onChange={(e) => setProductForm({...productForm, unit: e.target.value})}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="шт">шт</option>
                                        <option value="кг">кг</option>
                                        <option value="л">л</option>
                                        <option value="пачка">пачка</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Цена (₸)</label>
                                    <input
                                        type="number"
                                        value={productForm.price}
                                        onChange={(e) => setProductForm({...productForm, price: parseFloat(e.target.value) || 0})}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Мин. остаток</label>
                                    <input
                                        type="number"
                                        value={productForm.min_quantity}
                                        onChange={(e) => setProductForm({...productForm, min_quantity: parseInt(e.target.value) || 10})}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleSaveProduct}
                                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                                disabled={loading}
                            >
                                {loading ? 'Сохранение...' : 'Сохранить'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowProductModal(false);
                                    setEditingProduct(null);
                                }}
                                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                            >
                                Отмена
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Модальное окно: Операция */}
            {showOperationModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">Новая операция</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Товар *</label>
                                <select
                                    value={operationForm.product_id}
                                    onChange={(e) => setOperationForm({...operationForm, product_id: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Выберите товар</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} (остаток: {p.quantity} {p.unit})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Тип операции *</label>
                                <select
                                    value={operationForm.operation_code}
                                    onChange={(e) => setOperationForm({...operationForm, operation_code: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="in">Приход</option>
                                    <option value="out">Расход</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Количество *</label>
                                <input
                                    type="number"
                                    value={operationForm.quantity}
                                    onChange={(e) => setOperationForm({...operationForm, quantity: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Примечание</label>
                                <textarea
                                    value={operationForm.note}
                                    onChange={(e) => setOperationForm({...operationForm, note: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleSaveOperation}
                                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                                disabled={loading}
                            >
                                {loading ? 'Выполнение...' : 'Выполнить'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowOperationModal(false);
                                    setOperationForm({ product_id: '', operation_code: 'in', quantity: 0, note: '' });
                                }}
                                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                            >
                                Отмена
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WarehouseManagementSystem;
