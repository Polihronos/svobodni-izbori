import type { PageLoad } from './$types';
import { regions } from '$lib/data/regions';
import type { Region } from '$lib/data/regions';

export const load: PageLoad<{ regions: Region[] }> = async () => {
  return {
    regions
  };
};