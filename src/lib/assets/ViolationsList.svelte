<script lang="ts">
	export let violations: any[] = [];

	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString('bg-BG', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getReporterName(violation: any): string {
		// Try to get email from the joined reporter data
		if (violation.reporter?.email) {
			return violation.reporter.email;
		}
		// Fallback to partial user ID if email not available
		if (violation.reported_by) {
			return `Потребител ${violation.reported_by.slice(0, 8)}...`;
		}
		return 'Анонимен';
	}
</script>

{#if violations && violations.length > 0}
	<div class="space-y-4">
		<h3 class="text-lg font-semibold text-gray-800">Докладвани нарушения ({violations.length})</h3>

		{#each violations as violation, index}
			<div class="rounded-lg border bg-red-50 p-4 shadow-sm">
				<div class="mb-2 flex items-center justify-between">
					<span class="text-sm font-medium text-red-700">
						Доклад #{index + 1}
					</span>
					<span class="text-xs text-gray-500">
						{formatDate(violation.created_at)}
					</span>
				</div>

				<div class="mb-2 text-xs text-gray-600">
					Докладвано от: {violation.reporter_email || 'Анонимен'}
				</div>

				{#if violation.selected_violations && violation.selected_violations.length > 0}
					<div class="mb-3">
						<h4 class="mb-2 text-sm font-medium text-gray-700">Избрани нарушения:</h4>
						<ul class="space-y-1">
							{#each violation.selected_violations as selectedViolation}
								<li class="flex items-start space-x-2">
									<span class="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500"></span>
									<span class="text-sm text-gray-700">{selectedViolation}</span>
								</li>
							{/each}
						</ul>
					</div>
				{/if}

				{#if violation.other_violation && violation.other_violation.trim()}
					<div class="rounded bg-red-100 p-3">
						<h4 class="mb-1 text-sm font-medium text-gray-700">Други нарушения:</h4>
						<p class="text-sm text-gray-700">{violation.other_violation}</p>
					</div>
				{/if}
			</div>
		{/each}
	</div>
{:else}
	<div class="rounded-lg border bg-green-50 p-4 text-center">
		<p class="text-sm text-green-700">Няма докладвани нарушения за тази секция</p>
	</div>
{/if}
