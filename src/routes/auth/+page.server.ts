import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
  signup: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      console.error(error);
      throw redirect(303, '/auth/error');
    } else {
      throw redirect(303, '/');
    }
  },

 
  login: async ({ request, locals: { supabase }, url }) => {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error(error);
      throw redirect(303, '/auth/error');
    } else {
      throw redirect(303, '/');
    }
  },


  google: async ({ locals: { supabase }, url }) => {
    // Server-side Google OAuth
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        
        redirectTo: `${url.origin}/auth/callback`
      },
    });

    if (error) {
      console.error(error);
      throw redirect(303, '/auth/error');
    }

    if (data?.url) {
      throw redirect(303, data.url); // redirect user to Google consent screen
    }
  },
};