<script lang="ts">
	import ReportViolation from '$lib/assets/ReportViolation.svelte';
	import ViolationsList from '$lib/assets/ViolationsList.svelte';

	export let data: {
		section: any;
		regionName: string;
		town: string;
		id: string;
		session: any;
		user: any;
		existingReports: any[];
	};

	let markedClean = 0;
	let reportedViolation = data.existingReports?.length || 0;
	let userAction: 'clean' | 'violation' | null = null;

	let showViolationForm = false;

	function markClean() {
		if (userAction === 'clean') return;
		if (userAction === 'violation') reportedViolation--;
		markedClean++;
		userAction = 'clean';
	}

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

	console.log('🎯 Component data.existingReports:', data.existingReports);
console.log('🔢 Calculated reportedViolation:', data.existingReports?.length || 0);

</script>

<div class="mx-auto max-w-md space-y-4 p-4">
	<h1 class="text-2xl font-bold">{data.regionName}</h1>
	<p class="text-lg text-gray-600">🏙️ {data.town}</p>

	<div class="space-y-2 rounded-lg border bg-base-100 p-4 shadow">
		<p class="font-semibold">{data.section.address}</p>

		{#if data.section.video}
			<a href={data.section.video} target="_blank" class="text-sm text-blue-500 hover:underline">
				🎥 Видео
			</a>
		{/if}
	</div>

	<div class="flex flex-col space-y-2 rounded-lg border bg-base-200 p-4 shadow">
		<div class="flex space-x-2">
			<button
				class="btn-l btn flex-1 btn-success"
				onclick={markClean}
				disabled={userAction === 'clean'}
			>
				Маркирай като чиста
			</button>

			<button
				class="btn-l btn flex-1 btn-error"
				onclick={openViolationForm}
				disabled={userAction === 'violation'}
			>
				Докладвай нарушение 
			</button>
		</div>

		<div class="flex justify-between text-sm text-gray-700">
			<span>Чисто: {markedClean}</span>
			<span>Нарушения: {reportedViolation}</span>
		</div>
	</div>

	{#if showViolationForm}
		<ReportViolation
			sectionId={data.section.id}
			regionName={data.regionName}
			town={data.town}
			sectionAddress={data.section.address}
			videoUrl={data.section.video}
			onSubmitted={handleSubmitted}
			onCancel={closeViolationForm}
		/>
	{/if}

	<!-- Display existing violations -->
	<ViolationsList violations={data.existingReports} />
</div>
