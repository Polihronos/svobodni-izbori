import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals: { safeGetSession, supabase } }) => {
  const id = params.id;

  const { error: rpcError } = await supabase.rpc('increment_view_count', { section_id_param: id });

  if (rpcError) {
    
    console.error(`Error incrementing view count for section ${id}:`, rpcError);
  }

  const { data: sectionData, error: sectionError } = await supabase
    .from('sections')
    .select(`
      *,
      violations ( * ),
      clean_sections ( * )
    `)
    .eq('id', id)
    .single();

  if (sectionError || !sectionData) {
    throw new Error('Section not found');
  }

  const { session, user } = await safeGetSession();

  return {
    section: sectionData,
    id,
    session,
    user
  };
};

export const actions: Actions = {
  submitReport: async ({ request, locals: { safeGetSession, supabase }, params }) => {
    const { session, user } = await safeGetSession();


    // Check if user is authenticated
    if (!session || !user) {
      return fail(401, { error: 'Трябва да сте влезли в профила си за да докладвате нарушения' });
    }

    const formData = await request.formData();
    const sectionId = params.id;

    // Extract form data
    const otherViolation = formData.get('otherViolation') as string || '';

    // Extract selected violations from checkboxes
    const selectedViolations: string[] = [];
    const standardViolations = [
      'Липсва видеозапис на преброяването',
      'Видеозапис е кратък (под 60 минути) и не отразява целия процес по преброяването',
      'Камерата няма ясна видимост към масата с бюлетините или има хора пред нея',
      'Вижда се, че част от бюлетини излизат извън обсега на камерата (и не се знае какво се случва с тях)',
      'Хартиените бюлетини не се вадят една по една от урната',
      'Машинните бюлетини не се вадят една по една от урната',
      'Има повече от един химикал на масата с бюлетините и/или в ръцете на хората около масата',
      'Бюлетините не се броят от един човек',
      'При преброяването им, бюлетините не се показват пред камерата',
      'Ако се показват пред камерата, бюлетините не са ясно видими',
      'Пише се по бюлетините по време на броенето',
      'НЕ се обяснява защо дадена бюлетина е невалидна',
      'Цитират се брой гласове за дадена партия, които се разминават с отразените в протокола',
      'Вижда се унищожаване на бюлетини или части от тях (отрязъци)',
      'На записа не се вижда членовете на комисията да подписват протокола',
      'Влизат или излизат хора от секцията по време на броенето'
    ];

    // Check which violations were selected
    standardViolations.forEach((violation, index) => {
      if (formData.get(`violation-${index}`) === 'on') {
        selectedViolations.push(violation);
      }
    });

    // Validate that at least one violation is selected or other violation is provided
    if (selectedViolations.length === 0 && !otherViolation.trim()) {
      return fail(400, {
        error: 'Моля изберете поне едно нарушение или опишете друго нарушение',
        formData: Object.fromEntries(formData)
      });
    }

    try {
      const { error } = await supabase
        .from('violations')
        .insert({
          section_id: sectionId,
          selected_violations: selectedViolations,
          other_violation: otherViolation.trim(),
          reported_by: user.id,
          reporter_email: user.email

        });

      if (error) {
        console.error('Database error:', error);
        return fail(500, {
          error: 'Грешка при записване в базата данни. Моля опитайте отново.',
          formData: Object.fromEntries(formData)
        });
      }

      if (!error) {
      // If the report was successful, award points
      await supabase.rpc('add_points', { points_to_add: 1000 });
      return { success: true, message: 'Докладът за нарушение беше изпратен успешно!' };
    }

    } catch (err) {
      console.error('Unexpected error:', err);
      return fail(500, {
        error: 'Неочаквана грешка. Моля опитайте отново.',
        formData: Object.fromEntries(formData)
      });
    }
  },


  markAsClean: async ({ locals: { safeGetSession, supabase }, params }) => {
    const { session, user } = await safeGetSession();

    if (!session || !user) {
      return fail(401, { error: 'Трябва да сте влезли в профила си.' });
    }

    const sectionId = params.id;

    const { error } = await supabase
      .from('clean_sections')
      .insert({
        section_id: sectionId,
        reported_by: user.id,
        reporter_email: user.email
      });

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return fail(409, { error: 'Вече сте маркирали тази секция като чиста.' });
      }
      return fail(500, { error: 'Грешка при записване в базата данни.' });
    }

    if (!error) {
        // If marking as clean was successful, award points
        await supabase.rpc('add_points', { points_to_add: 1000 });
        return { success: true, message: 'Секцията е маркирана като чиста!' };
    }
  }

};

