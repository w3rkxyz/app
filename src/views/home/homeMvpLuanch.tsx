import React from 'react';
import TopPicks from '@/components/TopPicks/TopPicks';
import HomeBanner from '@/components/banner/home-banner';
import CtaSection from '@/components/cta-section/cta';
import OurTechnology from '@/components/our-technology/our-technology';
import LatestOpportunities from '@/components/LatestOpportunity/LatestOpportunities';

const HomeMvpLaunch = () => {
	return (
		<div>
			<HomeBanner />
			<OurTechnology />
			<TopPicks />
			<LatestOpportunities />
			<CtaSection />
		</div>
	);
};

export default HomeMvpLaunch;
