<script lang="ts">
    import { X, User, Mail, Phone, Calendar, LogIn, LogOut } from 'lucide-svelte';
    import { createEventDispatcher } from 'svelte';
    // import { timeSlots } from '$lib/data/mockData';

    import type { Table, TableStatus, GetStatusTextFn, GetStatusIconFn, DetailModalEvents } from '$lib/shared/types';

    import type { TimeSlot } from '$lib/shared/types';

    // Props
    export let selectedTable: Table;
    export let selectedTimeSlot: string;
    export let selectedTableStatus: TableStatus;
    export let timeslots: TimeSlot[];
    export let getStatusText: GetStatusTextFn;
    export let getStatusIcon: GetStatusIconFn;

    // Event dispatcher
    const dispatch = createEventDispatcher<DetailModalEvents>();

    function handleClose() {
        dispatch('close');
    }

    function handleReserve() {
        dispatch('reserve');
    }

    function handleCheckIn() {
        dispatch('checkin');
    }

    function handleCheckOut() {
        dispatch('checkout');
    }

    $: selectedSlot = timeslots.find(slot => slot.id === selectedTimeSlot);
</script>

<div class="modal modal-open" role="dialog" tabindex="0" 
     on:click|self={handleClose} 
     on:keydown|self={(e) => e.key === 'Escape' && handleClose()}>
    <div class="modal-box w-11/12 max-w-lg">
        <div class="flex items-center justify-between mb-6">
            <div>
                <h3 class="font-bold text-2xl text-primary">🍽️ โต๊ะ #{selectedTable.id}</h3>
                <p class="text-sm text-base-content/70">รายละเอียดการใช้งานโต๊ะ</p>
            </div>
            <button class="btn btn-sm btn-circle btn-ghost" on:click={handleClose}>
                <X class="w-4 h-4" />
            </button>
        </div>
    
        <div class="card bg-base-200 mb-6">
            <div class="card-body">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <div class="font-bold">{selectedTable.capacity} ที่นั่ง</div>
                        {#if selectedTable.minCapacity !== selectedTable.capacity}
                            <div class="text-xs text-base-content/60">ขั้นต่ำ {selectedTable.minCapacity} คน</div>
                        {/if}
                    </div>
                    <div>
                        <div class="font-bold">{selectedSlot?.displayTime}</div>
                    </div>
                </div>
                <div class="divider"></div>
                <div class="flex items-center justify-between">
                    <span>สถานะ:</span>
                    <div class="badge {selectedTableStatus.status === 'available' ? 'badge-success' : selectedTableStatus.status === 'reserved' ? 'badge-warning' : 'badge-error'} badge-lg">
                        {getStatusIcon(selectedTableStatus.status)} {getStatusText(selectedTableStatus.status)}
                    </div>
                </div>
            </div>
        </div>
    
        {#if selectedTableStatus.status !== 'available' && selectedTableStatus.userName}
            <div class="card bg-base-200 mb-6">
                <div class="card-body">
                    <h4 class="card-title text-lg">ข้อมูลผู้ใช้งาน</h4>
                    <div class="space-y-2">
                        <div><User class="w-4 h-4 inline mr-2" />{selectedTableStatus.userName} ({selectedTableStatus.partySize} คน)</div>
                    </div>
                </div>
            </div>
        {/if}
    
        <div class="modal-action">
            <button class="btn btn-ghost" on:click={handleClose}>ปิด</button>
            {#if selectedTableStatus.status === 'available'}
                <button class="btn btn-primary" on:click={handleReserve}>
                    <Calendar class="w-4 h-4" />จองโต๊ะนี้
                </button>
            {:else if selectedTableStatus.status === 'reserved'}
                <button class="btn bg-secondary-qss text-black" on:click={handleCheckIn}><LogIn class="w-4 h-4" />Check-in</button>
            {:else if selectedTableStatus.status === 'occupied'}
                <button class="btn bg-black text-white" on:click={handleCheckOut}><LogOut class="w-4 h-4" />Check-out</button>
            {/if}
        </div>
    </div>
</div>