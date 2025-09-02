<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Search from '$lib/assets/search.svelte';

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
	<a href="/" aria-label="Честни избори, връзка към началната страница" class="flex-1 px-4">
		<span class="text-lg font-bold">Честни избори</span>
	</a>

	<!-- <Search /> -->

	<div class="ml-auto flex items-center gap-3 px-4">
		{#if session}
			<!-- User Dropdown -->
			<div class="dropdown dropdown-end">
				<div
					tabindex="0"
					role="button"
					class="btn avatar btn-circle btn-ghost"
					aria-label="Потребителско меню"
				>
					<button
						class="hover:bg-secondary-focus btn btn-circle bg-gray text-secondary-content shadow-md"
						aria-label="Профил на потребителя"
						title="Профил на потребителя"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							class="h-10 w-10"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5.121 17.804A9 9 0 0112 15a9 9 0 016.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
							/>
						</svg>
					</button>
				</div>
				<ul class="dropdown-content menu z-[1] w-64 rounded-box border bg-base-100 p-2 shadow-lg">
					<!-- User Info Header -->
					<div class="px-4 py-2">
						<span class="font-semibold text-base-content">Потребител</span>
					</div>
					<div class="mb-2 px-2">
						<div class="flex flex-col gap-1 rounded-lg bg-base-200 p-2">
							<span class="text-sm font-medium text-base-content">{session.user.email}</span>
							{#if data.profile}
								<div class="flex items-center gap-2">
									<div class="badge badge-sm badge-primary">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="mr-1 h-3 w-3"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z"
											/>
										</svg>
										{data.profile.points} точки
									</div>
								</div>
							{/if}
						</div>
					</div>

					<div class="divider my-1"></div>

					<!-- Menu Items -->
					<li>
						<a
							href="/my-reports"
							class="flex items-center gap-2"
							aria-label="Преглед на моите доклади"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-4 w-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								/>
							</svg>
							Моите доклади
						</a>
					</li>

					<div class="divider my-1"></div>

					<li>
						<button
							onclick={signOut}
							class="flex items-center gap-2 text-error hover:bg-error hover:text-error-content"
							aria-label="Изход от профила"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-4 w-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
								/>
							</svg>
							Изход
						</button>
					</li>
				</ul>
			</div>
		{:else}
			<button class="btn btn-primary" onclick={goToAuth} aria-label="Вход в профила">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="mr-2 h-4 w-4"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
					/>
				</svg>
				Вход
			</button>
		{/if}
	</div>
</div>

<!-- Page content -->
<main class="flex min-h-screen flex-col">
	<div class="container mx-auto max-w-7xl flex-1 px-2 py-4 sm:px-4">
		{@render children?.()}
	</div>
</main>
