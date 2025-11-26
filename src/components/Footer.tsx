"use client";

import React from "react";
import { useLanguage } from "../context/LanguageContext";
import { Link, useLocation } from "react-router-dom";
import { MapPin, Phone, Mail, Instagram, Facebook } from "lucide-react";
import logoIcon from "../assets/777b89e0a4797ae4eae9d495c7db18fa9990282d.png";

export function Footer() {
	const { language, t } = useLanguage();
	const location = useLocation();
	const pathname = location.pathname ?? "";
	const logoSrc =
		typeof logoIcon === "string" ? logoIcon : (logoIcon as { src: string }).src;

	// Hide footer on admin pages
	if (pathname.startsWith("/admin")) {
		return null;
	}

	const footerSections = [
		{
			title_ru: "Покупателям",
			title_en: "Customers",
			links: [
				{ label_ru: "Доставка", label_en: "Shipping", path: "/shipping" },
				{ label_ru: "Возврат товара", label_en: "Returns", path: "/returns" },
				{ label_ru: "Оплата", label_en: "Payment", path: "/payment" },
				{
					label_ru: "Размерная сетка",
					label_en: "Size Guide",
					path: "/size-guide",
				},
			],
		},
		// {
	];

	return (
		<footer className='bg-charcoal text-white mt-auto'>
			<div className='container mx-auto px-6 py-16'>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16'>
					{/* Brand */}
					<div className='lg:col-span-1'>
						<Link to='/' className='flex items-center gap-3 mb-6 group'>
							<div className='w-12 h-12 transition-transform group-hover:scale-110'>
								<img
									src={logoSrc}
									alt='Barcelo Biagi'
									className='w-full h-full object-contain drop-shadow-lg'
								/>
							</div>
							<div>
								<span className='font-semibold text-xl'>BARCELO BIAGI</span>
								<p className='text-accent-camel text-xs tracking-wider -mt-0.5'>
									{t("ИВАНОВО", "IVANOVO")}
								</p>
							</div>
						</Link>
						<p className='text-white/60 text-sm leading-relaxed mb-4'>
							{t(
								"Европейская кожаная обувь и аксессуары премиум-класса.",
								"Premium European leather footwear and accessories."
							)}
						</p>
						<p className='text-accent-camel text-xs font-medium tracking-widest uppercase'>
							Brand of Spain Since 1987
						</p>
					</div>

					{/* Footer Links */}
					{footerSections.map((section, index) => (
						<div key={index}>
							<h4 className='text-white font-semibold mb-6 text-sm uppercase tracking-wider'>
								{language === "ru" ? section.title_ru : section.title_en}
							</h4>
							<ul className='space-y-3'>
								{section.links.map((link, linkIndex) => (
									<li key={linkIndex}>
										<Link
											to={link.path}
											className='text-white/60 text-sm hover:text-accent-camel transition-colors inline-block'
										>
											{language === "ru" ? link.label_ru : link.label_en}
										</Link>
									</li>
								))}
							</ul>
						</div>
					))}

					{/* Contact */}
					<div>
						<h4 className='text-white font-semibold mb-6 text-sm uppercase tracking-wider'>
							{t("Контакты", "Contact")}
						</h4>
						<ul className='space-y-4 text-sm'>
							<li className='flex items-start gap-3'>
								<MapPin
									size={18}
									className='text-accent-camel flex-shrink-0 mt-0.5'
								/>
								<div className='text-white/60 leading-relaxed'>
									<p>{t("ТРЦ «Сереряный город»", "Serebryany Gorod Mall")}</p>
									<p>
										{t(
											"г. Иваново, ул. 8 Марта, 32",
											"Ivanovo, 8 Marta St., 32"
										)}
									</p>
								</div>
							</li>
							<li className='flex items-center gap-3'>
								<Phone size={18} className='text-accent-camel flex-shrink-0' />
								<a
									href='tel:+74932123456'
									className='text-white/60 hover:text-accent-camel transition-colors'
								>
									+7 (4932) 12-34-56
								</a>
							</li>
							<li className='flex items-center gap-3'>
								<Mail size={18} className='text-accent-camel flex-shrink-0' />
								<a
									href='mailto:ivanovo@barcelobiagi.ru'
									className='text-white/60 hover:text-accent-camel transition-colors'
								>
									ivanovo@barcelobiagi.ru
								</a>
							</li>
						</ul>
					</div>

					{/* Social Media */}
					<div>
						<h4 className='text-white font-semibold mb-6 text-sm uppercase tracking-wider'>
							{t("Социальные сети", "Social Media")}
						</h4>
						<ul className='space-y-4 text-sm'>
							<li className='flex items-center gap-3'>
								<Instagram
									size={18}
									className='text-accent-camel flex-shrink-0'
								/>
								<a
									href='https://www.instagram.com/barcelobiagi/'
									target='_blank'
									rel='noopener noreferrer'
									className='text-white/60 hover:text-accent-camel transition-colors'
								>
									@barcelobiagi
								</a>
							</li>
							<li className='flex items-center gap-3'>
								<Facebook
									size={18}
									className='text-accent-camel flex-shrink-0'
								/>
								<a
									href='https://www.facebook.com/barcelobiagi/'
									target='_blank'
									rel='noopener noreferrer'
									className='text-white/60 hover:text-accent-camel transition-colors'
								>
									@barcelobiagi
								</a>
							</li>
						</ul>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className='border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6'>
					<div className='text-white/40 text-xs space-y-2'>
						<p>
							© 2025 Barcelo Biagi Ivanovo.{" "}
							{t("Все права защищены.", "All rights reserved.")}
						</p>
						<p>Design by Hollywood Style LLC. All rights reserved.</p>
					</div>
					<div className='flex flex-wrap gap-6 text-xs'>
						<Link
							to='/privacy'
							className='text-white/60 hover:text-accent-camel transition-colors'
						>
							{t("Политика конфиденциальности", "Privacy Policy")}
						</Link>
						<Link
							to='/terms'
							className='text-white/60 hover:text-accent-camel transition-colors'
						>
							{t("Условия использования", "Terms of Use")}
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}
