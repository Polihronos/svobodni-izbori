<script lang="ts">
	import { onMount } from 'svelte';
	import type { Region } from '../data/regions';
	import type { Section } from '../data/sections/sections';

	export let regions: Region[] = [];

	let selectedRegion: Region | null = null;
	let selectedTown: string | null = null;

	function selectRegion(region: Region) {
		selectedRegion = region;
		selectedTown = null; // reset town when region changes
	}

	function selectTown(town: string) {
		selectedTown = selectedTown === town ? null : town; // toggle
	}

	let centroids: { x: number; y: number }[] = [];

	onMount(() => {
		const svg = document.querySelector('svg');
		if (!svg) return;

		centroids = regions.map((_, i) => {
			const path = svg.querySelector<SVGPathElement>(`#region${i}`);
			if (!path) return { x: 0, y: 0 };
			const bbox = path.getBBox();
			return { x: bbox.x + bbox.width / 2, y: bbox.y + bbox.height / 2 };
		});
	});

	// filtered sections
	$: filteredSections = selectedRegion?.sections
		? Object.entries(selectedRegion.sections).filter(
				([, section]) => !selectedTown || section.town === selectedTown
			)
		: [];
</script>

<div class="flex w-full flex-col items-center">
	<svg viewBox="240 -560 80 80" xmlns="http://www.w3.org/2000/svg" class="mx-auto w-full max-w-7xl">
		{#each regions as region, i}
			<path
				id={'region' + i}
				d={region.path}
				class="focus cursor-pointer transition-colors duration-200 outline-none hover:fill-blue-500"
				fill={selectedRegion?.id === region.id ? '#3b82f6' : '#93c5fd'}
				stroke="white"
				stroke-width="0.2"
				role="button"
				tabindex="0"
				on:click={() => selectRegion(region)}
				on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && selectRegion(region)}
			>
				<title>{region.name}</title>
			</path>

			{#if centroids[i]}
				<text
					x={region.name === 'София'
						? centroids[i].x + 2
						: region.name === '23'
							? centroids[i].x + 1
							: region.name === '24'
								? centroids[i].x - 0.7
								: region.name === '25'
									? centroids[i].x + 0.7
									: centroids[i].x}
					y={region.name === 'Пловдив'
						? centroids[i].y - 2
						: region.name === '23'
							? centroids[i].y - 1
							: region.name === '24'
								? centroids[i].y + 0.3
								: region.name === '25'
									? centroids[i].y - 1
									: centroids[i].y}
					font-size="1"
					fill="black"
					text-anchor="middle"
					alignment-baseline="middle"
					class="pointer-events-none"
				>
					{region.name}
				</text>
			{/if}
		{/each}
	</svg>

	<div class="flex w-full max-w-7xl space-x-4">
		<div class="card max-h-64 flex-1 overflow-auto bg-base-200 p-4">
			<h2 class="mb-2 text-lg font-bold">Градове</h2>

			{#if selectedRegion?.towns?.length}
				<ul class="list-inside list-disc space-y-1">
					{#each selectedRegion.towns as town}
						<li class="rounded border-b border-gray-300 p-1">
							<button
								type="button"
								class="w-full cursor-pointer rounded p-1 text-left font-semibold hover:bg-base-300 {selectedTown ===
								town
									? 'text-blue-600'
									: ''}"
								on:click={() => selectTown(town)}
							>
								{town}
							</button>
						</li>
					{/each}
				</ul>
			{:else}
				<p class="text-gray-500">Избери регион</p>
			{/if}
		</div>

		<div class="card max-h-64 flex-1 overflow-auto bg-base-200 p-4">
			<h2 class="mb-2 text-lg font-bold">Секции</h2>

			{#if filteredSections.length > 0}
				<ul class="list-inside list-disc space-y-1">
					{#each filteredSections as [id, section] (id)}
						<li class="border-b border-gray-300 p-1">
							<p class="font-semibold">
								<a href={`/section/${id}`} class="text-blue-600 hover:underline">
									{section.town} — {section.address}
								</a>
							</p>
							{#if section.video}
								<a class="text-blue-500 hover:underline" href={section.video} target="_blank">
									🎥 Видео
								</a>
							{/if}
						</li>
					{/each}
				</ul>
			{:else if selectedRegion}
				<p class="text-gray-500">Няма секции за този град</p>
			{:else}
				<p class="text-gray-500">Избери регион</p>
			{/if}
		</div>
	</div>
</div>
