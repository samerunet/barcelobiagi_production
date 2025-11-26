export type HomepagePopularItem = {
  id: string;
  titleRu: string;
  titleEn: string;
  price: number;
  oldPrice?: number | null;
  image: string;
  link: string;
  productId?: string;
};

export const DEFAULT_HOMEPAGE_POPULAR: HomepagePopularItem[] = [
  {
    id: 'p1',
    titleRu: 'Классические дерби',
    titleEn: 'Classic Derby Shoes',
    price: 12990,
    oldPrice: 15990,
    image:
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1200&auto=format&fit=crop',
    link: '/product/p1',
  },
  {
    id: 'p2',
    titleRu: 'Женские лоферы',
    titleEn: 'Women Loafers',
    price: 11990,
    oldPrice: null,
    image:
      'https://images.unsplash.com/photo-1475180098004-ca77a66827be?w=1200&auto=format&fit=crop',
    link: '/product/p2',
  },
  {
    id: 'p3',
    titleRu: 'Кроссовки премиум',
    titleEn: 'Premium Sneakers',
    price: 13990,
    oldPrice: 16990,
    image:
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1200&auto=format&fit=crop',
    link: '/product/p3',
  },
  {
    id: 'p4',
    titleRu: 'Кожаные ботинки',
    titleEn: 'Leather Boots',
    price: 14990,
    oldPrice: null,
    image:
      'https://images.unsplash.com/photo-1549298916-f52d724204b4?w=1200&auto=format&fit=crop',
    link: '/product/p4',
  },
  {
    id: 'p5',
    titleRu: 'Минималистичные кеды',
    titleEn: 'Minimal Sneakers',
    price: 9990,
    oldPrice: null,
    image:
      'https://images.unsplash.com/photo-1549298916-ef5d5eb8f9b2?w=1200&auto=format&fit=crop',
    link: '/product/p5',
  },
  {
    id: 'p6',
    titleRu: 'Броги',
    titleEn: 'Classic Brogues',
    price: 13490,
    oldPrice: 14990,
    image:
      'https://images.unsplash.com/photo-1514986888952-8cd320577b68?w=1200&auto=format&fit=crop',
    link: '/product/p6',
  },
  {
    id: 'p7',
    titleRu: 'Сумка-тоут',
    titleEn: 'Leather Tote Bag',
    price: 8990,
    oldPrice: null,
    image:
      'https://images.unsplash.com/photo-1622560480615-d83c853bc5c3?w=1200&auto=format&fit=crop',
    link: '/product/p7',
  },
  {
    id: 'p8',
    titleRu: 'Кеды high-top',
    titleEn: 'High-top Sneakers',
    price: 10990,
    oldPrice: 12990,
    image:
      'https://images.unsplash.com/photo-1549298916-33352e8e3897?w=1200&auto=format&fit=crop',
    link: '/product/p8',
  },
];
