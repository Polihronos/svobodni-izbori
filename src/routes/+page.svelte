<script lang="ts">
import Map from '$lib/assets/bg-map.svelte';
import { regions } from "$lib/data/regions";
import Search from '$lib/assets/search.svelte';

</script>

<Search {regions}/>

<Map {regions}/>



