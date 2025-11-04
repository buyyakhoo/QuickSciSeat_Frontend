<script lang="ts">
    import '../app.css'
    import { Home, Calendar, User, LogOut, Sun, Moon, Users, X, Clock, Mail, Phone, CheckCircle, LogIn, ArrowLeft, GraduationCap } from 'lucide-svelte';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { tables, timeSlots, tableStatuses, getTableStatus } from '$lib/data/mockData';
   
    import ReservationModal from '$lib/components/ReservationModal.svelte';
    import StudentIDModal from '$lib/components/StudentIDModal.svelte';
    import DetailModal from '$lib/components/DetailModal.svelte';
    import NavBar from '$lib/components/NavBar.svelte';
    import Header from '$lib/components/Header.svelte';
    import Stats from '$lib/components/Stats.svelte';
    import TimeSelector from '$lib/components/TimeSelector.svelte';
    import Legend from '$lib/components/Legend.svelte';
    import TableButton from '$lib/components/TableButton.svelte';
    import UserCard from '$lib/components/UserCard.svelte';

    import type { ReservationSubmitData, Session } from '$lib/shared/types';
    import type { Table, TimeSlot, TableStatus } from '$lib/shared/types';

    import { browser } from '$app/environment';

    export let data: { 
        session?: Session;
    };

    let selectedTimeSlot = 'slot-8';
    
    // Modal states
    let showReservationModal = false;
    let showDetailModal = false;
    let showStudentIdModal = false;
    let selectedTable: Table;
    let selectedTableStatus: TableStatus | null = null;
    
    // Form data
    let reservationData = {
        userName: '',
        partySize: 2,
        studentIds: [] as string[]
    };

    // ตรวจสอบ session จาก data ที่ส่งมาจาก server
    $: session = data.session;

    // Redirect to auth if no session
    onMount(() => {
        if (!session) {
            goto('/auth');
        }
    });

    $: if (!session && browser) {
        window.location.href = '/auth';
    }

    // reactive statement
    $: if (session?.user?.name) {
        reservationData.userName = session.user.name;
    }

    function resetReservationData() {
        reservationData = {
            userName: session?.user?.name || '',
            partySize: 2,
            studentIds: []
        };
    }
  
    function handleTableClick(table: Table) {
        const status = getTableStatus(table.id, selectedTimeSlot, tableStatuses);
        selectedTable = table;
        selectedTableStatus = status;
        
        if (status.status === 'available') {
            resetReservationData();
            showReservationModal = true;
        } else {
            showDetailModal = true;
        }
    }
  
    function handleReservationSubmit(event: CustomEvent<ReservationSubmitData>) {
        const data = event.detail;
        
        reservationData.userName = data.userName;
        reservationData.partySize = data.partySize;
        reservationData.studentIds = Array(data.partySize).fill('');
        
        showReservationModal = false;
        showStudentIdModal = true;
    }
  
    function handleStudentIdSubmit(event: CustomEvent<{ studentIds: string[] }>) {
        const studentIds = event.detail.studentIds;
        
        alert(`จองโต๊ะ ${selectedTable?.id} สำเร็จ!\n\n• ผู้จอง: ${reservationData.userName}\n• จำนวน: ${reservationData.partySize} คน\n• เวลา: ${timeSlots.find(slot => slot.id === selectedTimeSlot)?.displayTime}\n• รหัสนักศึกษา: ${studentIds.join(', ')}\n\nกรุณา check-in ภายในเวลา!`);
        
        showStudentIdModal = false;
        resetReservationData();
    }
  
    function handleBackToReservation() {
        showStudentIdModal = false;
        showReservationModal = true;
    }
  
    function handleCheckIn() {
        alert(`Check-in โต๊ะ ${selectedTable?.id} สำเร็จ! เริ่มใช้งานได้เลย`);
        showDetailModal = false;
    }
    
    function handleCheckOut() {
        alert(`Check-out โต๊ะ ${selectedTable?.id} สำเร็จ! ขอบคุณที่ใช้บริการ`);
        showDetailModal = false;
    }
  
    function getStatusText(status: string): string {
        switch (status) {
            case 'available': return 'ว่าง';
            case 'reserved': return 'จองแล้ว';
            case 'occupied': return 'ใช้งาน';
            default: return 'ไม่ทราบ';
        }
    }
    
    function getStatusColor(status: string): string {
        switch (status) {
            case 'available': return 'bg-accent-qss text-success-content';
            case 'reserved': return 'bg-secondary-qss text-warning-content';
            case 'occupied': return 'bg-primary-qss text-error-content';
            default: return 'bg-base-200 text-base-content';
        }
    }
  
    function getStatusIcon(status: string): string {
        switch (status) {
            case 'available': return '✅';
            case 'reserved': return '⏰';
            case 'occupied': return '🔴';
            default: return '❓';
        }
    }

    $: stats = (() => {
        let available = 0, reserved = 0, occupied = 0;
        tables.forEach((table: Table) => {
            const status = getTableStatus(table.id, selectedTimeSlot, tableStatuses);
            if (status.status === 'available') available++;
            else if (status.status === 'reserved') reserved++;
            else if (status.status === 'occupied') occupied++;
        });
        return { available, reserved, occupied };
    })();
</script>

<svelte:head>
    <title>หน้าแรก - QuickSciSeat</title>
</svelte:head>

<!-- Session Expired Alert -->
{#if !session}
    <div class="min-h-screen flex items-center justify-center bg-base-200">
        <div class="text-center">
            <div class="loading loading-spinner loading-lg mb-4"></div>
            <p>กำลังตรวจสอบสิทธิ์การเข้าใช้งาน...</p>
        </div>
    </div>
{:else}

<NavBar {session} />

<!-- Content -->
<div class="min-h-screen bg-base-200">
    <div class="container mx-auto px-4 py-8 max-w-7xl">    
        <!-- Header -->
        <Header />

        <!-- User Info Card -->
        <UserCard {session} />
        
        <!-- Stats -->
        <Stats {stats} {tables} />
        
        <!-- Time Selector -->
        <TimeSelector {timeSlots} bind:selectedTimeSlot />
        
        <!-- Legend -->
        <Legend />
        
        <!-- Tables -->
        {#each [
            {title: 'โต๊ะ 2 ที่นั่ง', tables: tables.filter(t => t.capacity === 2)},
            {title: 'โต๊ะ 4 ที่นั่ง', tables: tables.filter(t => t.capacity === 4)},
            {title: 'โต๊ะ 6 ที่นั่ง', tables: tables.filter(t => t.capacity === 6)}
        ] as group}
        <div class="mb-8">
            <h3 class="text-xl font-bold mb-4">{group.title}</h3>
            <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-10 gap-3">
                {#each group.tables as table}
                    {@const status = getTableStatus(table.id, selectedTimeSlot, tableStatuses)}
                    {@const tableWithStatus = { ...table, status: status.status }}
                    <TableButton 
                        table={tableWithStatus}
                        {selectedTimeSlot}
                        {tableStatuses}
                        {getTableStatus}
                        {getStatusColor}
                        {getStatusText} 
                        on:click={({ detail }) => handleTableClick(detail)}
                    />
                {/each}
            </div>
        </div>
        {/each}
    </div>
</div>

{/if}

<!-- Reservation Modal -->
{#if showReservationModal && selectedTable}
    <ReservationModal 
        {selectedTable} 
        {selectedTimeSlot} 
        {reservationData} 
        on:submit={handleReservationSubmit} 
        on:cancel={() => {showReservationModal = false; resetReservationData();}} 
    />
{/if}

<!-- Student ID Modal -->
{#if showStudentIdModal && selectedTable}
    <StudentIDModal
        {selectedTable}
        {selectedTimeSlot}
        {reservationData}
        on:submit={handleStudentIdSubmit}
        on:back={handleBackToReservation}
        on:cancel={() => {showStudentIdModal = false; resetReservationData();}}
    />
{/if}

<!-- Detail Modal -->
{#if showDetailModal && selectedTable && selectedTableStatus}
    <DetailModal
        {selectedTable}
        {selectedTimeSlot}
        {selectedTableStatus}
        {getStatusText}
        {getStatusIcon}
        on:close={() => showDetailModal = false}
        on:reserve={() => {showDetailModal = false; showReservationModal = true;}}
        on:checkin={handleCheckIn}
        on:checkout={handleCheckOut}
    />
{/if}