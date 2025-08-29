<script lang="ts">
  import type { Region } from '$lib/data/regions';

  
  export let data: { regions: Region[] };

  let regions: Region[] = data.regions;
  let selectedRegionId: string | null = null;
  let expandedTowns: Record<string, boolean> = {};

  function toggleRegion(id: string) {
    selectedRegionId = selectedRegionId === id ? null : id;
  }

  function toggleTown(town: string) {
    expandedTowns[town] = !expandedTowns[town];
  }
</script>

<div class="flex flex-col items-center p-4 space-y-4">
  {#each regions as region (region.id)}
    <div class="card w-full max-w-md bg-base-100 shadow-md">
      
      <button
        type="button"
        class="card-body text-left w-full cursor-pointer"
        on:click={() => toggleRegion(region.id)}
      >
        <h2 class="card-title">р. {region.name}</h2>
        <p class="text-gray-500 text-sm">{region.towns?.length ?? 0} града</p>
      </button>

      {#if selectedRegionId === region.id}
        <div class="card-body border-t border-gray-200">
          {#if region.towns?.length}
            {#each region.towns as town}
              <div class="mb-2">
                
                <button
                  type="button"
                  class="flex justify-between items-center w-full bg-gray-100 p-2 rounded cursor-pointer"
                  on:click={() => toggleTown(town)}
                >
                  <span class="font-semibold">{town}</span>
                  <span>{expandedTowns[town] ? '−' : '+'}</span>
                </button>

                {#if expandedTowns[town]}
                  <ul class="mt-1 ml-4 list-disc text-sm">
                    {#each Object.entries(region.sections ?? {}) as [id, section]: [string, Section] (id)}
                      {#if section.town === town}
                        <li class="mb-1">
                          <p class="font-medium">{section.address}</p>
                          {#if section.video}
                            <a
                              class="text-blue-500 hover:underline text-sm"
                              href={section.video}
                              target="_blank"
                            >
                              Видео
                            </a>
                          {/if}
                        </li>
                      {/if}
                    {/each}
                  </ul>
                {/if}
              </div>
            {/each}
          {:else}
            <p class="text-gray-500">Няма градове за този регион</p>
          {/if}
        </div>
      {/if}
    </div>
  {/each}
</div>
