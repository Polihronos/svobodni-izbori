<script lang="ts">
	import { enhance } from '$app/forms';

	export let data;

	function formatTimestamp(timestamp: string) {
		return new Date(timestamp).toLocaleString('bg-BG', { dateStyle: 'short', timeStyle: 'short' });
	}
</script>

<div class="mx-auto max-w-4xl">
	<h1 class="mb-6 text-3xl font-bold">Моите доклади</h1>

	<!-- Section for Violation Reports -->
	<div class="card bg-base-200 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">Доклади за нарушения</h2>
			{#if data.violations && data.violations.length > 0}
				<ul class="space-y-4">
					{#each data.violations as report (report.id)}
						<li class="rounded-lg border border-base-300 bg-base-100 p-4">
							<div class="flex items-start justify-between">
								<div>
									<a href={`/section/${report.sections.id}`} class="link font-bold link-primary">
										Секция в {report.sections.town}
									</a>
									<p class="text-sm text-gray-500">{report.sections.address}</p>
									<p class="mt-2 text-xs text-gray-400">
										Докладвано на: {formatTimestamp(report.created_at)}
									</p>
								</div>
								<form
									method="POST"
									action="?/deleteViolation"
									use:enhance={({ cancel }) => {
										if (!confirm('Сигурни ли сте, че искате да изтриете този доклад?')) {
											cancel();
										}
									}}
								>
									<input type="hidden" name="reportId" value={report.id} />
									<button type="submit" class="btn btn-circle btn-ghost btn-sm" aria-label="Изтрий">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											class="h-5 w-5"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M10 3h4a1 1 0 011 1v1H9V4a1 1 0 011-1z"
											/>
										</svg>
									</button>
								</form>
							</div>
							<ul class="mt-2 list-inside list-disc pl-2 text-sm">
								{#each report.selected_violations as violation}
									<li>{violation}</li>
								{/each}
								{#if report.other_violation}
									<li class="italic">{report.other_violation}</li>
								{/if}
							</ul>
						</li>
					{/each}
				</ul>
			{:else}
				<p>Нямате доклади за нарушения.</p>
			{/if}
		</div>
	</div>

	<div class="divider my-8"></div>

	<!-- Section for Clean Reports -->
	<div class="card bg-base-200 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">Маркирани като чисти секции</h2>
			{#if data.cleanReports && data.cleanReports.length > 0}
				<ul class="space-y-4">
					{#each data.cleanReports as report (report.id)}
						<li class="rounded-lg border border-base-300 bg-base-100 p-4">
							<div class="flex items-start justify-between">
								<div>
									<a href={`/section/${report.sections.id}`} class="link font-bold link-primary">
										Секция в {report.sections.town}
									</a>
									<p class="text-sm text-gray-500">{report.sections.address}</p>
									<p class="mt-2 text-xs text-gray-400">
										Маркирано на: {formatTimestamp(report.created_at)}
									</p>
								</div>
								<form
									method="POST"
									action="?/deleteCleanReport"
									use:enhance={({ cancel }) => {
										if (!confirm('Сигурни ли сте, че искате да премахнете тази маркировка?')) {
											cancel();
										}
									}}
								>
									<input type="hidden" name="reportId" value={report.id} />
									<button type="submit" class="btn btn-circle btn-ghost btn-sm" aria-label="Изтрий">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											class="h-5 w-5"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M10 3h4a1 1 0 011 1v1H9V4a1 1 0 011-1z"
											/>
										</svg>
									</button>
								</form>
							</div>
						</li>
					{/each}
				</ul>
			{:else}
				<p>Нямате секции, маркирани като чисти.</p>
			{/if}
		</div>
	</div>
</div>
