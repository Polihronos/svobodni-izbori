// src/routes/api/map-stats/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals: { supabase } }) => {
	
	const { data, error } = await supabase.rpc('get_region_statistics');

	if (error) {
		console.error('Error fetching map statistics:', error);
		return json({ error: 'Failed to load map data' }, { status: 500 });
	}

	return json(data || []);
};