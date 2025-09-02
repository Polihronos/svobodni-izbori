<script lang="ts">
	export let reports: { created_at: string; reporter_email: string }[] = [];

	function formatTimestamp(timestamp: string) {
		if (!timestamp) return '';
		// Formats the date for Bulgarian locale
		return new Date(timestamp).toLocaleString('bg-BG', {
			dateStyle: 'short',
			timeStyle: 'short'
		});
	}
</script>

{#if reports && reports.length > 0}
	<div class="space-y-2 rounded-lg border bg-base-100 p-4 shadow">
		<h3 class="font-semibold">Маркирано като чисто от:</h3>
		<ul class="list-inside list-disc space-y-1 text-sm">
			{#each reports as report}
				<li>
					<span class="font-medium">{report.reporter_email || 'Анонимен'}</span>
					<span class="text-xs text-gray-500">
						- {formatTimestamp(report.created_at)}
					</span>
				</li>
			{/each}
		</ul>
	</div>
{/if}