export type HomepageCategory = {
  id: string;
  nameRu: string;
  nameEn: string;
  image: string;
  link: string;
  badgeRu?: string;
  badgeEn?: string;
};

export const DEFAULT_HOMEPAGE_CATEGORIES: HomepageCategory[] = [
  {
    id: '1',
    nameRu: 'Мужская обувь',
    nameEn: "Men's Shoes",
    image:
      'https://images.unsplash.com/photo-1758387813660-1ae7497ace27?w=1200&auto=format&fit=crop',
    link: '/category/men',
    badgeRu: 'Хит',
    badgeEn: 'Trending',
  },
  {
    id: '2',
    nameRu: 'Женская обувь',
    nameEn: "Women's Shoes",
    image:
      'https://images.unsplash.com/photo-1667862714309-359b48ec1f1d?w=1200&auto=format&fit=crop',
    link: '/category/women',
  },
  {
    id: '3',
    nameRu: 'Аксессуары',
    nameEn: 'Accessories',
    image:
      'https://images.unsplash.com/photo-1760302318620-261f5e4d1940?w=1200&auto=format&fit=crop',
    link: '/category/accessories',
    badgeRu: 'Новое',
    badgeEn: 'New',
  },
  {
    id: '4',
    nameRu: 'Детская обувь',
    nameEn: "Kids' Shoes",
    image:
      'https://images.unsplash.com/photo-1514090458221-30c4d1c8f82f?w=1200&auto=format&fit=crop',
    link: '/category/kids',
  },
  {
    id: '5',
    nameRu: 'Сумки',
    nameEn: 'Bags',
    image:
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200&auto=format&fit=crop',
    link: '/category/bags',
  },
  {
    id: '6',
    nameRu: 'Спортивная обувь',
    nameEn: 'Sport Shoes',
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop',
    link: '/category/sport',
  },
  {
    id: '7',
    nameRu: 'Офисная обувь',
    nameEn: 'Office Shoes',
    image:
      'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=1200&auto=format&fit=crop',
    link: '/category/office',
    badgeRu: 'Популярно',
    badgeEn: 'Popular',
  },
  {
    id: '8',
    nameRu: 'Сезонная коллекция',
    nameEn: 'Seasonal Collection',
    image:
      'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=1200&auto=format&fit=crop',
    link: '/category/seasonal',
    badgeRu: '-40%',
    badgeEn: '-40%',
  },
];
