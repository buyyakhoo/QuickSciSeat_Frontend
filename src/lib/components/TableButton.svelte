<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    // Props
    export let table: {
        id: number;
        capacity: number;
        minCapacity: number;
        status: 'available' | 'reserved' | 'occupied';
    };

    export let selectedTimeSlot: string;
    export let tableStatuses: any; // หรือ type ที่เหมาะสม
    export let getTableStatus: (id: number, timeSlot: string, statuses: any) => any;
    export let getStatusColor: (status: string) => string;
    export let getStatusIcon: (status: string) => string;
    export let getStatusText: (status: string) => string;

    // Event dispatcher
    const dispatch = createEventDispatcher<{
        click: typeof table;
    }>();

    function handleClick() {
        dispatch('click', table);
    }

    $: status = getTableStatus(table.id, selectedTimeSlot, tableStatuses);
</script>

<button 
    class="card shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 {getStatusColor(status.status)} border-2 cursor-pointer" 
    on:click={handleClick}
>
    <div class="card-body p-3 text-center">
        <div class="text-lg mb-1">{getStatusIcon(status.status)}</div>
        <div class="text-lg font-bold">#{table.id}</div>
        <div class="text-xs">{table.capacity} ที่นั่ง</div>
        {#if table.minCapacity !== table.capacity}
            <div class="text-xs opacity-70">ขั้นต่ำ {table.minCapacity} คน</div>
        {/if}
        <div class="badge badge-sm w-full mt-1">{getStatusText(status.status)}</div>
    </div>
</button>