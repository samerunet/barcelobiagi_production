import { Product } from '../types';
import { hasTag } from '../lib/products';

// API PLACEHOLDER NOTE:
// In production, this data will be fetched from kassa.primarket.ru API endpoints:
// - GET /api/products (list all products with filters)
// - GET /api/products/{id} (single product details)
// - GET /api/products?tag=new (new arrivals)
// - GET /api/products?tag=sale (sale items)
// - GET /api/products?category=men (category filter)
// Developers: Replace these mock products with actual API calls

export const mockProducts: Product[] = [
  {
    id: '1',
    name_ru: 'Классические оксфорды',
    name_en: 'Classic Oxford Shoes',
    description_ru: 'Элегантные кожаные туфли ручной работы из премиальной итальянской кожи.',
    description_en: 'Elegant handcrafted leather shoes made from premium Italian leather.',
    price: 18990,
    old_price: 24990,
    currency: 'RUB',
    // 360° VIEW: 8 images at different angles (simulating 45° increments: 0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°)
    // API NOTE: In production, load from GET /api/products/{id}/images360
    images: [
      'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800', // 0° - Front view
      'https://images.unsplash.com/photo-1653868250450-b83e6263d427?w=800', // 45° - Front-right angle
      'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800', // 90° - Right side view
      'https://images.unsplash.com/photo-1708962000105-849e984e69a8?w=800', // 135° - Back-right angle
      'https://images.unsplash.com/photo-1665997347741-ed229725ef07?w=800', // 180° - Back/top view
      'https://images.unsplash.com/photo-1478331156758-e4b99c5c3e94?w=800', // 225° - Back-left angle
      'https://images.unsplash.com/photo-1582897515332-f9cc69df0a75?w=800', // 270° - Left side view
      'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800', // 315° - Front-left angle
    ],
    category: 'men',
    tags: ['sale', 'premium'],
    stock_total: 15,
    stock_low_threshold: 5,
    sku: 'BB-M-OX-001',
    sizes: [
      { size: '40', stock: 2 },
      { size: '41', stock: 3 },
      { size: '42', stock: 5 },
      { size: '43', stock: 3 },
      { size: '44', stock: 2 },
    ],
    material_ru: '100% натуральная кожа',
    material_en: '100% genuine leather',
    color_ru: 'Коричневый',
    color_en: 'Brown',
  },
  {
    id: '2',
    name_ru: 'Женские туфли-лодочки',
    name_en: 'Women\'s Pumps',
    description_ru: 'Изысканные туфли на среднем каблуке из мягкой телячьей кожи.',
    description_en: 'Refined pumps with mid-heel crafted from soft calfskin leather.',
    price: 16990,
    currency: 'RUB',
    images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800', 'https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=800'],
    category: 'women',
    tags: ['new'],
    stock_total: 22,
    stock_low_threshold: 5,
    sku: 'BB-W-PM-002',
    sizes: [
      { size: '36', stock: 4 },
      { size: '37', stock: 6 },
      { size: '38', stock: 5 },
      { size: '39', stock: 4 },
      { size: '40', stock: 3 },
    ],
    material_ru: 'Натуральная телячья кожа',
    material_en: 'Natural calfskin leather',
    color_ru: 'Черный',
    color_en: 'Black',
  },
  {
    id: '3',
    name_ru: 'Мужские лоферы',
    name_en: 'Men\'s Loafers',
    description_ru: 'Комфортные лоферы из замши премиум-класса для повседневной носки.',
    description_en: 'Comfortable premium suede loafers for everyday wear.',
    price: 15490,
    currency: 'RUB',
    images: ['https://images.unsplash.com/photo-1618212621700-baf0e4b99685?w=800', 'https://images.unsplash.com/photo-1582897515332-f9cc69df0a75?w=800'],
    category: 'men',
    tags: ['new'],
    stock_total: 18,
    stock_low_threshold: 5,
    sku: 'BB-M-LF-003',
    sizes: [
      { size: '40', stock: 3 },
      { size: '41', stock: 4 },
      { size: '42', stock: 5 },
      { size: '43', stock: 4 },
      { size: '44', stock: 2 },
    ],
    material_ru: 'Итальянская замша',
    material_en: 'Italian suede',
    color_ru: 'Бежевый',
    color_en: 'Beige',
  },
  {
    id: '4',
    name_ru: 'Женские ботильоны',
    name_en: 'Women\'s Ankle Boots',
    description_ru: 'Стильные ботильоны на устойчивом каблуке из гладкой кожи.',
    description_en: 'Stylish ankle boots with stable heel made from smooth leather.',
    price: 21990,
    old_price: 27990,
    currency: 'RUB',
    images: ['https://images.unsplash.com/photo-1605733513597-f46a8a3a2e38?w=800', 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800'],
    category: 'women',
    tags: ['sale', 'premium'],
    stock_total: 3,
    stock_low_threshold: 5,
    sku: 'BB-W-AB-004',
    sizes: [
      { size: '36', stock: 1 },
      { size: '37', stock: 1 },
      { size: '38', stock: 1 },
      { size: '39', stock: 0 },
      { size: '40', stock: 0 },
    ],
    material_ru: '100% натуральная кожа',
    material_en: '100% genuine leather',
    color_ru: 'Бордовый',
    color_en: 'Burgundy',
  },
  {
    id: '5',
    name_ru: 'Мужские дерби',
    name_en: 'Men\'s Derby Shoes',
    description_ru: 'Универсальные дерби из высококачественной кожи для деловых и повседневных образов.',
    description_en: 'Versatile derby shoes from high-quality leather for business and casual looks.',
    price: 17490,
    currency: 'RUB',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800'],
    category: 'men',
    tags: [],
    stock_total: 25,
    stock_low_threshold: 5,
    sku: 'BB-M-DB-005',
    sizes: [
      { size: '40', stock: 5 },
      { size: '41', stock: 5 },
      { size: '42', stock: 6 },
      { size: '43', stock: 5 },
      { size: '44', stock: 4 },
    ],
    material_ru: 'Натуральная кожа',
    material_en: 'Genuine leather',
    color_ru: 'Черный',
    color_en: 'Black',
  },
  {
    id: '6',
    name_ru: 'Женские балетки',
    name_en: 'Women\'s Ballet Flats',
    description_ru: 'Элегантные балетки из мягкой кожи с декоративной отделкой.',
    description_en: 'Elegant ballet flats from soft leather with decorative trim.',
    price: 12990,
    currency: 'RUB',
    images: ['https://images.unsplash.com/photo-1603808033587-5f8d7a8cf4c7?w=800', 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=800'],
    category: 'women',
    tags: ['new'],
    stock_total: 30,
    stock_low_threshold: 5,
    sku: 'BB-W-BF-006',
    sizes: [
      { size: '36', stock: 6 },
      { size: '37', stock: 8 },
      { size: '38', stock: 7 },
      { size: '39', stock: 5 },
      { size: '40', stock: 4 },
    ],
    material_ru: 'Натуральная кожа',
    material_en: 'Genuine leather',
    color_ru: 'Бежевый',
    color_en: 'Beige',
  },
  {
    id: '7',
    name_ru: 'Кожаный ремень',
    name_en: 'Leather Belt',
    description_ru: 'Классический кожаный ремень с элегантной пряжкой.',
    description_en: 'Classic leather belt with elegant buckle.',
    price: 4990,
    currency: 'RUB',
    images: ['https://images.unsplash.com/photo-1624222247344-550fb60583c2?w=800'],
    category: 'accessories',
    tags: [],
    stock_total: 45,
    stock_low_threshold: 10,
    sku: 'BB-A-BL-007',
    sizes: [
      { size: '90', stock: 10 },
      { size: '95', stock: 12 },
      { size: '100', stock: 10 },
      { size: '105', stock: 8 },
      { size: '110', stock: 5 },
    ],
    material_ru: '100% натуральная кожа',
    material_en: '100% genuine leather',
    color_ru: 'Коричневый',
    color_en: 'Brown',
  },
  {
    id: '8',
    name_ru: 'Кожаный портфель',
    name_en: 'Leather Briefcase',
    description_ru: 'Вместительный портфель из премиальной кожи для деловых людей.',
    description_en: 'Spacious briefcase from premium leather for professionals.',
    price: 34990,
    old_price: 42990,
    currency: 'RUB',
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800', 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800'],
    category: 'accessories',
    tags: ['sale', 'premium'],
    stock_total: 8,
    stock_low_threshold: 5,
    sku: 'BB-A-BC-008',
    sizes: [
      { size: 'One Size', stock: 8 },
    ],
    material_ru: 'Премиальная итальянская кожа',
    material_en: 'Premium Italian leather',
    color_ru: 'Коричневый',
    color_en: 'Brown',
  },
];

export function getProductById(id: string): Product | undefined {
  return mockProducts.find(p => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  return mockProducts.filter(p => p.category === category);
}

export function getProductsByTag(tag: string): Product[] {
  return mockProducts.filter((p) => hasTag(p, tag));
}

export function getNewArrivals(): Product[] {
  return getProductsByTag('new');
}

export function getSaleProducts(): Product[] {
  return getProductsByTag('sale');
}
