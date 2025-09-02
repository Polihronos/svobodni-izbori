// // src/routes/api/map-data/+server.ts
// import { json } from '@sveltejs/kit';
// import type { RequestHandler } from './$types';

// export const GET: RequestHandler = async ({ locals: { supabase } }) => {
//     // 1. Get the statistics for coloring the regions (same as before)
//     const { data: regionStats, error: statsError } = await supabase.rpc('get_region_statistics');

//     if (statsError) {
//         console.error('Error fetching map statistics:', statsError);
//         return json({ error: 'Failed to load map stats' }, { status: 500 });
//     }

//     // 2. Get all sections grouped by region and then by town
//     const { data: allSections, error: sectionsError } = await supabase
// 		.from('sections')
// 		.select('id, region_name, town, address, video')
// 		.limit(20000);

//     if (sectionsError) {
//         console.error('Error fetching sections for map:', sectionsError);
//         return json({ error: 'Failed to load map sections' }, { status: 500 });
//     }

//     // 3. Process the raw section data into a nested structure for easy use on the frontend
//     const sectionsByRegion = allSections.reduce((acc, section) => {
//         const { region_name, town } = section;
//         if (!acc[region_name]) {
//             acc[region_name] = { towns: {} };
//         }
//         if (!acc[region_name].towns[town]) {
//             acc[region_name].towns[town] = [];
//         }
//         acc[region_name].towns[town].push(section);
//         return acc;
//     }, {} as Record<string, { towns: Record<string, any[]> }>);

//     // 4. Return both datasets in one payload

//     console.log('Generated API Keys:', Object.keys(sectionsByRegion));

//     return json({
//         regionStats: regionStats || [],
//         sectionsByRegion: sectionsByRegion
//     });
// };

// src/routes/api/map-data/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals: { supabase } }) => {
	// 1. Get ONLY the statistics for coloring the regions.
	const { data: regionStats, error } = await supabase.rpc('get_region_statistics');

	if (error) {
		console.error('Error fetching map statistics:', error);
		return json({ error: 'Failed to load map stats' }, { status: 500 });
	}

	// 2. Return ONLY this small dataset.
	return json({
		regionStats: regionStats || []
	});
};