import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals: { safeGetSession, supabase } }) => {
	const { session, user } = await safeGetSession();

	// Protect the route: if no user, redirect to login
	if (!session || !user) {
		redirect(303, '/auth');
	}

	// Fetch the user's violation and clean reports simultaneously
	const [violationsRes, cleanReportsRes] = await Promise.all([
		supabase
			.from('violations')
			.select('id, created_at, selected_violations, other_violation, sections(id, address, town)')
			.eq('reported_by', user.id)
			.order('created_at', { ascending: false }),
		supabase
			.from('clean_sections')
			.select('id, created_at, sections(id, address, town)')
			.eq('reported_by', user.id)
			.order('created_at', { ascending: false })
	]);

	if (violationsRes.error || cleanReportsRes.error) {
		console.error('Error fetching user reports:', violationsRes.error || cleanReportsRes.error);
		// Return empty arrays on failure
		return { violations: [], cleanReports: [] };
	}

	return {
		violations: violationsRes.data,
		cleanReports: cleanReportsRes.data
	};
};


export const actions: Actions = {
	deleteViolation: async ({ request, locals: { safeGetSession, supabase } }) => {
		const { session, user } = await safeGetSession();
		if (!session || !user) return fail(401, { error: 'Unauthorized' });

		const formData = await request.formData();
		const reportId = formData.get('reportId') as string;

		if (!reportId) return fail(400, { error: 'Missing report ID' });

		// The RLS policy already protects this, but an extra check is good practice
		const { error } = await supabase
			.from('violations')
			.delete()
			.eq('id', reportId)
			.eq('reported_by', user.id); // Ensures users can only delete their own

		if (error) {
			return fail(500, { error: 'Failed to delete report.' });
		}

		return { success: true };
	},

	deleteCleanReport: async ({ request, locals: { safeGetSession, supabase } }) => {
		const { session, user } = await safeGetSession();
		if (!session || !user) return fail(401, { error: 'Unauthorized' });

		const formData = await request.formData();
		const reportId = formData.get('reportId') as string;

		if (!reportId) return fail(400, { error: 'Missing report ID' });

		const { error } = await supabase
			.from('clean_sections')
			.delete()
			.eq('id', reportId)
			.eq('reported_by', user.id);

		if (error) {
			return fail(500, { error: 'Failed to delete report.' });
		}

		return { success: true };
	}
};