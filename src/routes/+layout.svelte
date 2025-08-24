<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let { data, children } = $props();
	let { session, supabase } = $derived(data);

	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});
		return () => data.subscription.unsubscribe();
	});

	const signOut = async () => {
		await supabase.auth.signOut();
		invalidate('supabase:auth');
	};

	const goToAuth = () => {
		goto('/auth');
	};
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!-- Navbar -->
<div class="navbar bg-base-100 shadow-md">
	
	<div class=" flex items-center ml-auto gap-3 px-4">
		{#if session}
			<span class="text-sm text-base-content">{session.user.email}</span>
			<button class="btn btn-m btn-outline" onclick={signOut}>Излез от профила</button>
		{:else}
			<button class="btn btn-m btn-primary" onclick={goToAuth}>Влез в профила</button>
		{/if}
	</div>
</div>

<!-- Page content -->
<main class="p-4">
	{@render children?.()}
</main>
