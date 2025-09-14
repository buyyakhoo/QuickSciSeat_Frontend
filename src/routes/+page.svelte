<script lang="ts">
    import '../app.css'
    import { Home, Calendar, User, LogOut, Sun, Moon, Users, X, Clock, Mail, Phone, CheckCircle, LogIn, ArrowLeft, GraduationCap } from 'lucide-svelte';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { tables, timeSlots, tableStatuses, getTableStatus, type Table, type TableStatus } from '$lib/data/mockData';
    import ReservationModal from '$lib/components/ReservationModal.svelte';
    import StudentIDModal from '$lib/components/StudentIDModal.svelte';
    import DetailModal from '$lib/components/DetailModal.svelte';
    import NavBar from '$lib/components/NavBar.svelte';
    import Header from '$lib/components/Header.svelte';
    import Stats from '$lib/components/Stats.svelte';
    import TimeSelector from '$lib/components/TimeSelector.svelte';
    import Legend from '$lib/components/Legend.svelte';
    import TableButton from '$lib/components/TableButton.svelte';

    let selectedTimeSlot = 'slot-8';
    
    // User session state
    let userSession: {
        user: {
            google_id: string;
            email: string;
            name: string;
            avatar: string;
            role: string;
            student_id?: string;
        };
        expires_at: string;
        session_id: string;
    } | null = null;
    
    let sessionExpired = false;
    
    // Modal states - ประกาศครบทุกตัว
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

    // Check user session on mount
    onMount(() => {
        checkUserSession();
    });

    function checkUserSession() {
        try {
            const sessionData = localStorage.getItem('user_session');
            if (sessionData) {
                const session = JSON.parse(sessionData);
                
                // Check if session is expired
                const now = new Date();
                const expiresAt = new Date(session.expires_at);
                
                if (now > expiresAt) {
                    // Session expired
                    localStorage.removeItem('user_session');
                    sessionExpired = true;
                    setTimeout(() => {
                        goto('/auth');
                    }, 3000);
                } else {
                    // Valid session
                    userSession = session;
                    // Pre-fill userName with logged-in user's name
                    reservationData.userName = session.user.name;
                }
            } else {
                // No session found, redirect to auth
                goto('/auth');
            }
        } catch (error) {
            console.error('Error checking session:', error);
            goto('/auth');
        }
    }

    function handleLogout() {
        localStorage.removeItem('user_session');
        userSession = null;
        goto('/auth');
    }

    function resetReservationData() {
        reservationData = {
            userName: userSession?.user.name || '',
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
  
    function handleReservationSubmit(event: CustomEvent<{
        tableId: number;
        timeSlot: string;
        userName: string;
        partySize: number;
    }>) {
        const data = event.detail;
        
        // Update reservation data with the received values
        reservationData.userName = data.userName;
        reservationData.partySize = data.partySize;
        
        // Create array of student IDs based on party size
        reservationData.studentIds = Array(data.partySize).fill('');
        
        // Close reservation modal and open student ID modal
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
            case 'available': return 'bg-success text-success-content';
            case 'reserved': return 'bg-warning text-warning-content';
            case 'occupied': return 'bg-error text-error-content';
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

    function formatTimeRemaining(expiresAt: string): string {
        const now = new Date();
        const expires = new Date(expiresAt);
        const diff = expires.getTime() - now.getTime();
        
        if (diff <= 0) return 'หมดอายุแล้ว';
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 0) {
            return `อีก ${hours} ชั่วโมง ${minutes} นาที`;
        } else {
            return `อีก ${minutes} นาที`;
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
{#if sessionExpired}
<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-base-100 rounded-lg p-6 max-w-md mx-4">
        <div class="text-center">
            <div class="text-6xl mb-4">⏰</div>
            <h3 class="text-lg font-bold mb-2">เซสชันหมดอายุ</h3>
            <p class="text-base-content/70 mb-4">กรุณาเข้าสู่ระบบใหม่เพื่อใช้งานต่อ</p>
            <div class="loading loading-spinner loading-md"></div>
            <p class="text-sm mt-2">กำลังนำไปหน้าเข้าสู่ระบบ...</p>
        </div>
    </div>
</div>
{/if}

<!-- Loading state while checking session -->
{#if !userSession && !sessionExpired}
<div class="min-h-screen flex items-center justify-center bg-base-200">
    <div class="text-center">
        <div class="loading loading-spinner loading-lg mb-4"></div>
        <p>กำลังตรวจสอบสิทธิ์การเข้าใช้งาน...</p>
    </div>
</div>
{:else if userSession}

<NavBar />

<!-- Content -->
<div class="min-h-screen bg-base-200">
    <div class="container mx-auto px-4 py-8 max-w-7xl">
        
        <!-- User Info Card -->
        <div class="card bg-base-100 shadow-lg mb-6">
            <div class="card-body p-6">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <div class="avatar">
                            <div class="w-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                                <img src={userSession.user.avatar} alt="User avatar" />
                            </div>
                        </div>
                        <div>
                            <h2 class="text-2xl font-bold text-base-content">สวัสดี {userSession.user.name} 👋</h2>
                            <div class="flex flex-wrap gap-2 mt-1">
                                <div class="badge badge-primary">
                                    <Mail class="w-3 h-3 mr-1" />
                                    {userSession.user.email}
                                </div>
                                {#if userSession.user.student_id}
                                <div class="badge badge-secondary">
                                    <GraduationCap class="w-3 h-3 mr-1" />
                                    รหัสนักศึกษา: {userSession.user.student_id}
                                </div>
                                {/if}
                                <div class="badge badge-accent">
                                    <User class="w-3 h-3 mr-1" />
                                    {userSession.user.role}
                                </div>
                            </div>
                            <div class="text-sm text-base-content/70 mt-2">
                                <Clock class="w-4 h-4 inline mr-1" />
                                เซสชันหมดอายุ: {formatTimeRemaining(userSession.expires_at)}
                            </div>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button 
                            class="btn btn-outline btn-sm"
                            on:click={handleLogout}
                        >
                            <LogOut class="w-4 h-4" />
                            ออกจากระบบ
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Header -->
        <Header />
        
        <!-- Stats -->
        <Stats {stats} {tables} />
        
        <!-- Time Selector -->
        <TimeSelector {timeSlots} bind:selectedTimeSlot />
        
        <!-- Legend -->
        <Legend />
        
        <!-- Tables -->
        {#each [
            {title: '👥 โต๊ะ 2 ที่นั่ง (1-20)', tables: tables.filter(t => t.capacity === 2)},
            {title: '👨‍👩‍👧‍👦 โต๊ะ 4 ที่นั่ง (21-40)', tables: tables.filter(t => t.capacity === 4)},
            {title: '👨‍👩‍👧‍👧 โต๊ะ 6 ที่นั่ง (41-50)', tables: tables.filter(t => t.capacity === 6)}
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
                        {getStatusIcon}
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