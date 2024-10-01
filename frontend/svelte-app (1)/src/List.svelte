<script>
    import { onMount } from 'svelte';
    import arrangementStore, { loadArrangements } from './arrangementStore';
    import Arrangement from './Arrangement.svelte';

    let arrangements = [];
    const unsubscribe = arrangementStore.subscribe(value => {
        arrangements = value;
    });

    onMount(() => {
        const employeeIds = [130002];
        const supervisorIds = [];
        loadArrangements(employeeIds, supervisorIds);
    });

</script>

<div>
    {#each arrangements as arrangement}
        <Arrangement {arrangement} />
    {/each}
</div>