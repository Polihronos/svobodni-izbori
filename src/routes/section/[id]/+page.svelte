<script lang="ts">
	import ReportViolation from '$lib/assets/ReportViolation.svelte';
	import ViolationsList from '$lib/assets/ViolationsList.svelte';
	import CleanReportsList from '$lib/assets/CleanReportsList.svelte';
	import { enhance } from '$app/forms';

	export let data: {
		section: any;
		id: string;
		session: any;
		user: any;
	};

	let reportedViolation = data.section.violations?.length || 0;

	let userAction: 'clean' | 'violation' | null = null;

	let showViolationForm = false;

	let cleanCount = data.section.clean_sections?.length || 0;
	let cleanSubmitting = false;

	function openViolationForm() {
		if (!data.session) {
			alert('Трябва да сте влезли в профила си за да докладвате нарушения');
			return;
		}
		showViolationForm = true;
	}

	function closeViolationForm() {
		showViolationForm = false;
	}

	function handleSubmitted(payload: any) {
		reportedViolation++;
		userAction = 'violation';
		showViolationForm = false;
		// Refresh the page to show updated reports
		window.location.reload();
	}

	console.log('🎯 Component data.section.violations:', data.section.violations);
	console.log('🔢 Calculated reportedViolation:', data.section.violations?.length || 0);
</script>

<div class="mx-auto max-w-md space-y-4 p-4">
	<h1 class="text-2xl font-bold">{data.section.region_name}</h1>
	<p class="text-lg text-gray-600">🏙️ {data.section.town}</p>

	<div class="space-y-2 rounded-lg border bg-base-100 p-4 shadow">
		<p class="font-semibold">{data.section.address}</p>

		
		<div class="flex items-center justify-between text-sm">
			
			{#if data.section.video}
				<a href={data.section.video} target="_blank" class="text-blue-500 hover:underline">
					🎥 Видео
				</a>
			{:else}
				
				<span></span>
			{/if}

			
			<span
				class="flex items-center gap-1 text-gray-500"
				title="колко човека са гледали тази секция"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-4 w-4"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
					/><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
					/></svg
				>
				{data.section.view_count}
			</span>
		</div>
	</div>

	<div class="flex flex-col space-y-2 rounded-lg border bg-base-200 p-4 shadow">
		<div class="flex space-x-2">
			<form
				method="POST"
				action="?/markAsClean"
				use:enhance={() => {
					cleanSubmitting = true;
					return async ({ result, update }) => {
						if (result.type === 'success') {
							cleanCount++;
							userAction = 'clean';
						} else if (result.type === 'failure') {
							alert(result.data?.error || 'Възникна грешка.');
						}
						cleanSubmitting = false;
						await update();
					};
				}}
			>
				<button
					class="btn-l btn flex-1 btn-success"
					type="submit"
					disabled={userAction === 'clean' || cleanSubmitting}
				>
					{cleanSubmitting ? 'Записване...' : 'Маркирай като чиста'}
				</button>
			</form>

			<button
				class="btn-l btn flex-1 btn-error"
				onclick={openViolationForm}
				disabled={userAction === 'violation'}
			>
				Докладвай нарушение
			</button>
		</div>

		<div class="flex justify-between text-sm text-gray-700">
			<span>Чисто: {cleanCount}</span>
			<span>Нарушения: {reportedViolation}</span>
		</div>
	</div>

	{#if showViolationForm}
		<ReportViolation
			section={data.section}
			onSubmitted={handleSubmitted}
			onCancel={closeViolationForm}
		/>
	{/if}

	<!-- Display existing violations -->
	<CleanReportsList reports={data.section.clean_sections} />
	<ViolationsList violations={data.section.violations} />
</div>
