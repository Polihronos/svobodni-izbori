<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';

	const props: {
		sectionId: string;
		regionName: string;
		town: string;
		sectionAddress: string;
		videoUrl: string;
		onSubmitted?: (payload: any) => void;
		onCancel?: () => void;
	} = $props();

	let violations: Record<number, boolean> = $state({});
	let otherViolation: string = $state('');
	let submitting: boolean = $state(false);
	let errorMessage: string = $state('');
	let successMessage: string = $state('');

	const standardViolations = [
		'Липсва видеозапис на преброяването',
		'Видеозапис е кратък (под 60 минути) и не отразява целия процес по преброяването',
		'Камерата няма ясна видимост към масата с бюлетините или има хора пред нея',
		'Вижда се, че част от бюлетини излизат извън обсега на камерата (и не се знае какво се случва с тях)',
		'Хартиените бюлетини не се вадят една по една от урната',
		'Машинните бюлетини не се вадят една по една от урната',
		'Има повече от един химикал на масата с бюлетините и/или в ръцете на хората около масата',
		'Бюлетините не се броят от един човек',
		'При преброяването им, бюлетините не се показват пред камерата',
		'Ако се показват пред камерата, бюлетините не са ясно видими',
		'Пише се по бюлетините по време на броенето',
		'НЕ се обяснява защо дадена бюлетина е невалидна',
		'Цитират се брой гласове за дадена партия, които се разминават с отразените в протокола',
		'Вижда се унищожаване на бюлетини или части от тях (отрязъци)',
		'На записа не се вижда членовете на комисията да подписват протокола',
		'Влизат или излизат хора от секцията по време на броенето'
	];

	const handleSubmit: SubmitFunction = () => {
		submitting = true;
		errorMessage = '';
		successMessage = '';

		return async ({ result, update }) => {
			submitting = false;

			if (result.type === 'success') {
				successMessage = result.data?.message || 'Докладът беше изпратен успешно!';
				// Reset form
				violations = {};
				otherViolation = '';
				// Call the callback after a short delay to show success message
				setTimeout(() => {
					props.onSubmitted?.({
						sectionId: props.sectionId,
						regionName: props.regionName,
						town: props.town,
						sectionAddress: props.sectionAddress
					});
				}, 1500);
			} else if (result.type === 'failure') {
				errorMessage = result.data?.error || 'Възникна грешка при изпращането';
			}

			await update();
		};
	};

	function cancel() {
		props.onCancel?.();
	}
	

</script>

<div class="mx-auto max-w-md space-y-4 rounded-lg border bg-base-100 p-4 shadow">
	<h2 class="text-lg font-bold">Секция {props.sectionId}</h2>
	<p class="text-gray-600">{props.regionName}, {props.town}, {props.sectionAddress}</p>

	{#if props.videoUrl}
		<a href={props.videoUrl} target="_blank" class="text-sm text-blue-500 hover:underline">
			🎥 Гледай видео
		</a>
	{/if}

	{#if errorMessage}
		<div class="alert alert-error">
			<span>{errorMessage}</span>
		</div>
	{/if}

	{#if successMessage}
		<div class="alert alert-success">
			<span>{successMessage}</span>
		</div>
	{/if}

	<form method="POST" action="?/submitReport" use:enhance={handleSubmit}>
		<!-- Hidden fields for section data -->
		<input type="hidden" name="regionName" value={props.regionName} />
		<input type="hidden" name="town" value={props.town} />
		<input type="hidden" name="sectionAddress" value={props.sectionAddress} />

		<div class="space-y-2">
			<p class="font-semibold">Изберете нарушения:</p>
			{#each standardViolations as violation, i}
				<label class="flex cursor-pointer items-center space-x-2" for={`violation-${i}`}>
					<input
						type="checkbox"
						id={`violation-${i}`}
						name={`violation-${i}`}
						bind:checked={violations[i]}
						class="checkbox"
					/>
					<span class="text-sm">{violation}</span>
				</label>
			{/each}
		</div>

		<div class="flex flex-col space-y-2">
			<label class="text-sm font-semibold" for="otherViolation">Други нарушения:</label>
			<textarea
				id="otherViolation"
				name="otherViolation"
				bind:value={otherViolation}
				placeholder="Опишете други нарушения..."
				class="textarea-bordered textarea w-full"
			></textarea>
		</div>

		<div class="flex justify-end space-x-2 mt-2">
			<button class="btn btn-ghost" onclick={cancel} type="button">Отказ</button>
			<button class="btn btn-primary" type="submit" disabled={submitting}>
				{submitting ? 'Изпращане...' : 'Изпрати доклад'}
			</button>
		</div>
	</form>
</div>
