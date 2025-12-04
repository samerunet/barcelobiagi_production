"use client";

import React from "react";
import { useLanguage } from "../context/LanguageContext";
import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, Heart, Star } from "lucide-react";
import { getPrimaryImage, resolveImageUrl } from "../lib/images";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import {
	DEFAULT_HOMEPAGE_CATEGORIES,
	HomepageCategory,
} from "@/data/homepageCategories";
import {
	DEFAULT_HOMEPAGE_POPULAR,
	HomepagePopularItem,
} from "@/data/homepagePopular";
import { mapApiProducts } from "@/lib/productMapper";
import { Product } from "@/types";

export function Home() {
	const { language, t } = useLanguage();

	const [categories, setCategories] = React.useState<HomepageCategory[]>([]);
	const [popularItems, setPopularItems] = React.useState<HomepagePopularItem[]>(
		[]
	);
	const [homeLoading, setHomeLoading] = React.useState(true);
	const [featuredProducts, setFeaturedProducts] = React.useState<Product[]>([]);

	React.useEffect(() => {
		const loadHomepage = async () => {
			try {
				const res = await fetch("/api/settings?group=home", {
					cache: "no-store",
				});
				if (res.ok) {
					const data: Array<{ key: string; value: string }> = await res.json();
					const storedCategories = data.find(
						(s) => s.key === "home:categories"
					);
					const storedPopular = data.find((s) => s.key === "home:popular");

					const parsedCategories = storedCategories?.value
						? (JSON.parse(storedCategories.value) as HomepageCategory[])
						: null;
					const parsedPopular = storedPopular?.value
						? (JSON.parse(storedPopular.value) as HomepagePopularItem[])
						: null;

					setCategories(
						Array.isArray(parsedCategories) && parsedCategories.length
							? parsedCategories
							: DEFAULT_HOMEPAGE_CATEGORIES
					);
					setPopularItems(
						Array.isArray(parsedPopular) && parsedPopular.length
							? parsedPopular
							: DEFAULT_HOMEPAGE_POPULAR
					);
				} else {
					setCategories(DEFAULT_HOMEPAGE_CATEGORIES);
					setPopularItems(DEFAULT_HOMEPAGE_POPULAR);
				}
			} catch (error) {
				console.error("Failed to load homepage categories", error);
				setCategories(DEFAULT_HOMEPAGE_CATEGORIES);
				setPopularItems(DEFAULT_HOMEPAGE_POPULAR);
			} finally {
				setHomeLoading(false);
			}
		};
		const loadFeatured = async () => {
			try {
				const res = await fetch("/api/products?featured=true&take=8", {
					cache: "no-store",
				});
				if (res.ok) {
					const data = await res.json();
					setFeaturedProducts(mapApiProducts(data));
				}
			} catch (error) {
				console.error("Failed to load featured products", error);
			}
		};
		loadHomepage();
		loadFeatured();
	}, []);

	let productsToShow: HomepagePopularItem[] = [];
	if (!homeLoading) {
		if (popularItems.length) {
			productsToShow = popularItems;
		} else {
			productsToShow = featuredProducts.map((p) => ({
				id: p.id,
				titleRu: p.name_ru,
				titleEn: p.name_en,
				price: p.price,
				oldPrice: p.old_price ?? undefined,
				image: resolveImageUrl(getPrimaryImage(p) || ""),
				link: `/product/${p.id}`,
			}));
		}
	}

	return (
		<div className='min-h-screen bg-white'>
			{/* Categories Grid */}
			<section className='py-12 md:py-16'>
				<div className='container mx-auto px-4'>
					<div className='flex items-center justify-between mb-6'>
						<h2>{t("Категории", "Categories")}</h2>
					</div>
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'>
						{(homeLoading ? [] : categories).map((category, index) => (
							<Link
								key={category.id ?? index}
								to={category.link}
								className='group relative aspect-[4/5] overflow-hidden rounded-xl card-hover'
							>
								<ImageWithFallback
									src={category.image}
									alt={language === "ru" ? category.nameRu : category.nameEn}
									className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
								/>
								<div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent'></div>
								<div className='absolute bottom-0 left-0 right-0 p-6'>
									{category.badgeRu && (
										<span className='inline-block px-3 py-1 bg-accent text-white text-xs font-bold rounded-full mb-3'>
											{language === "ru" ? category.badgeRu : category.badgeEn}
										</span>
									)}
									<h3 className='text-white mb-1'>
										{language === "ru" ? category.nameRu : category.nameEn}
									</h3>
									<div className='flex items-center gap-2 text-white/80 text-sm'>
										{t("Смотреть", "View")}
										<ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
									</div>
								</div>
							</Link>
						))}
					</div>
				</div>
			</section>

			{/* Featured/Popular Products */}
			<section className='py-12 md:py-16 bg-gray-50'>
				<div className='container mx-auto px-4'>
					<div className='flex items-center justify-between mb-6'>
						<h2>{t("Популярные товары", "Featured Products")}</h2>
						<Link
							to='/category/all'
							className='text-sm font-medium text-primary hover:text-primary-dark flex items-center gap-1'
						>
							{t("Все товары", "View All")}
							<ArrowRight className='w-4 h-4' />
						</Link>
					</div>

					<div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6'>
						{productsToShow.map((item) => {
							const discount =
								item.oldPrice && item.oldPrice > item.price
									? Math.round(
											((item.oldPrice - item.price) / item.oldPrice) * 100
									  )
									: 0;
							return (
								<div key={item.id} className='group card card-hover'>
									{/* Image */}
									<div className='relative aspect-square overflow-hidden bg-gray-100'>
										<ImageWithFallback
											src={item.image}
											alt={language === "ru" ? item.titleRu : item.titleEn}
											className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
										/>
										{discount > 0 && (
											<span className='absolute top-2 left-2 badge-sale'>
												-{discount}%
											</span>
										)}
										<button className='absolute top-2 right-2 p-2 bg-white/90 hover:bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity'>
											<Heart className='w-4 h-4 text-gray-700' />
										</button>
									</div>

							{/* Info */}
							<div className='p-3 md:p-4'>
								<h4 className='text-sm font-medium text-gray-900 mb-1 line-clamp-2'>
									{language === "ru" ? item.titleRu : item.titleEn}
								</h4>
										<p className='text-xs text-gray-500 mb-2 capitalize'>—</p>
										<div className='flex items-center justify-between'>
											<div>
												<p className='text-lg font-bold text-gray-900'>
													{item.price.toLocaleString("ru-RU")} ₽
												</p>
												{item.oldPrice && (
													<p className='text-xs text-gray-400 line-through'>
														{item.oldPrice.toLocaleString("ru-RU")} ₽
													</p>
												)}
											</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</section>

			{/* Features */}
			<section className='py-12 md:py-16 border-t border-gray-200'>
				<div className='container mx-auto px-4'>
					<div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
						<div className='text-center'>
							<div className='inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4'>
								<TrendingUp className='w-6 h-6 text-primary' />
							</div>
							<h4 className='mb-2'>
								{t("Премиальное качество", "Premium Quality")}
							</h4>
							<p className='text-sm text-gray-600'>
								{t(
									"Натураьная кожа и европейское качество с 1987 года",
									"Genuine leather and European quality since 1987"
								)}
							</p>
						</div>

						<div className='text-center'>
							<div className='inline-flex items-center justify-center w-12 h-12 bg-success/10 rounded-full mb-4'>
								<Star className='w-6 h-6 text-success' />
							</div>
							<h4 className='mb-2'>{t("Гарантия", "Quality Guarantee")}</h4>
							<p className='text-sm text-gray-600'>
								{t(
									"Официальная гарантия на всю продукцию",
									"Official warranty on all products"
								)}
							</p>
						</div>

						<div className='text-center'>
							<div className='inline-flex items-center justify-center w-12 h-12 bg-accent/10 rounded-full mb-4'>
								<Heart className='w-6 h-6 text-accent' />
							</div>
							<h4 className='mb-2'>
								{t("Бесплатная доставка", "Free Shipping")}
							</h4>
							<p className='text-sm text-gray-600'>
								{t("Бесплатная оставка по Иваново", "Free delivery in Ivanovo")}
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Store Info */}
			<section className='py-12 md:py-16 bg-gray-900 text-white'>
				<div className='container mx-auto px-4 text-center'>
					<h2 className='text-white mb-4'>
						{t("Посетите наш магазин", "Visit Our Store")}
					</h2>
					<p className='text-gray-300 mb-6 max-w-2xl mx-auto'>
						{t(
							"ТРЦ «Серебряный город», г. Иваново, ул. 8 Марта, 32",
							"Serebryany Gorod Mall, Ivanovo, 8 Marta St., 32"
						)}
					</p>
					<Link
						to='/stores'
						className='inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors'
					>
						{t("Подробнее", "Learn More")}
						<ArrowRight className='w-4 h-4' />
					</Link>
				</div>
			</section>
		</div>
	);
}
