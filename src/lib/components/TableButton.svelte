<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import type { Table, TableStatus, GetTableStatusFn, GetStatusColorFn, GetStatusIconFn, GetStatusTextFn, TableButtonEvents } from '$lib/shared/types';

    // Props
    export let table: Table;

    export let selectedTimeSlot: string;
    export let tableStatuses: TableStatus[];
    export let getTableStatus: GetTableStatusFn;
    export let getStatusColor: GetStatusColorFn;
    // export let getStatusIcon: GetStatusIconFn;
    export let getStatusText: GetStatusTextFn;

    // Event dispatcher
    const dispatch = createEventDispatcher<TableButtonEvents>();

    function handleClick() {
        dispatch('click', table);
    }

    $: status = getTableStatus(table.id, selectedTimeSlot, tableStatuses);
</script>

<button 
    class="card shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 {getStatusColor(status.status)} text-white cursor-pointer" 
    on:click={handleClick}
>
    <div class="card-body p-3 text-center">
        <!-- <div class="text-lg mb-1">{getStatusIcon(status.status)}</div> -->
        <div class="text-lg font-bold">#{table.id}</div>
        <div class="text-xs">{table.capacity} ที่นั่ง</div>
        {#if table.minCapacity !== table.capacity}
            <div class="text-xs opacity-70">ขั้นต่ำ {table.minCapacity} คน</div>
        {/if}
        <div class="badge badge-sm w-full mt-1">{getStatusText(status.status)}</div>
    </div>
</button>