<script lang="ts">
    import { timeSlots } from "$lib/data/mockData";
    import { ArrowLeft, GraduationCap, X } from "lucide-svelte";
    import { createEventDispatcher } from 'svelte';

    import type { Table, TimeSlot, ReservationData, StudentIDModalEvents } from '$lib/shared/types';

    export let selectedTable: Table;
    export let selectedTimeSlot: string;
    export let reservationData: ReservationData;

    // สร้าง array สำหรับเก็บรหัสนักศึกษา
    let studentIds = Array(reservationData.partySize).fill('');

    // Event dispatcher
    const dispatch = createEventDispatcher<StudentIDModalEvents>();

    function handleFormSubmit(event: Event) {
        event.preventDefault();
        
        // ตรวจสอบว่าทุกช่องกรอกครบแล้ว
        const isValid = studentIds.every(id => id.length === 8);
        
        if (!isValid) {
            alert('กรุณากรอกรหัสนักศึกษาให้ครบทุกช่อง (8 หลัก)');
            return;
        }
        
        // ส่งข้อมูลรหัสนักศึกษาไปยัง parent
        dispatch('submit', { studentIds });
    }

    function handleBack() {
        dispatch('back');
    }

    function handleCancel() {
        dispatch('cancel');
    }
</script>

<div class="modal modal-open" role="dialog" tabindex="0" 
     on:click|self={handleCancel} 
     on:keydown|self={(e) => e.key === 'Escape' && handleCancel()} 
     aria-label="Close student ID modal">
    <div class="modal-box w-11/12 max-w-2xl">
        <div class="flex items-center justify-between mb-6">
            <div>
                <h3 class="font-bold text-2xl text-primary flex items-center gap-2">
                    <GraduationCap class="w-6 h-6" />
                    กรอกรหัสนักศึกษา
                </h3>
                <p class="text-sm text-base-content/70">
                    กรุณากรอกรหัสนักศึกษาของสมาชิกทุกคน ({reservationData.partySize} คน)
                </p>
            </div>
            <button class="btn btn-sm btn-circle btn-ghost" on:click={handleCancel}>
                <X class="w-4 h-4" />
            </button>
        </div>
        
        <!-- Reservation Summary -->
        <div class="card bg-base-200 mb-6">
            <div class="card-body">
                <h4 class="card-title text-lg">📋 ข้อมูลการจอง</h4>
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div><span class="text-base-content/70">ผู้จอง:</span> <span class="font-bold">{reservationData.userName}</span></div>
                    <div><span class="text-base-content/70">โต๊ะ:</span> <span class="font-bold">#{selectedTable.id} ({selectedTable.capacity} ที่นั่ง)</span></div>
                    <div><span class="text-base-content/70">จำนวน:</span> <span class="font-bold">{reservationData.partySize} คน</span></div>
                    <div><span class="text-base-content/70">เวลา:</span> <span class="font-bold">{timeSlots.find(slot => slot.id === selectedTimeSlot)?.displayTime}</span></div>
                </div>
            </div>
        </div>
        
        <form on:submit={handleFormSubmit} class="space-y-6">
            <div class="card bg-base-200">
                <div class="card-body">
                    <h4 class="card-title text-lg flex items-center gap-2">
                        <GraduationCap class="w-5 h-5 text-primary" />
                        รหัสนักศึกษา
                    </h4>
                    <div class="space-y-4">
                        {#each Array(reservationData.partySize) as _, index}
                            <div class="form-control">
                                <label class="label" for="studentId{index}">
                                    <span class="label-text font-medium">คนที่ {index + 1} {index === 0 ? '(ผู้จอง)' : ''} *</span>
                                </label>
                                <div class="input-group">
                                    <span class="bg-primary text-primary-content px-3 flex items-center text-sm font-bold">
                                        #{index + 1}
                                    </span>
                                    <input
                                        id="studentId{index}"
                                        type="text"
                                        inputmode="numeric"
                                        placeholder="เช่น 66050999"
                                        class="input input-bordered flex-1"
                                        bind:value={studentIds[index]}
                                        on:input={(e) => {
                                            studentIds[index] = e.currentTarget.value.replace(/[^0-9]/g, '').slice(0, 8);
                                        }}
                                        class:input-error={studentIds[index].length > 0 && studentIds[index].length < 8}
                                        autocomplete="off"
                                        maxlength="8"
                                        required
                                    />
                                </div>
                                <label class="label" for="studentId{index}">
                                    <span class="label-text-alt text-base-content/60">รหัสนักศึกษา 8 หลัก</span>
                                    {#if studentIds[index].length > 0 && studentIds[index].length < 8}
                                        <span class="label-text-alt text-error">ต้องครบ 8 หลัก</span>
                                    {/if}
                                </label>
                            </div>
                        {/each}
                    </div>
                </div>
            </div>
            
            <!-- Warning -->
            <div class="alert alert-warning">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div class="text-sm">
                    <div class="font-semibold">ข้อมูลสำคัญ!</div>
                    <div>• รหัสนักศึกษาจะใช้สำหรับการ check-in</div>
                    <div>• กรุณาตรวจสอบรหัสให้ถูกต้องก่อนยืนยัน</div>
                    <div>• ทุกคนต้องมีรหัสนักศึกษาของมหาวิทยาลัย</div>
                </div>
            </div>
            
            <div class="modal-action">
                <button type="button" class="btn btn-ghost" on:click={handleBack}>
                    <ArrowLeft class="w-4 h-4" />
                    กลับแก้ไขข้อมูล
                </button>
                <button type="submit" class="btn btn-success btn-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m-6 4l-2-2m6 4l2-2m-6-4l-2-2" />
                    </svg>
                    ยืนยันการจอง
                </button>
            </div>
        </form>
    </div>
</div>