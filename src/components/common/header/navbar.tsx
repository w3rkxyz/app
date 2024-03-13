'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Navbar = () => {
	const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

	const handleMobileMenuToggle = () => {
		setMobileMenuOpen(!isMobileMenuOpen);
	};

	const closeMobileMenu = () => {
		setMobileMenuOpen(false);
	};
	return (
		<header className="header-section py-[42px] sm:py-[16px] absolute w-full top-0 left-0">
			<div className="custom-container">
				<div className="header-wrapper">
					<nav className="navbar-nav-main flex items-center gap-3 sm:justify-between w-full">
						<div className="header-brand-box sm:flex sm:items-center sm:gap-6">
							<div
								className="navbar-trigger hidden sm:block"
								onClick={handleMobileMenuToggle}
							>
								<Image
									src="/images/header-trigger.svg"
									alt="navbar trigger"
									width={20}
									height={12}
								/>
							</div>
							<a href="/">
								<Image
									src="/images/brand-logo.svg"
									className="sm:hidden"
									width={135}
									height={47}
									alt="company brand logo"
								></Image>
								<Image
									src="/images/brand-logo.svg"
									className="hidden sm:block"
									width={69}
									height={24}
									alt="company brand logo"
								/>
							</a>
						</div>
						<div className="navbar-right-cont flex items-center flex-1">
							<ul className="navbar-nav flex items-center sm:hidden ml-auto">
								<li className="navbar-nav-items">
									<a href="/" className="px-5 py-3">
										Home
									</a>
								</li>
								<li className="navbar-nav-items">
									<Link
										href="/find-work"
										className="px-5 py-3"
									>
										Find Work
									</Link>
								</li>
								<li className="navbar-nav-items">
									<Link
										href="/find-talent"
										className="px-5 py-3"
									>
										Find Talent
									</Link>
								</li>
							</ul>
							<button
								className="button-primary ml-auto"
								type="button"
							>
								Connect Wallet
							</button>
						</div>
					</nav>
					<div
						className={`mobile-menu absolute top-0 left-0 z-[99999] px-8 pt-4 pb-8 rounded-br-[10px] bg-white ${
							isMobileMenuOpen ? 'open-menu' : ''
						}`}
					>
						<button
							className="close-trigger ml-auto w-[16px] block cursor-pointer h-[16px] relative right-[-16px]"
							onClick={closeMobileMenu}
						>
							<Image
								src="/images/Close.svg"
								alt="navbar trigger close"
								width={16}
								height={16}
							/>
						</button>
						<div className="navbar-right-cont">
							<ul className="navbar-nav">
								<li className="navbar-nav-items block">
									<a
										href="/"
										className="py-4 border-b border-b-[#00000010] block text-dark !text-left"
									>
										Home
									</a>
								</li>
								<li className="navbar-nav-items block">
									<a
										href="/"
										className="py-4 border-b border-b-[#00000010] block text-dark !text-left"
									>
										Find Work
									</a>
								</li>
								<li className="navbar-nav-items block">
									<a
										href="/"
										className="py-4 border-b border-b-[#00000010] block text-dark !text-left"
									>
										Find Talent
									</a>
								</li>
							</ul>
							<button
								className="button-primary mt-4"
								type="button"
							>
								Connect Wallet
							</button>
						</div>
					</div>
				</div>
			</div>
		</header>
	);
};

export default Navbar;
