<script lang="ts">
	import { onMount } from 'svelte';
	import SectionPanel from '$lib/assets/SectionPanel.svelte';


	type RegionStat = {
		region_name: string;
		total_sections: number;
		violation_count: number;
		clean_count: number;
	};
	type SectionData = {
		id: string;
		address: string;
		town: string;
		video: string | null;
		is_reported: boolean;
		latest_report_type: 'violation' | 'clean' | null;
		latest_reporter_email: string | null;
	};
	type StaticRegion = { id: string; name: string; dbName: string; path: string };

	export let staticRegions: StaticRegion[] = [];
	export let regionStats: RegionStat[] = [];

	let selectedRegion: StaticRegion | null = null;
	let allSectionsInRegion: SectionData[] = [];
	let isLoadingSections = false;
	let reportedSearchQuery = '';
	let unreportedSearchQuery = '';

	const getStatsForRegion = (dbName: string) => regionStats.find((s) => s.region_name === dbName);

	function getColorForRegion(dbName: string): string {
		const stats = getStatsForRegion(dbName);
		if (!stats || (stats.violation_count === 0 && stats.clean_count === 0)) return '#60a5fa';
		const hasViolations = stats.violation_count > 0;
		const hasCleanMarks = stats.clean_count > 0;
		if (hasViolations && hasCleanMarks) return '#facc15';
		if (hasViolations) return '#f87171';
		if (hasCleanMarks) return '#4ade80';
		return '#60a5fa';
	}

	async function handleRegionClick(region: StaticRegion) {
		if (selectedRegion?.id === region.id) {
			selectedRegion = null;
			allSectionsInRegion = [];
			return;
		}
		selectedRegion = region;
		reportedSearchQuery = '';
		unreportedSearchQuery = '';
		isLoadingSections = true;
		try {
			const response = await fetch(`/api/sections/${encodeURIComponent(region.dbName)}`);
			if (response.ok) allSectionsInRegion = await response.json();
		} finally {
			isLoadingSections = false;
		}
	}

	let centroids: { x: number; y: number }[] = [];
	onMount(() => {
		const svg = document.querySelector('svg[viewBox="240 -560 80 80"]');
		
		if (!svg) {
			return;
		}
		
		centroids = staticRegions.map((region, i) => {
			const path = svg.querySelector<SVGPathElement>(`#region${i}`);
			
			if (!path) {
				return { x: 0, y: 0 };
			}
			
			const bbox = path.getBBox();
			const centroid = { x: bbox.x + bbox.width / 2, y: bbox.y + bbox.height / 2 };
			return centroid;
		});
	});

	$: reportedSections = allSectionsInRegion.filter((s) => s.is_reported);
	$: unreportedSections = allSectionsInRegion.filter((s) => !s.is_reported);

	function filterBySearch(sections: SectionData[], query: string) {
		query = query.toLowerCase().trim();
		if (!query) return sections;
		return sections.filter(
			(s) =>
				s.id.includes(query) ||
				s.town.toLowerCase().includes(query) ||
				s.address.toLowerCase().includes(query)
		);
	}

	$: filteredReportedSections = filterBySearch(reportedSections, reportedSearchQuery);
	$: filteredUnreportedSections = filterBySearch(unreportedSections, unreportedSearchQuery);
</script>

<div class="w-full min-w-0 flex flex-col items-center space-y-4">
	
	

	<div class="w-full flex justify-center -mt-15 ">
		<svg viewBox="240 -560 80 80" xmlns="http://www.w3.org/2000/svg" class="w-full max-w-7xl min-h-[300px] h-auto">
			
			{#each staticRegions as region, i}
				{@const stats = getStatsForRegion(region.dbName)}
				<path
					id={'region' + i}
					d={region.path}
					class="cursor-pointer outline-none transition-all duration-300 hover:filter hover:brightness-95"
					class:brightness-120={selectedRegion?.id === region.id}

					fill={getColorForRegion(region.dbName)}
					
					stroke="white"
					stroke-width="0.2"
					role="button"
					tabindex="0"
					aria-label={`Избери регион ${region.name}`}
					aria-pressed={selectedRegion?.id === region.id}
					on:click={() => handleRegionClick(region)}
					on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && handleRegionClick(region)}
				>
					<title>
						{region.name}
						{#if stats}
							| Нарушения: {stats.violation_count} / {stats.total_sections} | Чисти: {stats.clean_count}
						{/if}
					</title>
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
	</div>

	<!-- <div
		class="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-lg bg-base-200 p-2 text-sm"
	>
		<span class="font-bold">Легенда:</span>
		<div class="flex items-center space-x-1">
			<div class="h-4 w-4 rounded" style="background-color: #4ade80;"></div>
			<span>Чисти</span>
		</div>
		<div class="flex items-center space-x-1">
			<div class="h-4 w-4 rounded" style="background-color: #facc15;"></div>
			<span>Смесени</span>
		</div>
		<div class="flex items-center space-x-1">
			<div class="h-4 w-4 rounded" style="background-color: #f87171;"></div>
			<span>Нарушения</span>
		</div>
	</div> -->

	<!-- Single Layout for BOTH Mobile and Desktop -->
	<div class="mt-6 w-full max-w-7xl px-2 sm:px-0">
		<!-- Mobile Tabs -->
<div
  role="tablist"
  class="tabs tabs-lifted tabs-lg md:hidden w-full flex gap-2"
>
  <input
    type="radio"
    name="mobile_tabs"
    role="tab"
    class="tab font-semibold text-base px-6 py-3 flex-1"
    aria-label="Проверени"
    checked
  />
  <div
    role="tabpanel"
    class="tab-content rounded-box border-base-300 bg-base-100 p-4"
  >
    <div class="mb-4">
      <input
        type="text"
        bind:value={reportedSearchQuery}
        placeholder="Търси в проверените секции..."
        class="input input-bordered w-full"
        disabled={!selectedRegion}
      />
    </div>
    <SectionPanel
      title=""
      sections={filteredReportedSections}
      isLoading={isLoadingSections}
      hasSelectedRegion={selectedRegion !== null}
      emptyMessage="Няма проверени секции"
    />
  </div>

  <input
    type="radio"
    name="mobile_tabs"
    role="tab"
    class="tab font-semibold text-base px-6 py-3 flex-1"
    aria-label="Непроверени"
  />
  <div
    role="tabpanel"
    class="tab-content rounded-box border-base-300 bg-base-100 p-4"
  >
    <div class="mb-4">
      <input
        type="text"
        bind:value={unreportedSearchQuery}
        placeholder="Търси в непроверените секции..."
        class="input input-bordered w-full"
        disabled={!selectedRegion}
      />
    </div>
    <SectionPanel
      title=""
      sections={filteredUnreportedSections}
      isLoading={isLoadingSections}
      hasSelectedRegion={selectedRegion !== null}
      emptyMessage="Всички секции са проверени"
    />
  </div>
</div>

		<!-- Desktop Grid -->
		<div class="hidden gap-4 md:grid md:grid-cols-2">
			<div class="card h-96 overflow-auto bg-base-200 p-4">
				<div class="mb-4">
					<input
						type="text"
						bind:value={reportedSearchQuery}
						placeholder="Търси в проверените секции за района..."
						class="input input-bordered w-full"
						disabled={!selectedRegion}
					/>
				</div>
				<SectionPanel
					title="Проверени секции"
					sections={filteredReportedSections}
					isLoading={isLoadingSections}
					hasSelectedRegion={selectedRegion !== null}
					emptyMessage="Няма проверени секции"
				/>
			</div>
			<div class="card h-96 overflow-auto bg-base-200 p-4">
				<div class="mb-4">
					<input
						type="text"
						bind:value={unreportedSearchQuery}
						placeholder="Търси в непроверените секции за района..."
						class="input input-bordered w-full"
						disabled={!selectedRegion}
					/>
				</div>
				<SectionPanel
					title="Непроверени секции"
					sections={filteredUnreportedSections}
					isLoading={isLoadingSections}
					hasSelectedRegion={selectedRegion !== null}
					emptyMessage="Всички секции са проверени"
				/>
			</div>
		</div>
	</div>
</div>
