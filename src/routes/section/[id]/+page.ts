// src/routes/section/[id]/+page.ts
import type { PageLoad } from './$types';
import { regions } from '$lib/data/regions';

export const load: PageLoad = async ({ params }) => {
  const id = params.id;

  let section: any = null;
  let regionName = '';
  let town = '';

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

  return { section, regionName, town, id };
};