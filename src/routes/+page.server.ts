import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	// 1. Fetch the dynamic data from our API endpoint
	const response = await fetch('/api/map-data');
	const mapData = await response.json();

	// 2. Import the static data (SVG paths) from the local file
	// NOTE: Adjust this path if your regions.ts file is located elsewhere
	const { regions } = await import('$lib/data/regions');

	// 3. Return all three required props to the page
	return {
		regionStats: mapData.regionStats,
		sectionsByRegion: mapData.sectionsByRegion,
		staticRegions: regions
	};
};