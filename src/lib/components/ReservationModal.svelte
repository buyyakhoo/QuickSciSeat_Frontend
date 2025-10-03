<script lang="ts">
    import { X, User, Users, CheckCircle } from 'lucide-svelte';
    import { createEventDispatcher } from 'svelte';
    import { timeSlots } from '$lib/data/timeSlots';

    import type { Table, ReservationData, ReservationModalEvents } from '$lib/shared/types';

    // Props
    export let selectedTable: Table;
    export let selectedTimeSlot: string;
    export let reservationData: ReservationData;

    // Event dispatcher
    const dispatch = createEventDispatcher<ReservationModalEvents>();

    // Handle form submission - extract data and dispatch
    function handleFormSubmit(event: SubmitEvent) {
        event.preventDefault();
        
        // Extract form data directly from bound values
        dispatch('submit', {
            tableId: selectedTable.id,
            timeSlot: selectedTimeSlot,
            userName: reservationData.userName,
            partySize: reservationData.partySize
        });
    }
</script>

<div class="modal modal-open" role="dialog" tabindex="0" on:click|self={() => dispatch('cancel')} on:keydown|self={(e) => e.key === 'Escape' && dispatch('cancel')} aria-label="Close reservation modal">
    <div class="modal-box w-11/12 max-w-2xl" role="dialog" aria-modal="true">
        <div class="flex items-center justify-between mb-6">
            <div>
                <h3 class="font-bold text-2xl text-primary">📝 จองโต๊ะ #{selectedTable.id}</h3>
                <p class="text-sm text-base-content/70">โต๊ะ {selectedTable.capacity} ที่นั่ง (ขั้นต่ำ {selectedTable.minCapacity} คน)</p>
            </div>
            <button class="btn btn-sm btn-circle btn-ghost" on:click={() => dispatch('cancel')}>
                <X class="w-4 h-4" />
            </button>
        </div>
        
        <form on:submit={handleFormSubmit} class="space-y-6">
            <div class="card bg-base-200">
                <div class="card-body">
                    <h4 class="card-title text-lg flex items-center gap-2">
                        <User class="w-5 h-5 text-primary" />ข้อมูลผู้จอง
                    </h4>
                    <div class="grid gap-4">
                        <input name="userName" type="text" placeholder="ชื่อ-นามสกุล" class="input input-bordered" bind:value={reservationData.userName} required />
                    </div>
                </div>
            </div>
            
            <div class="card bg-base-200">
                <div class="card-body">
                    <h4 class="card-title text-lg flex items-center gap-2">
                        <Users class="w-5 h-5 text-primary" />จำนวนคน
                    </h4>
                    <select name="partySize" class="select select-bordered" bind:value={reservationData.partySize} required>
                        {#each Array.from({length: selectedTable.capacity - selectedTable.minCapacity + 1}, (_, i) => i + selectedTable.minCapacity) as size}
                            <option value={size}>{size} คน</option>
                        {/each}
                    </select>
                </div>
            </div>
            
            <div class="card bg-primary/10 border border-primary/20">
                <div class="card-body">
                    <h5 class="card-title text-lg">📋 สรุปการจอง</h5>
                    <div class="grid grid-cols-2 gap-4">
                        <div><span class="text-base-content/70">โต๊ะ:</span> <span class="font-bold">#{selectedTable.id} ({selectedTable.capacity} ที่นั่ง)</span></div>
                        <div><span class="text-base-content/70">เวลา:</span> <span class="font-bold">{timeSlots.find(slot => slot.id === selectedTimeSlot)?.displayTime}</span></div>
                    </div>
                </div>
            </div>
            
            <div class="form-control">
                <label class="label cursor-pointer justify-start gap-3">
                    <input type="checkbox" class="checkbox checkbox-primary" required />
                    <span class="text-sm">ฉันยอมรับเงื่อนไขการใช้บริการ (ต้อง check-in ภายใน 5 นาที)</span>
                </label>
            </div>
            
            <div class="modal-action">
                <button type="button" class="btn btn-ghost" on:click={() => dispatch('cancel')}>ยกเลิก</button>
                <button type="submit" class="btn btn-primary"><CheckCircle class="w-5 h-5" />ถัดไป: กรอกรหัสนักศึกษา</button>
            </div>
        </form>
    </div>
</div>