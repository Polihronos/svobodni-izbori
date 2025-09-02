<script lang="ts">
	// Define the shape of a single search result
	type SectionSearchResult = {
		id: string;
		region_name: string;
		town: string;
		address: string;
		video: string | null;
	};

	let rawQuery = '';
	let query = '';
	let debounceTimer: NodeJS.Timeout;

	let results: SectionSearchResult[] = [];
	let loading = false;
	let hasSearched = false;

	function handleInput(e: Event) {
		rawQuery = (e.target as HTMLInputElement).value;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			query = rawQuery.trim();
		}, 300); // 300ms debounce is a good standard
	}

	// This async function performs the search by calling our new API
	async function performSearch() {
		if (query.length < 2) {
			results = [];
			hasSearched = false;
			return;
		}

		loading = true;
		hasSearched = true;

		try {
			const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
			if (response.ok) {
				results = await response.json();
			} else {
				console.error('Search request failed');
				results = [];
			}
		} catch (error) {
			console.error('Error fetching search results:', error);
			results = [];
		} finally {
			loading = false;
		}
	}

	// This reactive statement automatically calls performSearch whenever the debounced 'query' changes
	$: if (query || query === '') performSearch();

</script>

<div class="mx-auto w-full max-w-md p-4">
	<input
		type="text"
		placeholder="🔍 Търси по номер, област, град или адрес..."
		bind:value={rawQuery}
		on:input={handleInput}
		class="input-bordered input mb-4 w-full"
	/>

	{#if loading}
		<div class="text-center">
			<span class="loading loading-spinner text-primary"></span>
		</div>
	{/if}

	{#if !loading && hasSearched}
		{#if results.length > 0}
			<ul class="space-y-2">
				{#each results as result (result.id)}
					<li class="rounded-lg border bg-base-100 p-3 shadow transition hover:bg-base-200">
						<p class="text-lg font-bold">{result.region_name}</p>
						<p class="text-sm text-gray-600">🏙️ {result.town}</p>
						<p class="text-sm">{result.address}</p>
						
						
						<div class="mt-2">
							<p class="badge badge-outline">Секция №: {result.id}</p>
						</div>
						

						<div class="mt-2 flex items-center justify-between">
							<a
								href={`/section/${result.id}`}
								class="btn btn-sm btn-primary"
							>
								Виж секцията
							</a>
							{#if result.video}
								<a
									href={result.video}
									target="_blank"
									class="text-sm text-blue-500 hover:underline"
								>
									🎥 Видео
								</a>
							{/if}
						</div>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="text-center text-gray-500">Няма намерени резултати</p>
		{/if}
	{/if}
</div>