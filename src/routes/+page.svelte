<script lang="ts">
    import '../app.css'
    import { Home, Calendar, User, LogOut, Sun, Moon, Users, X, Clock, Mail, Phone, CheckCircle, LogIn, ArrowLeft, GraduationCap } from 'lucide-svelte';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    // import { tables, tableStatuses, getTableStatus } from '$lib/data/mockData';
    // import { getTableStatus } from '$lib/data/mockData';
    // import { timeSlots } from '$lib/data/timeSlots';
    // import { getTimeSlots } from '$lib/data/timeSlots';

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
    // import { VITE_BACKEND_API_URL } from '$env/static/private';

    export let data: { 
        session?: Session;
    };

    let selectedTimeSlot = 'slot-08';
    
    // Modal states
    let showReservationModal = false;
    let showDetailModal = false;
    let showStudentIdModal = false;
    let selectedTable: Table;
    let selectedTableStatus: TableStatus;
    
    // Form data
    let reservationData = {
        userName: '',
        partySize: 2,
        studentIds: [] as string[]
    };

    // ตรวจสอบ session จาก data ที่ส่งมาจาก server
    $: session = data.session;

    let timeslots: TimeSlot[] = [];

    const fetchTimeSlots = async () => {
        try {
            console.log('Fetching time slots from backend...');
            const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL

            console.log('ENV:', import.meta.env.VITE_BACKEND_API_URL);
            console.log('ALL ENV:', import.meta.env);

            const response = await fetch(`${BACKEND_URL}/table_service/timeslots`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                console.error('Failed to fetch time slots:', response.status);
            }

            const data = await response.json();
            
            // Backend returns: { success: true, timeslots: [...] }
            if (!data.success || !Array.isArray(data.timeslots)) {
                console.error('Invalid response format:', data);
            }

            // Map backend fields to frontend TimeSlot type
            const slots: TimeSlot[] = data.timeslots.map((slot: any) => ({
                id: slot.slot_id,              
                startTime: slot.start_at,      
                endTime: slot.end_at,          
                displayTime: `${slot.start_at} - ${slot.end_at}`
            }));
            console.log('Loaded', slots.length, 'time slots');
            console.log(slots);
            timeslots = slots;

        } catch (error) {
            console.error('Error fetching time slots:', error);
        }
    };

    let tables: Table[] = [];

    const fetchTables = async () => {
        try {
            console.log('Fetching tables from backend...');
            const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL

            const response = await fetch(`${BACKEND_URL}/table_service/tables`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                console.error('Failed to fetch tables:', response.status);
            }

            const data = await response.json();
            
            // Backend returns: { success: true, tables: [...] }
            if (!data.success || !Array.isArray(data.tables)) {
                console.error('Invalid response format:', data);
            }

            // Map backend fields to frontend Table type
            const tbls: Table[] = data.tables.map((table: any) => ({
                id: table.table_id,
                capacity: table.capacity,
                minCapacity: table.min_capacity,
                floor_id: table.floor.floor_id,
                floor_name: table.floor.floor_name
            }));
            console.log('Loaded', tbls.length, 'tables');
            console.log(tbls);
            tables = tbls;
        } catch (error) {
            console.error('Error fetching tables:', error);
        }
    }


    let tableStatuses: TableStatus[] = [];

    const fetchTableStatuses = async () => {
        try {
            console.log('Fetching table statuses from backend...');
            const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL

            const response = await fetch(`${BACKEND_URL}/table_service/timeslot/all/tables`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                console.error('Failed to fetch table statuses:', response.status);
            }

            const data = await response.json();

            console.log("THIS IS FETCHTABLESTATUS: " + JSON.stringify(data));
            
            // เช็คว่า data เป็น array หรือ object
            let statusArray: any[] = [];
            
            if (Array.isArray(data)) {
                // Backend return array โดยตรง: [{...}, {...}]
                console.log('Data is array');
                statusArray = data;
            } else if (data.success && Array.isArray(data.table_statuses)) {
                // Backend return object: { success: true, table_statuses: [...] }
                console.log('Data is object with table_statuses');
                statusArray = data.table_statuses;
            } else {
                console.error('Invalid response format');
                return;
            }

            console.log('Loaded table statuses:', data.table_statuses);

            tableStatuses = statusArray.map((table: any) => ({
                tableId: table.table_id,
                timeSlot: table.slot_id,
                // tableCode: table.table_code,
                status: table.status,
                // capacity: table.capacity,
                // minCapacity: table.min_capacity
            }));

            console.log('Loaded', tableStatuses.length, 'table statuses');

        } catch (error) {
            console.error('Error fetching table statuses:', error);
        }
    };

    
    // Redirect to auth if no session
    onMount(async () => {
        if (!session) {
            goto('/auth');
        }

        // console.log('Before Fetching Time Slots');

        await fetchTimeSlots();
        await fetchTables();

        console.log("------- BEFORE FETCHING TABLE STATUSES -------");
        await fetchTableStatuses();
        console.log("------- AFTER FETCHING TABLE STATUSES -------");

        tableStatusesSelected = getTableStatusesSelectSlot(selectedTimeSlot);

        // console.log('After Fetching Time Slots:', timeSlots);
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

    function getTableStatus(tableId: number, timeSlot: string, statuses: TableStatus[]): TableStatus {
        const status = statuses.find(ts => ts.tableId === tableId && ts.timeSlot === timeSlot);
        return status || { tableId, timeSlot, status: 'occupied' };
    }
  
    async function handleTableClick(table: Table) {
        const tableSelected = getTableStatus(table.id, selectedTimeSlot, tableStatuses);
        console.log('Table clicked:', table, 'Status:', tableSelected);
        selectedTable = table;
        selectedTableStatus = {
            tableId: tableSelected?.tableId || table.id,
            timeSlot: selectedTimeSlot,
            status: tableSelected?.status,
        }

        const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL;
        
        // ใช้ endpoint ใหม่ที่มี table_id และ slot_id
        const checkReservationResponse = await fetch(
            `${BACKEND_URL}/reservation_service/check/${session?.user?.student_id}/reservation`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );
        
        const reservationCheck = await checkReservationResponse.json();
        const tableReservedStatus = reservationCheck.status;
        const tableReservedID = reservationCheck.tableReservation?.reservationtable[0].table_id;
        const tableReservedTimeSlotCode = reservationCheck.tableReservation?.reservationtable[0].timeslot.slot_id;

        console.log('Reservation check:', reservationCheck);

        if (tableSelected?.status === 'available' && !tableReservedStatus) {
            resetReservationData();
            showReservationModal = true;
        } else if (tableSelected?.status === 'available' && tableReservedStatus) {
            alert('คุณมีการจองโต๊ะอยู่แล้ว ไม่สามารถจองโต๊ะเพิ่มได้ กรุณายกเลิกการจองเดิมก่อน');
        } else if ((tableSelected?.status === 'reserved' || tableSelected?.status === 'occupied') && tableReservedID === table.id && tableReservedTimeSlotCode === selectedTimeSlot) {
            showDetailModal = true;
        } else {
            alert('โต๊ะนี้มีคนอื่นจองไว้แล้ว กรุณาเลือกโต๊ะที่คุณจองไว้เท่านั้น หากยังไม่จองให้ทำการจองโต๊ะที่ว่างเท่านั้น');
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
  
    async function handleStudentIdSubmit(event: CustomEvent<{ studentIds: string[] }>) {
        const studentIds = event.detail.studentIds;

        try {
            const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL

            const timeslotResponse = await fetch(
                `${BACKEND_URL}/table_service/timeslot/${selectedTimeSlot}/table/${selectedTable.id}`
            );
            
            const timeslotData = await timeslotResponse.json();
            const timeslot_id = timeslotData?.timeslot?.timeslot_id;

            const reservationPayload = {
                user_id: session?.user?.student_id,
                timeslot_id: timeslot_id,
                party_size: reservationData.partySize,
                table_ids: [selectedTable.id],
                student_ids: studentIds
            };

            const response = await fetch(`${BACKEND_URL}/reservation_service/reservation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reservationPayload)
            });

            if (!response.ok) {
                // Try to parse error body from backend to show a helpful message
                let errMessage = `Failed to submit reservation: ${response.status}`;
                try {
                    const errBody = await response.json();
                    const backendMsg = errBody?.error_th ?? errBody?.message ?? null;
                    const existingId = errBody?.existing_reservation_id ?? null;
                    if (backendMsg) {
                        errMessage = backendMsg;
                    } else {
                        // fallback to stringified body if no known fields
                        errMessage = JSON.stringify(errBody);
                    }
                    if (existingId) {
                        errMessage += `ในโต๊ะที่ ${existingId}`;
                    }
                } catch (e) {
                    // ignore JSON parse errors and keep the generic message
                }
                alert(errMessage);
                throw new Error(errMessage);
            }

            console.log('Submitting reservation with payload:', reservationPayload);
            

            alert(`จองโต๊ะ ${selectedTable?.id} สำเร็จ!\n\n• ผู้จอง: ${reservationData.userName}\n• จำนวน: ${reservationData.partySize} คน\n• เวลา: ${timeslots.find(slot => slot.id === selectedTimeSlot)?.displayTime}\n• รหัสนักศึกษา: ${studentIds.join(', ')}\n\nกรุณา check-in ภายในเวลา!`);
            
            await fetchTableStatuses();
            tableStatusesSelected = getTableStatusesSelectSlot(selectedTimeSlot);
        } catch (error) {
            console.error('Error submitting reservation:', error);
            alert('เกิดข้อผิดพลาดในการจองโต๊ะ กรุณาลองใหม่อีกครั้ง');
        } finally {
            showStudentIdModal = false;
            resetReservationData();
        }
    }
  
    function handleBackToReservation() {
        showStudentIdModal = false;
        showReservationModal = true;
    }
  
    async function handleCheckIn() {
        try {
            const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL;

            // 1. ดึงข้อมูล user_id และตรวจสอบ
            const user_id_str = session?.user?.student_id;
            
            if (!user_id_str) {
                alert('ไม่พบข้อมูลผู้ใช้');
                return;
            }

            const user_id = parseInt(user_id_str); // แปลงเป็น number

            if (isNaN(user_id)) {
                alert('รหัสผู้ใช้ไม่ถูกต้อง');
                return;
            }

            // 2. หา reservation_id จาก backend
            const checkResponse = await fetch(
                `${BACKEND_URL}/reservation_service/check/${user_id}/${selectedTable.id}/${selectedTimeSlot}/reservation`
            );

            if (!checkResponse.ok) {
                throw new Error('Failed to check reservation');
            }

            const checkData = await checkResponse.json();
            
            if (!checkData.status || !checkData.tableReservation) {
                alert('ไม่พบการจองของคุณ');
                return;
            }

            const reservation_id = checkData.tableReservation.reservation_id;

            // 3. เรียก Check-in API
            console.log('Checking in with reservation_id:', reservation_id, 'user_id:', user_id);

            const response = await fetch(`${BACKEND_URL}/reservation_service/reservation/checkin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reservation_id,
                    user_id
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error_th || errorData.error || 'Check-in failed');
            }

            const result = await response.json();
            console.log('Check-in successful:', result);

            // 4. แสดงข้อความสำเร็จ
            alert(`Check-in โต๊ะ ${selectedTable?.id} สำเร็จ!\n\nเริ่มใช้งานได้เลย\nCheckin ID: ${result.checkin_id}`);
            
            // 5. รีเฟรชข้อมูลโต๊ะ
            await fetchTableStatuses();
            tableStatusesSelected = getTableStatusesSelectSlot(selectedTimeSlot);

            showDetailModal = false;

        } catch (error) {
            console.error('Error during check-in:', error);
            alert(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'กรุณาลองใหม่อีกครั้ง'}`);
        }
    }

    // function handleCheckOut() {
    //     alert(`Check-out โต๊ะ ${selectedTable?.id} สำเร็จ! ขอบคุณที่ใช้บริการ`);
    //     showDetailModal = false;
    // }
    async function handleCheckOut() {
        try {
            const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL;
            
            // 1. ดึงข้อมูล user_id และตรวจสอบ
            const user_id_str = session?.user?.student_id;
            
            if (!user_id_str) {
                alert('ไม่พบข้อมูลผู้ใช้');
                return;
            }

            const user_id = parseInt(user_id_str); // แปลงเป็น number

            if (isNaN(user_id)) {
                alert('รหัสผู้ใช้ไม่ถูกต้อง');
                return;
            }

            // 2. หา reservation_id
            const checkResponse = await fetch(
                `${BACKEND_URL}/reservation_service/check/${user_id}/${selectedTable.id}/${selectedTimeSlot}/reservation`
            );

            if (!checkResponse.ok) {
                throw new Error('Failed to check reservation');
            }

            const checkData = await checkResponse.json();
            
            if (!checkData.status || !checkData.tableReservation) {
                alert('ไม่พบการจองของคุณ');
                return;
            }

            const reservation_id = checkData.tableReservation.reservation_id;

            // 3. เรียก Check-out API
            console.log('Checking out with reservation_id:', reservation_id, 'user_id:', user_id);

            const response = await fetch(`${BACKEND_URL}/reservation_service/reservation/checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reservation_id,
                    user_id 
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error_th || errorData.error || 'Check-out failed');
            }

            const result = await response.json();
            console.log('Check-out successful:', result);

            // 4. แสดงข้อความสำเร็จ
            alert(`Check-out โต๊ะ ${selectedTable?.id} สำเร็จ!\n\nขอบคุณที่ใช้บริการ`);
            
            // 5. รีเฟรชข้อมูลโต๊ะ
            await fetchTableStatuses();
            tableStatusesSelected = getTableStatusesSelectSlot(selectedTimeSlot);

            showDetailModal = false;

        } catch (error) {
            console.error('Error during check-out:', error);
            alert(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'กรุณาลองใหม่อีกครั้ง'}`);
        }
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

    function getTableStatusesSelectSlot(slot_id: string): TableStatus[] {
        return tableStatuses.filter(ts => ts.timeSlot === slot_id);
    }

    $: tableStatusesSelected = getTableStatusesSelectSlot(selectedTimeSlot);

    $: stats = (() => {
        let available = 0, reserved = 0, occupied = 0;
        tableStatusesSelected.forEach((table: TableStatus) => {
            if (table.status === 'available') available++;
            else if (table.status === 'reserved') reserved++;
            else if (table.status === 'occupied') occupied++;
        });
        return { available, reserved, occupied};
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
        <TimeSelector {timeslots} bind:selectedTimeSlot />
        
        <!-- Legend -->
        <Legend />
        
        <!-- Tables -->
        {#each [
            {title: 'ชั้น 1', tables: tables.filter(t => t.floor_id === 1)},
            {title: 'ชั้น 2', tables: tables.filter(t => t.floor_id === 2)},
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
        {timeslots}
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
        {timeslots}
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
        {timeslots}
        {getStatusText}
        {getStatusIcon}
        on:close={() => showDetailModal = false}
        on:reserve={() => {showDetailModal = false; showReservationModal = true;}}
        on:checkin={handleCheckIn}
        on:checkout={handleCheckOut}
    />
{/if}