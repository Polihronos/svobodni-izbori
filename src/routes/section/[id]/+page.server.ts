import type { PageServerLoad, Actions } from './$types';
import { regions } from '$lib/data/regions';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals: { safeGetSession, supabase } }) => {
  const id = params.id;

  let section: any = null;
  let regionName = '';
  let town = '';

  // Find the section in the regions data
  for (const region of regions) {
    const sec = region.sections?.[id];
    if (sec) {
      section = sec;
      regionName = region.name;
      town = sec.town;
      break;
    }
  }

  if (!section) {
    throw new Error('Section not found');
  }

  // Get session for authentication state
  const { session, user } = await safeGetSession();
  console.log('🔍 Fetching violations for section_id:', id);

  // Fetch existing violation reports for this section (available to everyone)
  let existingReports: any[] = [];
  const { data: reports, error } = await supabase
    .from('violations')
    .select(`
      *
    `)
    .eq('section_id', id)
    .order('created_at', { ascending: false });

    
    console.log('📊 Database query result:', { data: reports, error });
console.log('📈 Number of reports found:', reports?.length || 0);



  if (!error && reports) {
    existingReports = reports;
  } else if (error) {
    console.error('Error fetching violations:', error);
    // If there's an RLS error, we'll still return empty array
    existingReports = [];
  }
console.log('📤 Returning existingReports:', existingReports);
  return { 
    section, 
    regionName, 
    town, 
    id,
    session,
    user,
    existingReports
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
    const regionName = formData.get('regionName') as string;
    const town = formData.get('town') as string;
    const sectionAddress = formData.get('sectionAddress') as string;
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
      // Insert the violation report into the database
      const { error } = await supabase
        .from('violations')
        .insert({
          section_id: sectionId,
          region_name: regionName,
          town: town,
          section_address: sectionAddress,
          selected_violations: selectedViolations,
          other_violation: otherViolation.trim(),
          reported_by: user.id,
          reporter_email: user.email,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Database error:', error);
        return fail(500, { 
          error: 'Грешка при записване в базата данни. Моля опитайте отново.',
          formData: Object.fromEntries(formData)
        });
      }

      return { success: true, message: 'Докладът за нарушение беше изпратен успешно!' };

    } catch (err) {
      console.error('Unexpected error:', err);
      return fail(500, { 
        error: 'Неочаквана грешка. Моля опитайте отново.',
        formData: Object.fromEntries(formData)
      });
    }
  }
};
