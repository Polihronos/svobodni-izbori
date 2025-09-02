<script lang="ts">
import Map from '$lib/assets/bg-map.svelte';
import Search from '$lib/assets/search.svelte';





export let data;

</script>

<Search /> 

<Map 
    staticRegions={data.staticRegions}
    regionStats={data.regionStats}
/>
