// src/routes/api/sections/[regionDbName]/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals: { supabase } }) => {
	const { regionDbName } = params;

	const { data, error } = await supabase
        .rpc('get_sections_by_region', { region_name_param: regionDbName });

	if (error) {
		console.error(`Error fetching sections for ${regionDbName}:`, error);
		return json({ error: 'Failed to load sections' }, { status: 500 });
	}

	return json(data || []);
};