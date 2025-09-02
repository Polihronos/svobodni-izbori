// src/routes/api/search/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
	// Get the search query from the URL, e.g., /api/search?q=София
	const query = url.searchParams.get('q');

	// Basic validation: return empty if the query is too short
	if (!query || query.length < 2) {
		return json([]);
	}

	// The search pattern for case-insensitive "contains" search
	const searchPattern = `%${query}%`;

	// Perform the search in the database across multiple columns
	const { data, error } = await supabase
		.from('sections')
		.select('id, region_name, town, address, video')
		.or(
			`town.ilike.${searchPattern},` +
			`address.ilike.${searchPattern},` +
			`region_name.ilike.${searchPattern},` +
			`id.like.${searchPattern}` // Use .like for the ID as well
		)
		.limit(20);

	if (error) {
		console.error('Search API error:', error);
		return json({ error: 'Database search failed' }, { status: 500 });
	}

	return json(data || []);
};