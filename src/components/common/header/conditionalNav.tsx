'use client';

import React from 'react';
import Navbar from './navbar';
import SecondNav from './secondNav';
import { usePathname } from 'next/navigation';

const ConditionalNav = () => {
	const pathName = usePathname();
	const homePages = ['/', '/find-work'];
	const isHomePage = homePages.includes(pathName);

	return <>{isHomePage ? <Navbar /> : <SecondNav />}</>;
};

export default ConditionalNav;
