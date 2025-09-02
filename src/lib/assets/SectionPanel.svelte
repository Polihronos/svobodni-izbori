<script lang="ts">
	type SectionData = {
		id: string;
		address: string;
		town: string;
		is_reported: boolean;
		latest_report_type: 'violation' | 'clean' | null;
		latest_reporter_email: string | null;
	};

	export let title: string;
	export let sections: SectionData[] = [];
	export let isLoading: boolean = false;
	export let hasSelectedRegion: boolean = false;
	export let emptyMessage: string = 'Няма секции.';
</script>

<div class="card h-96 overflow-auto bg-base-200 p-4">
	<h2 class="mb-2 text-lg font-bold">{title}</h2>
	{#if isLoading}
		<p class="text-center text-gray-500">Зареждане...</p>
	{:else if sections.length > 0}
		<ul class="space-y-2">
			{#each sections as section (section.id)}
				<li class="border-b border-gray-300 pb-2">
					<p class="font-semibold">{section.town}</p>
					<p class="text-sm">{section.address}</p>
					<div class="mt-1 flex items-center justify-between text-xs">
						<span>
							{#if section.is_reported}
								<span
									class="badge badge-sm"
									class:badge-error={section.latest_report_type === 'violation'}
									class:badge-success={section.latest_report_type === 'clean'}
								>
									{section.latest_report_type === 'violation' ? 'Нарушение' : 'Чиста'}
								</span>
								от {section.latest_reporter_email}
							{/if}
						</span>
						<a href={`/section/${section.id}`} class="link-primary link">Детайли</a>
					</div>
				</li>
			{/each}
		</ul>
	{:else if hasSelectedRegion}
		<p class="text-gray-500">{emptyMessage}</p>
	{:else}
		<p class="text-gray-500">Избери регион.</p>
	{/if}
</div>