'use client';

import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { Search, User, ShoppingBag, Menu, X, Heart } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import logoIcon from '../assets/777b89e0a4797ae4eae9d495c7db18fa9990282d.png';
import { useFavorites } from '@/context/FavoritesContext';

export function Header() {
  const { language, setLanguage, t } = useLanguage();
  const { getTotalItems, setCartOpen } = useCart();
  const { favorites } = useFavorites();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const logoSrc = typeof logoIcon === 'string' ? logoIcon : (logoIcon as { src: string }).src;

  // Hide header on admin pages
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    { label_ru: 'Главная', label_en: 'Home', path: '/' },
    { label_ru: 'Мужчинам', label_en: 'Men', path: '/category/men' },
    { label_ru: 'Женщинам', label_en: 'Women', path: '/category/women' },
    { label_ru: 'Премиум', label_en: 'Premium', path: '/category/premium' },
    { label_ru: 'Новинки', label_en: 'New Arrivals', path: '/category/new' },
    { label_ru: 'Акции', label_en: 'Sale', path: '/category/sale', highlight: true },
    { label_ru: 'Аксессуары', label_en: 'Accessories', path: '/category/accessories' },
  ];

  const totalItems = getTotalItems();

  return (
    <header className="sticky top-0 z-50 modern-navbar">
      {/* Main Navbar */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
        <Link href="/" className="flex items-center gap-2 md:gap-3 group flex-shrink-0">
            <div className="w-10 h-10 md:w-12 md:h-12 transition-transform duration-300 group-hover:scale-105">
              <img 
                src={logoSrc} 
                alt="Barcelo Biagi" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-gray-900 font-bold text-base md:text-lg tracking-tight">
                BARCELO BIAGI
              </span>
              <span className="text-brand-camel text-[9px] md:text-[10px] tracking-widest uppercase hidden sm:block">
                Brand of Spain Since 1987
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
              href={item.path as any}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                  item.highlight
                    ? 'text-error'
                    : pathname === item.path
                    ? 'text-primary'
                    : 'text-gray-700'
                }`}
              >
                {language === 'ru' ? item.label_ru : item.label_en}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
              className="px-2 md:px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
            >
              {language.toUpperCase()}
            </button>

            {/* Admin Access - Temporary visible button */}
            <Link
              href="/admin/login"
              className="hidden md:flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-error hover:text-error/80 hover:bg-error/5 rounded-lg transition-colors"
            >
              Admin
            </Link>

            {/* Search */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!searchTerm.trim()) return;
                router.push(`/category/all?search=${encodeURIComponent(searchTerm.trim())}`);
                setSearchTerm('');
                setMobileMenuOpen(false);
              }}
              className="hidden md:flex items-center bg-gray-100 rounded-full px-3 py-1.5 border border-gray-200 focus-within:border-primary focus-within:bg-white transition-all"
            >
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('Поиск...', 'Search...')}
                className="bg-transparent outline-none text-sm ml-2 w-40"
              />
            </form>
            {/* Mobile search icon */}
            <button
              className="md:hidden p-2 text-gray-700 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => {
                if (!searchTerm.trim()) return;
                router.push(`/category/all?search=${encodeURIComponent(searchTerm.trim())}`);
                setSearchTerm('');
                setMobileMenuOpen(false);
              }}
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <button
              className="hidden sm:flex relative p-2 text-gray-700 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => (window.location.href = '/favorites')}
              title={t('Избранное', 'Favorites')}
            >
              <Heart className="w-5 h-5" />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </button>

            {/* Account */}
            <Link
              href="/dashboard"
              className="p-2 text-gray-700 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 text-gray-700 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <nav className="container mx-auto px-4 py-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path as any}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  item.highlight
                    ? 'text-error bg-error/5'
                    : pathname === item.path
                    ? 'text-primary bg-primary/5'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {language === 'ru' ? item.label_ru : item.label_en}
              </Link>
            ))}
            
            {/* Admin Access in Mobile Menu */}
            <Link
              href="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-lg text-sm font-medium text-error bg-error/5 hover:bg-error/10 transition-colors border-t border-gray-200 mt-2 pt-3"
            >
              Admin Panel
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
