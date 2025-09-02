import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals: { safeGetSession, supabase }, cookies }) => {
  const { session, user } = await safeGetSession()

  let profile = null;

  if (user) {
    // If the user is logged in, fetch their points
    const { data } = await supabase.from('user_profiles').select('points').single();
    profile = data;
  }

  return {
    session,
    profile,
    cookies: cookies.getAll(),
  }
}