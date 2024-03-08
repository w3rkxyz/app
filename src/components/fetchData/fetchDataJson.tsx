'use client';

import FindWork from '@/app/find-work/page';
import workData from '@/types/types';
import React, { useEffect, useState } from 'react';

const FetchData = async () => {
	try {
		const response = await fetch('/find-work.json');
		const jsonData = await response.json();
		// console.log('json data', jsonData);
		// setData(jsonData);
	} catch (error) {
		console.error('Error fetching data:', error);
	}

	const [data, setData] = useState<workData[]>([]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch('/find-work.json');
				const jsonData = await response.json();
				console.log('json data', jsonData);
				setData(jsonData);
			} catch (error) {
				console.error('Error fetching data:', error);
			}
		};

		fetchData();
	}, []);

	return data;
};

export { FetchData };
