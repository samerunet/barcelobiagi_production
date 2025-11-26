'use client';

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Settings,
  LogOut,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Eye,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Box,
  AlertCircle,
  ChevronLeft,
  Upload,
  Save,
  Globe,
  Menu,
  Home,
  ChevronRight,
  Filter,
  Star,
  Check,
  ZoomIn,
  Camera,
  Mail,
  UserPlus,
  Shield,
  Crown,
  EyeOff
} from 'lucide-react';
import { uploadFiles } from '@/lib/uploadthing';
import { DEFAULT_HOMEPAGE_CATEGORIES, HomepageCategory } from '@/data/homepageCategories';
import { DEFAULT_HOMEPAGE_POPULAR, HomepagePopularItem } from '@/data/homepagePopular';
import { getPrimaryImage as getPrimaryProductImage, resolveImageUrl } from '@/lib/images';
import { mapApiProducts } from '@/lib/productMapper';

// ============================================================================
// TYPES
// ============================================================================

interface Product {
  id: string;
  sku: string;
  name_ru: string;
  name_en: string;
  description_ru: string;
  description_en: string;
  category: string;
  categoryId?: string;
  price: number;
  original_price?: number;
  image: string;
  images: string[];
  stock: number;
  lowStockThreshold: number;
  inStock: boolean;
  active: boolean;
  featured: boolean;
  tags?: string[];
  variants?: Array<{
    id?: string;
    label: string;
    sku?: string;
    stock?: number;
    price?: number;
  }>;
}

interface Order {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  total: number;
  paymentStatus: 'paid' | 'unpaid';
  deliveryStatus: 'delivered' | 'in-progress' | 'canceled';
  items: { productId: string; quantity: number; price: number }[];
}

interface Customer {
  id: string;
  name: string;
  email: string;
  orderCount: number;
  totalSpent: number;
  emailConsent: boolean;
  registeredDate: string;
}

interface Manager {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'manager' | 'viewer';
  status: 'active' | 'inactive';
  lastLogin: string;
}

interface CategoryOption {
  id: string;
  nameRu: string;
  nameEn: string;
  slug: string;
}

interface HomepageSettings {
  categories: HomepageCategory[];
  popular: HomepagePopularItem[];
}

type AdminView = 'dashboard' | 'inventory' | 'inventory-detail' | 'orders' | 'order-detail' | 'customers' | 'settings';
type InventoryFilter = 'all' | 'active' | 'hidden' | 'low-stock' | 'featured';
type OrderFilter = 'all' | 'paid' | 'unpaid' | 'delivered' | 'not-delivered';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AdminDashboard() {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const HOMEPAGE_CATEGORIES_KEY = 'home:categories';
  const HOMEPAGE_POPULAR_KEY = 'home:popular';
  
  // Authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Data
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [homepageSettings, setHomepageSettings] = useState<HomepageSettings>({
    categories: [],
    popular: [],
  });
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [inventorySaving, setInventorySaving] = useState(false);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [homepageLoading, setHomepageLoading] = useState(false);
  const [homepageSaving, setHomepageSaving] = useState(false);
  const [homepageError, setHomepageError] = useState<string | null>(null);
  const [homepageSavedMessage, setHomepageSavedMessage] = useState<string | null>(null);
  const [settingsSections, setSettingsSections] = useState({
    categories: true,
    popular: false,
  });
  const API_HEADERS = { 'Content-Type': 'application/json' };
  
  // Filters & Search
  const [inventoryFilter, setInventoryFilter] = useState<InventoryFilter>('all');
  const [orderFilter, setOrderFilter] = useState<OrderFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  
  // Selected items
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Image carousel
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [productUploadError, setProductUploadError] = useState<string | null>(null);
  const [categoryUploadingId, setCategoryUploadingId] = useState<string | null>(null);
  const [categoryUploadError, setCategoryUploadError] = useState<string | null>(null);
  
  // Form language toggle
  const [formLanguage, setFormLanguage] = useState<'ru' | 'en'>('ru');

  // Translations
  const t = {
    // Header
    adminPanel: language === 'ru' ? 'Админ-панель' : 'Admin panel',
    viewSite: language === 'ru' ? 'Посмотреть сайт' : 'View site',
    logout: language === 'ru' ? 'Выйти' : 'Logout',
    
    // Navigation
    dashboard: language === 'ru' ? 'Панель управления' : 'Dashboard',
    inventory: language === 'ru' ? 'Инвентарь' : 'Inventory',
    orders: language === 'ru' ? 'Заказы' : 'Orders',
    customers: language === 'ru' ? 'Клиенты' : 'Customers',
    settings: language === 'ru' ? 'Настройки' : 'Settings',
    
    // Stats
    totalProducts: language === 'ru' ? 'Всего товаров' : 'Total products',
    totalOrders: language === 'ru' ? 'Всего заказов' : 'Total orders',
    totalRevenue: language === 'ru' ? 'Общий доход' : 'Total revenue',
    lowStock: language === 'ru' ? 'Мало на складе' : 'Low stock',
    
    // Widgets
    recentOrders: language === 'ru' ? 'Последние заказы' : 'Recent orders',
    lowStockItems: language === 'ru' ? 'Товары с низким запасом' : 'Low stock items',
    viewAll: language === 'ru' ? 'Показать все' : 'View all',
    
    // Inventory
    addProduct: language === 'ru' ? 'Добавить товар' : 'Add product',
    searchProducts: language === 'ru' ? 'Поиск по названию или SKU...' : 'Search by name or SKU...',
    all: language === 'ru' ? 'Все' : 'All',
    active: language === 'ru' ? 'Активен' : 'Active',
    hidden: language === 'ru' ? 'Скрыт' : 'Hidden',
    featured: language === 'ru' ? 'Избранное' : 'Featured',
    bulkActions: language === 'ru' ? 'Массовые действия' : 'Bulk actions',
    selected: language === 'ru' ? 'Выбрано' : 'Selected',
    actions: language === 'ru' ? 'Действия' : 'Actions',
    
    // Product form
    productName: language === 'ru' ? 'Название товара' : 'Product name',
    description: language === 'ru' ? 'Описание' : 'Description',
    sku: language === 'ru' ? 'Артикул' : 'SKU',
    category: language === 'ru' ? 'Категория' : 'Category',
    price: language === 'ru' ? 'Цена' : 'Price',
    oldPrice: language === 'ru' ? 'Старая цена' : 'Old price',
    stockTotal: language === 'ru' ? 'Количество на складе' : 'Stock total',
    lowStockThreshold: language === 'ru' ? 'Порог низкого запаса' : 'Low stock threshold',
    addImage: language === 'ru' ? 'Добавить изображение' : 'Add image',
    mainImage: language === 'ru' ? 'Главное' : 'Main',
    save: language === 'ru' ? 'Сохранить' : 'Save',
    cancel: language === 'ru' ? 'Отмена' : 'Cancel',
    
    // Orders
    orderId: language === 'ru' ? 'ID заказа' : 'Order ID',
    customer: language === 'ru' ? 'Клиент' : 'Customer',
    date: language === 'ru' ? 'Дата' : 'Date',
    amount: language === 'ru' ? 'Сумма' : 'Amount',
    paymentStatus: language === 'ru' ? 'Оплата' : 'Payment',
    deliveryStatus: language === 'ru' ? 'Доставка' : 'Delivery',
    paid: language === 'ru' ? 'Оплачен' : 'Paid',
    unpaid: language === 'ru' ? 'Не оплачен' : 'Unpaid',
    delivered: language === 'ru' ? 'Доставлен' : 'Delivered',
    inProgress: language === 'ru' ? 'В процессе' : 'In progress',
    canceled: language === 'ru' ? 'Отменен' : 'Canceled',
    notDelivered: language === 'ru' ? 'Не доставлен' : 'Not delivered',
    
    // Customers
    totalCustomers: language === 'ru' ? 'Клиентов всего' : 'Total customers',
    email: language === 'ru' ? 'Email' : 'Email',
    orderCount: language === 'ru' ? 'Заказов' : 'Orders',
    emailConsent: language === 'ru' ? 'Согласие на рассылку' : 'Email consent',
    sendCampaign: language === 'ru' ? 'Отправить рассылку' : 'Send campaign',
    
    // Settings
    mainPage: language === 'ru' ? 'Главная страница' : 'Main page',
    content: language === 'ru' ? 'Кон��ент' : 'Content',
    userManagement: language === 'ru' ? 'Управление пользователями' : 'User management',
    categoryTiles: language === 'ru' ? 'Плитки категорий' : 'Category tiles',
    addManager: language === 'ru' ? 'Добавить менеджера' : 'Add manager',
    role: language === 'ru' ? 'Роль' : 'Role',
    status: language === 'ru' ? 'Статус' : 'Status',
    lastLogin: language === 'ru' ? 'Последний вход' : 'Last login',
    owner: language === 'ru' ? 'Владелец' : 'Owner',
    manager: language === 'ru' ? 'Менеджер' : 'Manager',
    viewer: language === 'ru' ? 'Наблюдатель' : 'Viewer',
    saveChanges: language === 'ru' ? 'Сохранить изменения' : 'Save changes',
    
    // Categories
    men: language === 'ru' ? 'Мужское' : 'Men',
    women: language === 'ru' ? 'Женское' : 'Women',
    kids: language === 'ru' ? 'Детское' : 'Kids',
    accessories: language === 'ru' ? 'Аксессуары' : 'Accessories',
  };

  // ============================================================================
  // LOAD DATA
  // ============================================================================

useEffect(() => {
  const hasCookie = document.cookie.includes('admin_session=');
  const auth = localStorage.getItem('adminAuth');
  if (hasCookie || auth === 'true') {
    setIsAuthenticated(true);
    fetchDashboardData();
  }
}, []);


  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleLogin = () => {
    localStorage.setItem('adminAuth', 'true');
    setIsAuthenticated(true);
    fetchDashboardData();
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
    navigate('/');
  };

  const fetchDashboardData = async () => {
    await Promise.all([fetchProducts(), fetchOrders(), fetchCustomers(), fetchUsers(), fetchCategories(), loadHomepageSettings()]);
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      const normalized = mapApiProducts(data).map((p) => ({
        id: p.id,
        sku: p.sku,
        name_ru: p.name_ru,
        name_en: p.name_en,
        description_ru: p.description_ru ?? '',
        description_en: p.description_en ?? '',
        category: p.category || '',
        categoryId: p.categoryId,
        price: p.price,
        original_price: p.old_price ?? undefined,
        image: getPrimaryProductImage(p) || resolveImageUrl(p.images?.[0]),
        images: (p.images ?? []).map((img) => resolveImageUrl(img)),
        stock: p.stock_total,
        lowStockThreshold: p.stock_low_threshold,
        inStock: p.stock_total > 0,
        active: (p.status ?? 'ACTIVE') === 'ACTIVE',
        featured: !!p.featured,
        tags: (p.tags ?? []).map((t: any) => (typeof t === 'string' ? t : t.slug)).filter(Boolean),
        variants: (p.variants ?? []).map((v: any) => ({
          id: v.id,
          label: v.label,
          sku: v.sku ?? '',
          stock: v.stock ?? 0,
          price: v.price != null ? Number(v.price) : undefined,
        })),
      }));
      setProducts(normalized);
    } catch (error) {
      console.error('Failed to load products', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      const mapped: Order[] = (data ?? []).map((o: any) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerId: o.customerId,
        customerName: `${o.customer?.firstName ?? ''} ${o.customer?.lastName ?? ''}`.trim() || o.customer?.email || '—',
        date: o.createdAt,
        total: Number(o.totalAmount ?? 0),
        paymentStatus: (o.paymentStatus ?? 'pending').toLowerCase() as Order['paymentStatus'],
        deliveryStatus: (o.deliveryStatus ?? 'pending').replace('_', '-') as Order['deliveryStatus'],
        items: (o.items ?? []).map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: Number(item.unitPrice ?? 0),
        })),
      }));
      setOrders(mapped);
    } catch (error) {
      console.error('Failed to load orders', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      const mapped: Customer[] = (data ?? []).map((c: any) => ({
        id: c.id,
        name: `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim() || c.email,
        email: c.email,
        orderCount: (c.orders ?? []).length,
        totalSpent: (c.orders ?? []).reduce((sum: number, o: any) => sum + Number(o.totalAmount ?? 0), 0),
        emailConsent: c.marketingConsent ?? false,
        registeredDate: c.createdAt,
      }));
      setCustomers(mapped);
    } catch (error) {
      console.error('Failed to load customers', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      const mapped: Manager[] = (data ?? []).map((u: any) => ({
        id: u.id,
        name: u.name ?? u.email,
        email: u.email,
        role: u.role.toLowerCase() as Manager['role'],
        status: u.isActive ? 'active' : 'inactive',
        lastLogin: u.lastLoginAt ?? '—',
      }));
      setManagers(mapped);
    } catch (error) {
      console.error('Failed to load users', error);
    }
  };

  const loadHomepageSettings = async () => {
    setHomepageLoading(true);
    setHomepageError(null);
    try {
      const res = await fetch('/api/settings?group=home');
      if (!res.ok) throw new Error('Failed to load homepage settings');
      const data: Array<{ key: string; value: string }> = await res.json();
      const existing = data.find((s) => s.key === HOMEPAGE_CATEGORIES_KEY);
      const popularSetting = data.find((s) => s.key === HOMEPAGE_POPULAR_KEY);

      const parsedCategories =
        existing?.value && JSON.parse(existing.value as string);
      const parsedPopular =
        popularSetting?.value && JSON.parse(popularSetting.value as string);

      setHomepageSettings({
        categories:
          Array.isArray(parsedCategories) && parsedCategories.length
            ? parsedCategories
            : DEFAULT_HOMEPAGE_CATEGORIES,
        popular:
          Array.isArray(parsedPopular) && parsedPopular.length
            ? parsedPopular
            : DEFAULT_HOMEPAGE_POPULAR,
      });
    } catch (error) {
      console.error('Failed to load homepage settings', error);
      setHomepageError('Не удалось загрузить плитки главной, показаны значения по умолчанию.');
      setHomepageSettings({
        categories: DEFAULT_HOMEPAGE_CATEGORIES,
        popular: DEFAULT_HOMEPAGE_POPULAR,
      });
    } finally {
      setHomepageLoading(false);
    }
  };

  const handleStatClick = (stat: string) => {
    switch (stat) {
      case 'products':
        setCurrentView('inventory');
        setInventoryFilter('all');
        break;
      case 'orders':
        setCurrentView('orders');
        setOrderFilter('all');
        break;
      case 'revenue':
        setCurrentView('orders');
        setOrderFilter('paid');
        break;
      case 'low-stock':
        setCurrentView('inventory');
        setInventoryFilter('low-stock');
        break;
    }
    setSidebarOpen(false);
  };

  const handleAddHomepageCategory = () => {
    const newCategory: HomepageCategory = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      nameRu: 'Новая категория',
      nameEn: 'New category',
      image: '',
      link: '/category/new',
      badgeRu: '',
      badgeEn: '',
    };
    setHomepageSettings((prev) => ({
      ...prev,
      categories: [...prev.categories, newCategory],
    }));
  };

  const handleRemoveHomepageCategory = (id: string) => {
    setHomepageSettings((prev) => ({
      ...prev,
      categories: prev.categories.filter((cat) => cat.id !== id),
    }));
  };

  const handleAddPopularItem = () => {
    const newItem: HomepagePopularItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      titleRu: 'Новый товар',
      titleEn: 'New item',
      price: 9990,
      oldPrice: null,
      image: '',
      link: '/product/new',
    };
    setHomepageSettings((prev) => ({
      ...prev,
      popular: [...prev.popular, newItem],
    }));
  };

  const handleRemovePopularItem = (id: string) => {
    setHomepageSettings((prev) => ({
      ...prev,
      popular: prev.popular.filter((item) => item.id !== id),
    }));
  };

  const handlePopularProductSelect = (itemId: string, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const mainImage =
      getPrimaryProductImage({
        ...product,
        images: product.images,
        nameRu: product.name_ru,
        nameEn: product.name_en,
      } as any) || product.images?.[0] || '';

    setHomepageSettings((prev) => ({
      ...prev,
      popular: prev.popular.map((item) =>
        item.id === itemId
          ? {
              ...item,
              productId,
              titleRu: product.name_ru,
              titleEn: product.name_en,
              price: product.price,
              oldPrice: product.original_price ?? null,
              link: `/product/${product.id}`,
              image: mainImage,
            }
          : item
      ),
    }));
  };

  const handleSaveHomepageCategories = async () => {
    setHomepageSaving(true);
    setHomepageError(null);
    setHomepageSavedMessage(null);
    try {
      const payload = [
        {
          key: HOMEPAGE_CATEGORIES_KEY,
          value: JSON.stringify(homepageSettings.categories),
          group: 'home',
        },
        {
          key: HOMEPAGE_POPULAR_KEY,
          value: JSON.stringify(homepageSettings.popular),
          group: 'home',
        },
      ];
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error('Failed to save homepage categories');
      }
      setHomepageSavedMessage('Плитки главной сохранены');
    } catch (error) {
      console.error('Failed to save homepage tiles', error);
      setHomepageError('Не удалось сохранить плитки главной.');
    } finally {
      setHomepageSaving(false);
    }
  };

  const resolveUploadUrl = (file: {
    serverData?: { fileUrl?: string; fileKey?: string };
    url?: string;
    key?: string;
  }) => {
    const direct =
      file.serverData?.fileUrl ||
      (file as { url?: string; ufsUrl?: string }).ufsUrl ||
      file.url;
    if (direct) return direct;
    const key = file.serverData?.fileKey || (file as { key?: string }).key;
    return key ? `https://utfs.io/f/${key}` : '';
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedProduct) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const input = e.target;
    setProductUploadError(null);
    setIsUploadingImages(true);

    try {
      const customPrefix = `${selectedProduct?.sku || selectedProduct?.id || 'new'}-${Date.now()}`;
      const filesWithCustomNames = Array.from(files).map((file, idx) =>
        new File([file], `${customPrefix}-${idx}-${file.name}`, { type: file.type })
      );
      const uploads = await uploadFiles('productImageUploader', {
        files: filesWithCustomNames,
      });
      const urls =
        uploads
          ?.map((file) => resolveUploadUrl(file))
          .filter(Boolean) as string[];

      if (!urls?.length) {
        setProductUploadError('UploadThing did not return image URLs.');
        return;
      }

      setSelectedProduct((prev) =>
        prev ? { ...prev, images: [...prev.images, ...urls] } : null
      );
    } catch (error) {
      console.error('UploadThing error', error);
      setProductUploadError('Не удалось загрузить изображения через UploadThing.');
    } finally {
      setIsUploadingImages(false);
      input.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    if (!selectedProduct) return;
    setSelectedProduct({
      ...selectedProduct,
      images: selectedProduct.images.filter((_, i) => i !== index)
    });
    if (mainImageIndex >= selectedProduct.images.length - 1) {
      setMainImageIndex(Math.max(0, selectedProduct.images.length - 2));
    }
  };

  const handleCategoryImageUpload = async (
    categoryId: string,
    fileList: FileList | null
  ) => {
    if (!fileList?.length) return;
    setCategoryUploadError(null);
    setCategoryUploadingId(categoryId);

    try {
      const customPrefix = `category-${categoryId}-${Date.now()}`;
      const file = fileList[0];
      const uploads = await uploadFiles('productImageUploader', {
        files: [
          new File([file], `${customPrefix}-${file.name}`, { type: file.type }),
        ],
      });
      const upload = uploads?.[0];
      const url = upload ? resolveUploadUrl(upload) : '';

      if (!url) {
        setCategoryUploadError('UploadThing did not return an image URL.');
        return;
      }

      setHomepageSettings((prev) => ({
        ...prev,
        categories: prev.categories.map((category) =>
          category.id === categoryId ? { ...category, image: url } : category
        ),
      }));
    } catch (error) {
      console.error('Category image upload failed', error);
      setCategoryUploadError(
        'Не удалось загрузить изображение категории через UploadThing.'
      );
    } finally {
      setCategoryUploadingId(null);
    }
  };

  const handleSetMainImage = (index: number) => {
    setMainImageIndex(index);
  };

  const handleImageHover = (e: React.MouseEvent<HTMLImageElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const handleSaveProduct = async () => {
    if (!selectedProduct) return;
    setInventorySaving(true);
    setInventoryError(null);

    // Map selectedProduct -> API payload
    const toImageKey = (img: any) => {
      if (!img) return null;
      if (typeof img === 'string') {
        const parts = img.split('/');
        const last = parts.pop() ?? '';
        return last || img;
      }
      return img.imageKey || img.key || null;
    };

    const payload: any = {
      sku: selectedProduct.sku,
      nameRu: selectedProduct.name_ru,
      nameEn: selectedProduct.name_en,
      descriptionRu: selectedProduct.description_ru,
      descriptionEn: selectedProduct.description_en,
      categoryId: selectedProduct.categoryId ?? 'default',
      price: selectedProduct.price,
      oldPrice: selectedProduct.original_price ?? null,
      stockTotal: selectedProduct.stock ?? 0,
      stockLowThreshold: selectedProduct.lowStockThreshold ?? 3,
      featured: selectedProduct.featured,
      status: selectedProduct.active ? 'ACTIVE' : 'HIDDEN',
      tags: selectedProduct.tags ?? [],
      variants:
        selectedProduct.variants && selectedProduct.variants.length
          ? selectedProduct.variants.map((v) => ({
              label: v.label,
              sku: undefined,
              stock: v.stock ?? 0,
              price: undefined,
            }))
          : undefined,
      images: (selectedProduct.images ?? [])
        .filter(Boolean)
        .map((img, idx) => {
          const imageKey = toImageKey(img);
          return imageKey
            ? {
                imageKey,
                isMain: idx === 0,
                sortOrder: idx,
              }
            : null;
        })
        .filter(Boolean),
    };

    const isEdit = Boolean(selectedProduct.id && products.some((p) => p.id === selectedProduct.id));
    const endpoint = isEdit ? `/api/products/${selectedProduct.id}` : '/api/products';
    const method = isEdit ? 'PUT' : 'POST';

    console.info('[admin-dashboard] save product payload', { isEdit, endpoint, payload });

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error('Save product failed', { status: res.status, data, payload });
        setInventoryError(data?.error || 'Не удалось сохранить товар');
        return;
      }

      console.info('Product saved', data);
      // Refresh list from API to ensure DB state
      await fetchProducts();
      setCurrentView('inventory');
      setSelectedProduct(null);
    } catch (err) {
      console.error('Save product error', err);
      setInventoryError('Ошибка сохранения товара');
    } finally {
      setInventorySaving(false);
    }
  };

  const handleOrderStatusChange = (orderId: string, field: 'paymentStatus' | 'deliveryStatus', value: string) => {
    setOrders(orders.map(o => 
      o.id === orderId ? { ...o, [field]: value } : o
    ));
  };

  // Computed values
  const stats = {
    totalProducts: products.length,
    totalOrders: orders.length,
    totalRevenue: orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0),
    lowStockCount: products.filter(p => p.stock <= p.lowStockThreshold).length
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = searchQuery === '' || 
      p.name_ru.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      inventoryFilter === 'all' ||
      (inventoryFilter === 'active' && p.active) ||
      (inventoryFilter === 'hidden' && !p.active) ||
      (inventoryFilter === 'low-stock' && p.stock <= p.lowStockThreshold) ||
      (inventoryFilter === 'featured' && p.featured);
    
    return matchesSearch && matchesFilter;
  });

  const filteredOrders = orders.filter(o => {
    return orderFilter === 'all' ||
      (orderFilter === 'paid' && o.paymentStatus === 'paid') ||
      (orderFilter === 'unpaid' && o.paymentStatus === 'unpaid') ||
      (orderFilter === 'delivered' && o.deliveryStatus === 'delivered') ||
      (orderFilter === 'not-delivered' && o.deliveryStatus !== 'delivered');
  });

  // ============================================================================
  // RENDER: LOGIN
  // ============================================================================

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary via-primary-dark to-accent">
        <div className="w-full max-w-md glass-navbar rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-4 shadow-lg">
              <span className="text-2xl font-bold text-primary">BB</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.adminPanel}</h1>
          </div>
          
          <button
            onClick={handleLogin}
            className="w-full py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg transition-all"
          >
            {language === 'ru' ? 'Войти как admin' : 'Login as admin'}
          </button>
          
          <div className="mt-4 text-center">
            <button
              onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
              className="text-sm text-gray-600 hover:text-primary"
            >
              <Globe className="w-4 h-4 inline mr-1" />
              {language === 'ru' ? 'English' : 'Русский'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER: MOBILE HEADER
  // ============================================================================

  const renderMobileHeader = () => (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass-navbar border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-xl">
            <span className="font-bold text-white">BB</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900">{t.adminPanel}</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Home className="w-5 h-5 text-gray-700" />
          </Link>
          <button
            onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
            className="px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {language.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );

  // ============================================================================
  // RENDER: SIDEBAR
  // ============================================================================

  const renderSidebar = () => (
    <>
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <div className={`
        fixed top-0 left-0 h-screen z-40 w-64
        glass-navbar border-r border-gray-200 shadow-lg
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 h-full flex flex-col">
          {/* Logo */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-xl shadow-md">
                <span className="text-xl font-bold text-white">BB</span>
              </div>
              <div>
                <h1 className="font-bold text-gray-900">BARCELO BIAGI</h1>
                <p className="text-xs text-gray-500">{t.adminPanel}</p>
              </div>
            </div>
            
            <Link
              to="/"
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium"
            >
              <Home className="w-4 h-4" />
              {t.viewSite}
            </Link>
          </div>

          {/* Language */}
          <button
            onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 mb-6 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all text-sm font-medium text-gray-700"
          >
            <Globe className="w-4 h-4" />
            {language === 'ru' ? 'Русский' : 'English'}
          </button>

          {/* Navigation */}
          <nav className="space-y-2 flex-1">
            <button
              onClick={() => { setCurrentView('dashboard'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                currentView === 'dashboard' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-medium">{t.dashboard}</span>
            </button>

            <button
              onClick={() => { setCurrentView('inventory'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                currentView === 'inventory' || currentView === 'inventory-detail' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Package className="w-5 h-5" />
              <span className="font-medium">{t.inventory}</span>
            </button>

            <button
              onClick={() => { setCurrentView('orders'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                currentView === 'orders' || currentView === 'order-detail' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="font-medium">{t.orders}</span>
            </button>

            <button
              onClick={() => { setCurrentView('customers'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                currentView === 'customers' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">{t.customers}</span>
            </button>

            <button
              onClick={() => { setCurrentView('settings'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                currentView === 'settings' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">{t.settings}</span>
            </button>
          </nav>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-error hover:bg-error/10 transition-all font-medium"
          >
            <LogOut className="w-5 h-5" />
            {t.logout}
          </button>
        </div>
      </div>
    </>
  );

  // ============================================================================
  // RENDER: DASHBOARD VIEW
  // ============================================================================

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <button
          onClick={() => handleStatClick('products')}
          className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all text-left cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
              <Box className="w-6 h-6 text-primary" />
            </div>
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalProducts}</h3>
          <p className="text-sm text-gray-600">{t.totalProducts}</p>
          <p className="text-xs text-success mt-2">+12%</p>
        </button>

        {/* Total Orders */}
        <button
          onClick={() => handleStatClick('orders')}
          className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all text-left cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-success/10 rounded-xl group-hover:bg-success/20 transition-colors">
              <ShoppingBag className="w-6 h-6 text-success" />
            </div>
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalOrders}</h3>
          <p className="text-sm text-gray-600">{t.totalOrders}</p>
          <p className="text-xs text-success mt-2">+8%</p>
        </button>

        {/* Total Revenue */}
        <button
          onClick={() => handleStatClick('revenue')}
          className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all text-left cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-accent/10 rounded-xl group-hover:bg-accent/20 transition-colors">
              <DollarSign className="w-6 h-6 text-accent" />
            </div>
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">₽{stats.totalRevenue.toLocaleString()}</h3>
          <p className="text-sm text-gray-600">{t.totalRevenue}</p>
          <p className="text-xs text-success mt-2">+15%</p>
        </button>

        {/* Low Stock */}
        <button
          onClick={() => handleStatClick('low-stock')}
          className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all text-left cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-error/10 rounded-xl group-hover:bg-error/20 transition-colors">
              <AlertCircle className="w-6 h-6 text-error" />
            </div>
            <TrendingDown className="w-5 h-5 text-error" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.lowStockCount}</h3>
          <p className="text-sm text-gray-600">{t.lowStock}</p>
        </button>
      </div>

      {/* Recent Orders & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">{t.recentOrders}</h2>
            <button
              onClick={() => { setCurrentView('orders'); setSidebarOpen(false); }}
              className="text-sm text-primary hover:text-primary-dark font-medium"
            >
              {t.viewAll}
            </button>
          </div>
          <div className="space-y-3">
            {orders.slice(0, 5).map(order => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">{order.id}</p>
                  <p className="text-xs text-gray-600">{order.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 text-sm">₽{order.total.toLocaleString()}</p>
                  <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                    order.paymentStatus === 'paid' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                  }`}>
                    {order.paymentStatus === 'paid' ? t.paid : t.unpaid}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">{t.lowStockItems}</h2>
            <button
              onClick={() => handleStatClick('low-stock')}
              className="text-sm text-primary hover:text-primary-dark font-medium"
            >
              {t.viewAll}
            </button>
          </div>
          <div className="space-y-3">
            {products.filter(p => p.stock <= p.lowStockThreshold).slice(0, 5).map(product => (
              <div key={product.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                <img src={product.image} alt={product.name_en} className="w-12 h-12 object-cover rounded-lg" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {language === 'ru' ? product.name_ru : product.name_en}
                  </p>
                  <p className="text-xs text-gray-600">{product.sku}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-error text-sm">{product.stock}</p>
                  <p className="text-xs text-gray-500">{language === 'ru' ? 'шт.' : 'pcs'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ============================================================================
  // RENDER: INVENTORY VIEW
  // ============================================================================

  const renderInventory = () => (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{t.inventory}</h2>
        <button
          onClick={() => {
            const defaultCategoryId = categories[0]?.id ?? 'default';
            setSelectedProduct({
              id: '',
              sku: '',
              name_ru: '',
              name_en: '',
              description_ru: '',
              description_en: '',
              category: categories[0]?.slug ?? 'default',
              categoryId: defaultCategoryId,
              price: 0,
              image: '',
              images: [],
              stock: 0,
              lowStockThreshold: 10,
              inStock: true,
              active: true,
              featured: false,
              tags: [],
              variants: [],
            });
            setCurrentView('inventory-detail');
          }}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          {t.addProduct}
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchProducts}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(['all', 'active', 'hidden', 'low-stock', 'featured'] as InventoryFilter[]).map(filter => (
            <button
              key={filter}
              onClick={() => setInventoryFilter(filter)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                inventoryFilter === filter
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter === 'all' ? t.all : filter === 'active' ? t.active : filter === 'hidden' ? t.hidden : filter === 'low-stock' ? t.lowStock : t.featured}
            </button>
          ))}
        </div>
      </div>

      {/* Products List - Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white rounded-2xl p-4 shadow-md border border-gray-100">
            <div className="flex gap-3 mb-3">
              <img src={product.image} alt={product.name_en} className="w-20 h-20 object-cover rounded-lg" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1 truncate">
                  {language === 'ru' ? product.name_ru : product.name_en}
                </h3>
                <p className="text-sm text-gray-500 mb-2">{product.sku}</p>
                <span className="inline-block px-2 py-1 bg-primary/10 text-primary rounded text-xs capitalize">
                  {product.category}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-bold text-gray-900">₽{product.price.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{t.stockTotal}: {product.stock}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedProduct(product);
                    setCurrentView('inventory-detail');
                  }}
                  className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button className="p-2 text-error hover:bg-error/10 rounded-lg transition-all">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {product.active && (
                <span className="px-2 py-1 bg-success/10 text-success rounded text-xs">{t.active}</span>
              )}
              {!product.active && (
                <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs">{t.hidden}</span>
              )}
              {product.featured && (
                <span className="px-2 py-1 bg-accent/10 text-accent rounded text-xs">{t.featured}</span>
              )}
              {product.stock <= product.lowStockThreshold && (
                <span className="px-2 py-1 bg-error/10 text-error rounded text-xs">{t.lowStock}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Products List - Desktop Table */}
      <div className="hidden md:block bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                <input type="checkbox" className="rounded accent-primary" />
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">{t.productName}</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">{t.sku}</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">{t.category}</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">{t.price}</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">{t.stockTotal}</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">{t.status}</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.map(product => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <input type="checkbox" className="rounded accent-primary" />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={product.image} alt={product.name_en} className="w-12 h-12 object-cover rounded-lg" />
                    <div>
                      <p className="font-medium text-gray-900">{language === 'ru' ? product.name_ru : product.name_en}</p>
                      <p className="text-sm text-gray-500">{language === 'ru' ? product.name_en : product.name_ru}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{product.sku}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm capitalize">
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900">₽{product.price.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`font-medium ${product.stock <= product.lowStockThreshold ? 'text-error' : 'text-gray-900'}`}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {product.active ? (
                      <span className="px-2 py-1 bg-success/10 text-success rounded text-xs">{t.active}</span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs">{t.hidden}</span>
                    )}
                    {product.featured && (
                      <Star className="w-4 h-4 text-accent fill-accent" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setMainImageIndex(0);
                        setCurrentView('inventory-detail');
                      }}
                      className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-error hover:bg-error/10 rounded-lg transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ============================================================================
  // RENDER: INVENTORY DETAIL (Product Form with Advanced Image Carousel)
  // ============================================================================

  const renderInventoryDetail = () => {
    if (!selectedProduct) return null;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentView('inventory')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h2 className="text-2xl font-bold text-gray-900">
            {selectedProduct.id ? (language === 'ru' ? 'Редактировать товар' : 'Edit Product') : t.addProduct}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Images */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">{language === 'ru' ? 'Изображения товара' : 'Product Images'}</h3>
            
            {/* Main Image - Desktop with Zoom */}
            {selectedProduct.images.length > 0 && (
              <div className="mb-4 relative overflow-hidden rounded-xl bg-gray-100 aspect-square hidden md:block group">
                <img
                  src={selectedProduct.images[mainImageIndex]}
                  alt="Main product"
                  className="w-full h-full object-cover cursor-zoom-in"
                  onMouseEnter={() => setIsZooming(true)}
                  onMouseLeave={() => setIsZooming(false)}
                  onMouseMove={handleImageHover}
                  onClick={() => setImageModalOpen(true)}
                />
                {isZooming && (
                  <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage: `url(${selectedProduct.images[mainImageIndex]})`,
                      backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      backgroundSize: '200%',
                      backgroundRepeat: 'no-repeat'
                    }}
                  />
                )}
              </div>
            )}

            {/* Main Image - Mobile (Tap to open full screen) */}
            {selectedProduct.images.length > 0 && (
              <div 
                className="mb-4 rounded-xl bg-gray-100 aspect-square md:hidden cursor-pointer"
                onClick={() => setImageModalOpen(true)}
              >
                <img
                  src={selectedProduct.images[mainImageIndex]}
                  alt="Main product"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
            )}
            
            {/* Thumbnails */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth: 'thin' }}>
              {selectedProduct.images.map((img, idx) => (
                <div key={idx} className="relative flex-shrink-0 group">
                  <div 
                    className={`w-20 h-20 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                      mainImageIndex === idx ? 'border-primary' : 'border-gray-200 hover:border-gray-400'
                    }`}
                    onMouseEnter={() => setMainImageIndex(idx)}
                    onClick={() => setMainImageIndex(idx)}
                  >
                    <img src={img} alt={`${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                  
                  {/* Main image badge */}
                  {mainImageIndex === idx && (
                    <div className="absolute -top-1 -left-1 bg-primary text-white rounded-full p-1">
                      <Star className="w-3 h-3 fill-white" />
                    </div>
                  )}
                  
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute -top-1 -right-1 p-1 bg-error text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            
            {/* Add Image Button */}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              id="product-image-upload"
            />
            <label
              htmlFor="product-image-upload"
              className={`flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 border-2 border-dashed border-primary/30 hover:border-primary rounded-xl cursor-pointer transition-all text-primary font-medium ${
                isUploadingImages ? 'opacity-70 pointer-events-none' : ''
              }`}
            >
              <Camera className="w-5 h-5" />
              {isUploadingImages ? 'Uploading...' : t.addImage}
            </label>
            {productUploadError && (
              <p className="text-sm text-error mt-2">{productUploadError}</p>
            )}
            {isUploadingImages && (
              <p className="text-xs text-gray-500 mt-1">
                Файлы загружаются через UploadThing, подождите...
              </p>
            )}
          </div>

          {/* Right Column - Product Details */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <div className="space-y-4">
              {/* Language Toggle */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setFormLanguage('ru')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    formLanguage === 'ru' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  RU
                </button>
                <button
                  onClick={() => setFormLanguage('en')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    formLanguage === 'en' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  EN
                </button>
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.productName} *
                </label>
                <input
                  type="text"
                  value={formLanguage === 'ru' ? selectedProduct.name_ru : selectedProduct.name_en}
                  onChange={(e) => setSelectedProduct({
                    ...selectedProduct,
                    [formLanguage === 'ru' ? 'name_ru' : 'name_en']: e.target.value
                  })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={formLanguage === 'ru' ? 'Классические оксфорды' : 'Classic Oxfords'}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.description}
                </label>
                <textarea
                  value={formLanguage === 'ru' ? selectedProduct.description_ru : selectedProduct.description_en}
                  onChange={(e) => setSelectedProduct({
                    ...selectedProduct,
                    [formLanguage === 'ru' ? 'description_ru' : 'description_en']: e.target.value
                  })}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={formLanguage === 'ru' ? 'Описание товара...' : 'Product description...'}
                />
              </div>

              {/* SKU & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.sku} *</label>
                  <input
                    type="text"
                    value={selectedProduct.sku}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, sku: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="BB-M-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.category} *</label>
                  <select
                    value={selectedProduct.categoryId || ''}
                    onChange={(e) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        categoryId: e.target.value,
                        category: categories.find((c) => c.id === e.target.value)?.slug ?? selectedProduct.category,
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {!categories.length && <option value="">Нет категорий</option>}
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {language === 'ru' ? c.nameRu : c.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tags toggles */}
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-900">Новинки</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedProduct.tags?.includes('new') ?? false}
                    onChange={(e) => {
                      const has = selectedProduct.tags?.includes('new');
                      const nextTags = has
                        ? (selectedProduct.tags ?? []).filter((t) => t !== 'new')
                        : [...(selectedProduct.tags ?? []), 'new'];
                      setSelectedProduct({ ...selectedProduct, tags: nextTags });
                    }}
                    className="sr-only"
                  />
                  <div className={`w-10 h-6 rounded-full transition-colors ${selectedProduct.tags?.includes('new') ? 'bg-primary' : 'bg-gray-300'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${selectedProduct.tags?.includes('new') ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </div>
                </label>

                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-900">Акции</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedProduct.tags?.includes('sale') ?? false}
                    onChange={(e) => {
                      const has = selectedProduct.tags?.includes('sale');
                      const nextTags = has
                        ? (selectedProduct.tags ?? []).filter((t) => t !== 'sale')
                        : [...(selectedProduct.tags ?? []), 'sale'];
                      setSelectedProduct({ ...selectedProduct, tags: nextTags });
                    }}
                    className="sr-only"
                  />
                  <div className={`w-10 h-6 rounded-full transition-colors ${selectedProduct.tags?.includes('sale') ? 'bg-primary' : 'bg-gray-300'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${selectedProduct.tags?.includes('sale') ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </div>
                </label>
              </div>

              {/* Price & Old Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.price} (₽) *</label>
                  <input
                    type="number"
                    value={selectedProduct.price}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, price: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="12999"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.oldPrice} (₽)</label>
                  <input
                    type="number"
                    value={selectedProduct.original_price || ''}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, original_price: Number(e.target.value) || undefined })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="15999"
                  />
                </div>
              </div>

              {/* Sizes (predefined) */}
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Доступные размеры</h4>
                  <p className="text-xs text-gray-500">Отметьте размеры. Цена и SKU остаются общими.</p>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {(selectedProduct.category?.includes('women') ? ['35','36','37','38','39','40','41','42'] : ['39','40','41','42','43','44','45','46','47','48']).map((size) => {
                    const selected = (selectedProduct.variants ?? []).some((v) => v.label === size);
                    return (
                      <label
                        key={size}
                        className={`flex items-center justify-center px-3 py-2 border rounded-lg text-sm cursor-pointer transition-colors ${
                          selected ? 'bg-primary text-white border-primary' : 'bg-gray-50 border-gray-200 text-gray-800'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={(e) => {
                            const variants = [...(selectedProduct.variants ?? [])];
                            if (e.target.checked && !selected) {
                              variants.push({ label: size, stock: selectedProduct.stock ?? 10 });
                            } else if (!e.target.checked) {
                              const idx = variants.findIndex((v) => v.label === size);
                              if (idx >= 0) variants.splice(idx, 1);
                            }
                            setSelectedProduct({ ...selectedProduct, variants });
                          }}
                          className="sr-only"
                        />
                        {size}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Stock & Low Stock Threshold */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.stockTotal} *</label>
                  <input
                    type="number"
                    value={selectedProduct.stock}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, stock: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="45"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.lowStockThreshold}</label>
                  <input
                    type="number"
                    value={selectedProduct.lowStockThreshold}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, lowStockThreshold: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="10"
                  />
                </div>
              </div>

              {/* Status Toggles */}
              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded ${selectedProduct.active ? 'bg-success' : 'bg-gray-300'} flex items-center justify-center`}>
                      {selectedProduct.active && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="font-medium text-gray-900">{t.active}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedProduct.active}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, active: e.target.checked })}
                    className="sr-only"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <Star className={`w-5 h-5 ${selectedProduct.featured ? 'text-accent fill-accent' : 'text-gray-300'}`} />
                    <span className="font-medium text-gray-900">{t.featured}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedProduct.featured}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, featured: e.target.checked })}
                    className="sr-only"
                  />
                </label>
              </div>

              {/* Action Buttons */}
              {inventoryError && (
                <p className="text-sm text-error mb-3">{inventoryError}</p>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setCurrentView('inventory')}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-xl transition-all"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleSaveProduct}
                  disabled={inventorySaving}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                    inventorySaving
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-primary to-primary-dark text-white hover:shadow-lg'
                  }`}
                >
                  <Save className="w-5 h-5" />
                  {inventorySaving ? 'Сохраняем...' : t.save}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Image Modal - Full Screen Gallery */}
        {imageModalOpen && (
          <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
            <button
              onClick={() => setImageModalOpen(false)}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            
            <img
              src={selectedProduct.images[mainImageIndex]}
              alt="Product"
              className="max-w-full max-h-full object-contain"
            />
            
            {selectedProduct.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                <button
                  onClick={() => setMainImageIndex(prev => prev > 0 ? prev - 1 : selectedProduct.images.length - 1)}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={() => setMainImageIndex(prev => prev < selectedProduct.images.length - 1 ? prev + 1 : 0)}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // RENDER: ORDERS VIEW
  // ============================================================================

  const renderOrders = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">{t.orders}</h2>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(['all', 'paid', 'unpaid', 'delivered', 'not-delivered'] as OrderFilter[]).map(filter => (
          <button
            key={filter}
            onClick={() => setOrderFilter(filter)}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
              orderFilter === filter ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filter === 'all' ? t.all : filter === 'paid' ? t.paid : filter === 'unpaid' ? t.unpaid : filter === 'delivered' ? t.delivered : t.notDelivered}
          </button>
        ))}
      </div>

      {/* Orders - Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filteredOrders.map(order => (
          <div key={order.id} className="bg-white rounded-2xl p-4 shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-bold text-gray-900">{order.id}</p>
                <p className="text-sm text-gray-600">{order.customerName}</p>
              </div>
              <p className="font-bold text-gray-900">₽{order.total.toLocaleString()}</p>
            </div>
            
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="text-gray-600">{order.date}</span>
              <div className="flex gap-2">
                <select
                  value={order.paymentStatus}
                  onChange={(e) => handleOrderStatusChange(order.id, 'paymentStatus', e.target.value)}
                  className={`px-2 py-1 rounded text-xs font-medium border-0 ${
                    order.paymentStatus === 'paid' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                  }`}
                >
                  <option value="paid">{t.paid}</option>
                  <option value="unpaid">{t.unpaid}</option>
                </select>
                
                <select
                  value={order.deliveryStatus}
                  onChange={(e) => handleOrderStatusChange(order.id, 'deliveryStatus', e.target.value)}
                  className={`px-2 py-1 rounded text-xs font-medium border-0 ${
                    order.deliveryStatus === 'delivered' ? 'bg-success/10 text-success' : 
                    order.deliveryStatus === 'in-progress' ? 'bg-accent/10 text-accent' : 'bg-error/10 text-error'
                  }`}
                >
                  <option value="delivered">{t.delivered}</option>
                  <option value="in-progress">{t.inProgress}</option>
                  <option value="canceled">{t.canceled}</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Orders - Desktop Table */}
      <div className="hidden md:block bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">{t.orderId}</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">{t.customer}</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">{t.date}</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">{t.amount}</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">{t.paymentStatus}</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">{t.deliveryStatus}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredOrders.map(order => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{order.id}</td>
                <td className="px-6 py-4 text-gray-700">{order.customerName}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{order.date}</td>
                <td className="px-6 py-4 font-semibold text-gray-900">₽{order.total.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <select
                    value={order.paymentStatus}
                    onChange={(e) => handleOrderStatusChange(order.id, 'paymentStatus', e.target.value)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium border-0 cursor-pointer ${
                      order.paymentStatus === 'paid' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                    }`}
                  >
                    <option value="paid">{t.paid}</option>
                    <option value="unpaid">{t.unpaid}</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={order.deliveryStatus}
                    onChange={(e) => handleOrderStatusChange(order.id, 'deliveryStatus', e.target.value)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium border-0 cursor-pointer ${
                      order.deliveryStatus === 'delivered' ? 'bg-success/10 text-success' : 
                      order.deliveryStatus === 'in-progress' ? 'bg-accent/10 text-accent' : 'bg-error/10 text-error'
                    }`}
                  >
                    <option value="delivered">{t.delivered}</option>
                    <option value="in-progress">{t.inProgress}</option>
                    <option value="canceled">{t.canceled}</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ============================================================================
  // RENDER: CUSTOMERS VIEW
  // ============================================================================

  const renderCustomers = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t.customers}</h2>
          <p className="text-sm text-gray-600 mt-1">{t.totalCustomers}: {customers.length}</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg transition-all">
          <Mail className="w-5 h-5" />
          {t.sendCampaign}
        </button>
      </div>

      {/* Customers - Mobile Cards */}
      <div className="md:hidden space-y-3">
        {customers.map(customer => (
          <div key={customer.id} className="bg-white rounded-2xl p-4 shadow-md border border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-gray-900">{customer.name}</p>
                <p className="text-sm text-gray-600">{customer.email}</p>
              </div>
              {customer.emailConsent && (
                <span className="px-2 py-1 bg-success/10 text-success rounded text-xs">
                  <Mail className="w-3 h-3 inline mr-1" />
                  {t.emailConsent}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{t.orderCount}: {customer.orderCount}</span>
              <span className="font-semibold text-gray-900">₽{customer.totalSpent.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Customers - Desktop Table */}
      <div className="hidden md:block bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">{language === 'ru' ? 'Имя' : 'Name'}</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">{t.email}</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">{t.orderCount}</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">{language === 'ru' ? 'Потрачено' : 'Total Spent'}</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">{t.emailConsent}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {customers.map(customer => (
              <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{customer.name}</td>
                <td className="px-6 py-4 text-gray-700">{customer.email}</td>
                <td className="px-6 py-4 text-gray-700">{customer.orderCount}</td>
                <td className="px-6 py-4 font-semibold text-gray-900">₽{customer.totalSpent.toLocaleString()}</td>
                <td className="px-6 py-4">
                  {customer.emailConsent ? (
                    <span className="px-3 py-1 bg-success/10 text-success rounded-lg text-sm flex items-center gap-1 w-fit">
                      <Check className="w-4 h-4" />
                      {language === 'ru' ? 'Да' : 'Yes'}
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm">
                      {language === 'ru' ? 'Нет' : 'No'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ============================================================================
  // RENDER: SETTINGS VIEW
  // ============================================================================

  const renderSettings = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">{t.settings}</h2>

      {/* Homepage Categories Management */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
        <button
          type="button"
          className="w-full flex items-center justify-between text-left"
          onClick={() =>
            setSettingsSections((prev) => ({ ...prev, categories: !prev.categories }))
          }
        >
          <span className="text-lg font-semibold text-gray-900">
            {language === 'ru' ? 'Плитки категорий на главной' : 'Homepage Category Tiles'}
          </span>
          <ChevronRight
            className={`w-5 h-5 text-gray-500 transition-transform ${
              settingsSections.categories ? 'rotate-90' : ''
            }`}
          />
        </button>
        {settingsSections.categories && (
          <>
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {language === 'ru'
                    ? 'Управление категориями на главной странице'
                    : 'Homepage Categories Management'}
                </h3>
                <p className="text-sm text-gray-600">
                  {language === 'ru'
                    ? 'Редактируйте изображения, названия и бейджи для всех категорий'
                    : 'Edit images, names, and badges for all categories'}
                </p>
                {homepageLoading && (
                  <p className="text-xs text-gray-500 mt-1">
                    {language === 'ru' ? 'Загрузка плиток...' : 'Loading homepage tiles...'}
                  </p>
                )}
                {homepageError && (
                  <p className="text-sm text-error mt-2">{homepageError}</p>
                )}
                {homepageSavedMessage && (
                  <p className="text-sm text-success mt-2">{homepageSavedMessage}</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleAddHomepageCategory}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  {language === 'ru' ? 'Добавить плитку' : 'Add tile'}
                </button>
                <button
                  type="button"
                  onClick={handleSaveHomepageCategories}
                  disabled={homepageSaving}
                  className={`px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark ${homepageSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {homepageSaving
                    ? language === 'ru'
                      ? 'Сохранение...'
                      : 'Saving...'
                    : language === 'ru'
                    ? 'Сохранить изменения'
                    : 'Save changes'}
                </button>
              </div>
            </div>
            {categoryUploadError && (
              <p className="text-sm text-error mb-4">{categoryUploadError}</p>
            )}

            <div className="space-y-6">
              {homepageSettings.categories.map((category) => (
                <div
                  key={category.id}
                  className="p-5 bg-gray-50 rounded-xl border border-gray-200 hover:border-primary/30 transition-colors"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Image Preview & Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === 'ru' ? 'Изображение категории' : 'Category Image'}
                      </label>
                      <div className="relative group aspect-[4/5] rounded-xl overflow-hidden bg-gray-200">
                        <img
                          src={category.image}
                          alt={category.nameEn}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                        <div className="absolute bottom-3 left-3 right-3">
                          <p className="text-white font-bold text-sm mb-1">
                            {language === 'ru' ? category.nameRu : category.nameEn}
                          </p>
                          {category.badgeRu && (
                            <span className="inline-block px-2 py-1 bg-accent text-white text-xs font-bold rounded">
                              {language === 'ru' ? category.badgeRu : category.badgeEn}
                            </span>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id={`category-image-${category.id}`}
                          disabled={categoryUploadingId === category.id}
                          onChange={(e) => handleCategoryImageUpload(category.id, e.target.files)}
                        />
                        <label
                          htmlFor={`category-image-${category.id}`}
                          className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                        >
                          {categoryUploadingId === category.id ? (
                            <span className="text-[11px] font-medium text-gray-700">Uploading</span>
                          ) : (
                            <Upload className="w-4 h-4 text-gray-700" />
                          )}
                        </label>
                      </div>
                      <input
                        type="text"
                        value={category.image}
                        readOnly
                        placeholder="URL появится после загрузки через UploadThing"
                        className="w-full mt-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    {/* Text Fields */}
                    <div className="lg:col-span-2 space-y-4">
                      {/* Russian Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {language === 'ru' ? 'Название (Русский)' : 'Name (Russian)'}
                        </label>
                        <input
                          type="text"
                          value={category.nameRu}
                          onChange={(e) => {
                            const updated = homepageSettings.categories.map((c) =>
                              c.id === category.id ? { ...c, nameRu: e.target.value } : c
                            );
                            setHomepageSettings((prev) => ({
                              ...prev,
                              categories: updated,
                            }));
                          }}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Мужская обувь"
                        />
                      </div>

                      {/* English Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {language === 'ru' ? 'Название (English)' : 'Name (English)'}
                        </label>
                        <input
                          type="text"
                          value={category.nameEn}
                          onChange={(e) => {
                            const updated = homepageSettings.categories.map((c) =>
                              c.id === category.id ? { ...c, nameEn: e.target.value } : c
                            );
                            setHomepageSettings((prev) => ({
                              ...prev,
                              categories: updated,
                            }));
                          }}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Men's Shoes"
                        />
                      </div>

                      {/* Link */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {language === 'ru' ? 'Ссылка' : 'Link'}
                        </label>
                        <input
                          type="text"
                          value={category.link}
                          onChange={(e) => {
                            const updated = homepageSettings.categories.map((c) =>
                              c.id === category.id ? { ...c, link: e.target.value } : c
                            );
                            setHomepageSettings((prev) => ({
                              ...prev,
                              categories: updated,
                            }));
                          }}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="/category/men"
                        />
                      </div>

                      {/* Badges */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {language === 'ru'
                              ? 'Бейдж (Русский)'
                              : 'Badge (Russian)'}{' '}
                            <span className="text-gray-400 text-xs">
                              ({language === 'ru' ? 'опционально' : 'optional'})
                            </span>
                          </label>
                          <input
                            type="text"
                            value={category.badgeRu || ''}
                            onChange={(e) => {
                              const updated = homepageSettings.categories.map((c) =>
                                c.id === category.id
                                  ? { ...c, badgeRu: e.target.value || undefined }
                                  : c
                              );
                              setHomepageSettings((prev) => ({
                                ...prev,
                                categories: updated,
                              }));
                            }}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Хит, Новое, -40%"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {language === 'ru'
                              ? 'Бейдж (English)'
                              : 'Badge (English)'}{' '}
                            <span className="text-gray-400 text-xs">
                              ({language === 'ru' ? 'опционально' : 'optional'})
                            </span>
                          </label>
                          <input
                            type="text"
                            value={category.badgeEn || ''}
                            onChange={(e) => {
                              const updated = homepageSettings.categories.map((c) =>
                                c.id === category.id
                                  ? { ...c, badgeEn: e.target.value || undefined }
                                  : c
                              );
                              setHomepageSettings((prev) => ({
                                ...prev,
                                categories: updated,
                              }));
                            }}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Trending, New, -40%"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveHomepageCategory(category.id)}
                          className="text-sm text-error hover:text-error/80 underline"
                        >
                          {language === 'ru' ? 'Удалить плитку' : 'Remove tile'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Popular Items Management */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
        <button
          type="button"
          className="w-full flex items-center justify-between text-left"
          onClick={() =>
            setSettingsSections((prev) => ({ ...prev, popular: !prev.popular }))
          }
        >
          <span className="text-lg font-semibold text-gray-900">
            {language === 'ru' ? 'Популярные товары на главной' : 'Homepage Popular Items'}
          </span>
          <ChevronRight
            className={`w-5 h-5 text-gray-500 transition-transform ${
              settingsSections.popular ? 'rotate-90' : ''
            }`}
          />
        </button>
        {settingsSections.popular && (
          <>
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {language === 'ru'
                    ? 'Выберите товары, их ссылки и изображения, которые будут показаны на главной'
                    : 'Control the popular items shown on the homepage'}
                </p>
                {homepageError && (
                  <p className="text-sm text-error mt-2">{homepageError}</p>
                )}
                {homepageSavedMessage && (
                  <p className="text-sm text-success mt-2">{homepageSavedMessage}</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleAddPopularItem}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  {language === 'ru' ? 'Добавить товар' : 'Add item'}
                </button>
                <button
                  type="button"
                  onClick={handleSaveHomepageCategories}
                  disabled={homepageSaving}
                  className={`px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark ${homepageSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {homepageSaving
                    ? language === 'ru'
                      ? 'Сохранение...'
                      : 'Saving...'
                    : language === 'ru'
                    ? 'Сохранить изменения'
                    : 'Save changes'}
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {homepageSettings.popular.map((item) => (
                <div
                  key={item.id}
                  className="p-5 bg-gray-50 rounded-xl border border-gray-200 hover:border-primary/30 transition-colors"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Image */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === 'ru' ? 'Изображение товара' : 'Item Image'}
                      </label>
                      <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-gray-200">
                        <img
                          src={item.image || 'https://placehold.co/400x500?text=Upload'}
                          alt={item.titleEn}
                          className="w-full h-full object-cover"
                        />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id={`popular-image-${item.id}`}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setCategoryUploadError(null);
                            setCategoryUploadingId(item.id);
                            try {
                              const uploads = await uploadFiles('productImageUploader', {
                                files: [file],
                              });
                              const upload = uploads?.[0];
                              const url =
                                upload?.serverData?.fileUrl ||
                                (upload as { ufsUrl?: string }).ufsUrl ||
                                upload?.url ||
                                (upload?.serverData?.fileKey
                                  ? `https://utfs.io/f/${upload.serverData.fileKey}`
                                  : '');
                              if (!url) throw new Error('No URL returned');
                              setHomepageSettings((prev) => ({
                                ...prev,
                                popular: prev.popular.map((p) =>
                                  p.id === item.id ? { ...p, image: url } : p
                                ),
                              }));
                            } catch (error) {
                              console.error('Popular image upload failed', error);
                              setCategoryUploadError('Не удалось загрузить изображение товара.');
                            } finally {
                              setCategoryUploadingId(null);
                            }
                          }}
                        />
                        <label
                          htmlFor={`popular-image-${item.id}`}
                          className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                        >
                          {categoryUploadingId === item.id ? (
                            <span className="text-[11px] font-medium text-gray-700">Uploading</span>
                          ) : (
                            <Upload className="w-4 h-4 text-gray-700" />
                          )}
                        </label>
                      </div>
                    <input
                      type="text"
                      value={item.image}
                      onChange={(e) =>
                        setHomepageSettings((prev) => ({
                          ...prev,
                          popular: prev.popular.map((p) =>
                            p.id === item.id ? { ...p, image: e.target.value } : p
                          ),
                        }))
                      }
                      placeholder="URL появится после загрузки или выберите товар"
                      className="w-full mt-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                    {/* Text fields */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {language === 'ru' ? 'Название (RU)' : 'Title (RU)'}
                        </label>
                        <input
                          type="text"
                          value={item.titleRu}
                          onChange={(e) =>
                            setHomepageSettings((prev) => ({
                              ...prev,
                              popular: prev.popular.map((p) =>
                                p.id === item.id ? { ...p, titleRu: e.target.value } : p
                              ),
                            }))
                          }
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {language === 'ru' ? 'Название (EN)' : 'Title (EN)'}
                        </label>
                        <input
                          type="text"
                          value={item.titleEn}
                          onChange={(e) =>
                            setHomepageSettings((prev) => ({
                              ...prev,
                              popular: prev.popular.map((p) =>
                                p.id === item.id ? { ...p, titleEn: e.target.value } : p
                              ),
                            }))
                          }
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ru' ? 'Связать с товаром' : 'Link to inventory item'}
                    </label>
                    <select
                      value={item.productId || ''}
                      onChange={(e) => handlePopularProductSelect(item.id, e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">{language === 'ru' ? 'Не выбрано' : 'Not selected'}</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name_ru} ({p.sku})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ru' ? 'Ссылка' : 'Link'}
                    </label>
                    <input
                          type="text"
                          value={item.link}
                          onChange={(e) =>
                            setHomepageSettings((prev) => ({
                              ...prev,
                              popular: prev.popular.map((p) =>
                                p.id === item.id ? { ...p, link: e.target.value } : p
                              ),
                            }))
                          }
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>

                    {/* Pricing & actions */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {language === 'ru' ? 'Цена' : 'Price'}
                        </label>
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) =>
                            setHomepageSettings((prev) => ({
                              ...prev,
                              popular: prev.popular.map((p) =>
                                p.id === item.id ? { ...p, price: Number(e.target.value) } : p
                              ),
                            }))
                          }
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {language === 'ru' ? 'Старая цена (опционально)' : 'Old price (optional)'}
                        </label>
                        <input
                          type="number"
                          value={item.oldPrice ?? ''}
                          onChange={(e) =>
                            setHomepageSettings((prev) => ({
                              ...prev,
                              popular: prev.popular.map((p) =>
                                p.id === item.id
                                  ? {
                                      ...p,
                                      oldPrice: e.target.value ? Number(e.target.value) : null,
                                    }
                                  : p
                              ),
                            }))
                          }
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemovePopularItem(item.id)}
                          className="text-sm text-error hover:text-error/80 underline"
                        >
                          {language === 'ru' ? 'Удалить товар' : 'Remove item'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Content Settings */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.content}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'ru' ? 'Текст футера' : 'Footer Text'}
            </label>
            <textarea
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder={language === 'ru' ? 'Введите текст...' : 'Enter text...'}
            />
          </div>
        </div>
      </div>

      {/* User Management */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{t.userManagement}</h3>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl transition-all">
            <UserPlus className="w-4 h-4" />
            {t.addManager}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  {language === 'ru' ? 'Имя' : 'Name'}
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  {t.email}
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  {t.role}
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  {t.status}
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  {t.lastLogin}
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  {language === 'ru' ? 'Действия' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {managers.map((manager) => (
                <tr key={manager.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{manager.name}</td>
                  <td className="px-6 py-4 text-gray-700">{manager.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium ${
                        manager.role === 'owner'
                          ? 'bg-accent/10 text-accent'
                          : manager.role === 'manager'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {manager.role === 'owner' && <Crown className="w-3 h-3" />}
                      {manager.role === 'manager' && <Shield className="w-3 h-3" />}
                      {manager.role === 'viewer' && <Eye className="w-3 h-3" />}
                      {manager.role === 'owner'
                        ? t.owner
                        : manager.role === 'manager'
                        ? t.manager
                        : t.viewer}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        manager.status === 'active'
                          ? 'bg-success/10 text-success'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {manager.status === 'active' ? t.active : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{manager.lastLogin}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-error hover:bg-error/10 rounded-lg transition-all">
                        <EyeOff className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg transition-all">
          <Save className="w-5 h-5" />
          {t.saveChanges}
        </button>
      </div>
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-surface-light">
      {renderMobileHeader()}
      {renderSidebar()}
      
      <div className="lg:ml-64 pt-16 lg:pt-0 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {currentView === 'dashboard' && renderDashboard()}
          {currentView === 'inventory' && renderInventory()}
          {currentView === 'inventory-detail' && renderInventoryDetail()}
          {currentView === 'orders' && renderOrders()}
          {currentView === 'customers' && renderCustomers()}
          {currentView === 'settings' && renderSettings()}
        </div>
      </div>
    </div>
  );
}
