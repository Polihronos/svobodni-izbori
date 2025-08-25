<script lang="ts">
	import { onMount } from 'svelte';

	type Region = {
		id: string;
		name: string;
		path: string;
	};

	export let regions: Region[] = [];

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
</script>

<div class="flex w-full flex-col items-center">
	<svg
		viewBox="240 -560 80 80"
		xmlns="http://www.w3.org/2000/svg"
		class="mx-auto  w-full max-w-7xl  "
	>
		{#each regions as region, i}
			
			<path
				id={'region' + i}
				d={region.path}
				class="cursor-pointer transition-colors duration-200 hover:fill-blue-500"
				fill="#93c5fd"
				stroke="white"
				stroke-width="0.5"
				role="img"
			>
				<title>{region.name}</title>
			</path>

			{#if centroids[i]}
				<text
					x={region.name === 'София' ? centroids[i].x + 2 : centroids[i].x}
					y={centroids[i].y}
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
</div>
