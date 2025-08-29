<script lang="ts">
	import type { Region } from '$lib/data/regions';
	import type { Section } from '$lib/data/sections/sections';

	export let regions: Region[] = [];

	let rawQuery = '';
	let query = '';
	let debounceTimer: NodeJS.Timeout;

	function handleInput(e: Event) {
		rawQuery = (e.target as HTMLInputElement).value;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			query = rawQuery;
		}, 200);
	}

	function matches(str: string, q: string) {
		return str.toLowerCase().includes(q.toLowerCase());
	}

	type SearchHit = {
		regionName: string;
		town: string;
		section: Section;
		sectionId: string;
	};

	$: results =
		query.trim() === ''
			? []
			: regions.flatMap((region) =>
					Object.entries(region.sections ?? {}).flatMap(([id, section]) =>
						matches(section.town, query) || matches(section.address, query)
							? [
									{
										regionName: region.name,
										town: section.town,
										section,
										sectionId: id
									} satisfies SearchHit
							  ]
							: []
					)
			  );
</script>

<div class="mx-auto w-full max-w-md p-4">
	<input
		type="text"
		placeholder="🔍 Търси регион, град или секция..."
		value={rawQuery}
		on:input={handleInput}
		class="input-bordered input mb-4 w-full"
	/>

	{#if query.trim() !== ''}
		{#if results.length > 0}
			<ul class="space-y-2">
				{#each results.slice(0, 20) as { regionName, town, section, sectionId }}
					<li class="rounded-lg border bg-base-100 p-3 shadow transition hover:bg-base-200">
						<p class="text-lg font-bold">{regionName}</p>
						<p class="text-sm text-gray-600">🏙️ {town}</p>
						<p class="text-sm">{section.address}</p>
						<a
							href={`/section/${sectionId}`}
							class="text-sm text-blue-600 hover:underline"
						>
							Виж секцията
						</a>
						{#if section.video}
							<a
								href={section.video}
								target="_blank"
								class="text-sm text-blue-500 hover:underline"
							>
								🎥 Видео
							</a>
						{/if}
					</li>
				{/each}
			</ul>
			{#if results.length > 20}
				<p class="mt-2 text-center text-sm text-gray-500">
					Показва първите 20 от {results.length} резултата.
				</p>
			{/if}
		{:else}
			<p class="text-center text-gray-500">Няма резултати</p>
		{/if}
	{/if}
</div>
