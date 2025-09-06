<script lang="ts">
    export let timeSlots: Array<{
        id: string;
        startTime: string;
        endTime: string;
        displayTime: string;
    }>;
    export let selectedTimeSlot: string;
</script>

<div class="card bg-base-100 shadow-lg mb-8">
    <div class="card-body">
        <h2 class="card-title mb-4">🕐 เลือกช่วงเวลา</h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {#each timeSlots as slot}
                <button class="btn {selectedTimeSlot === slot.id ? 'btn-primary' : 'btn-ghost'}" onclick={() => selectedTimeSlot = slot.id}>
                <div class="text-center">
                    <div class="font-bold text-xs">{slot.startTime}</div>
                    <div class="text-xs opacity-70">{slot.endTime}</div>
                </div>
                </button>
            {/each}
        </div>
        <div class="text-center mt-4">
            <span class="text-sm">เวลาที่เลือก: </span>
            <span class="font-bold">{timeSlots.find((slot: { id: string; }) => slot.id === selectedTimeSlot)?.displayTime}</span>
        </div>
    </div>
</div>