// User and Session Types
export interface UserStu {
    name?: string;
    email?: string;
    image?: string;
    student_id?: string;
    role?: string;
}

export interface Session {
    user?: UserStu;
    expires?: string;
}

// Table Types
export interface Table {
    id: number;
    capacity: number;
    minCapacity: number;
    floor_id: number;
    floor_name: string;
    // status?: 'available' | 'reserved' | 'occupied';
}

export type TableStatusType = 'available' | 'reserved' | 'occupied';

export interface TableStatus {
    tableId: number;
    timeSlot: string;
    status: 'available' | 'reserved' | 'occupied';
    userName?: string;
    partySize?: number;
}

export interface TableStatuses {
    [tableId: string]: {
        [timeSlot: string]: TableStatus;
    };
}

// Time Slot Types
export interface TimeSlot {
    id: string;
    startTime: string;
    endTime: string;
    displayTime: string;
}

// Reservation Types
export interface ReservationData {
    userName: string;
    partySize: number;
    studentIds?: string[];
}

export interface ReservationSubmitData {
    tableId: number;
    timeSlot: string;
    userName: string;
    partySize: number;
}

export interface ReservationCompleteData extends ReservationSubmitData {
    studentIds: string[];
}

// Stats Types
export interface TableStats {
    available: number;
    reserved: number;
    occupied: number;
}

// Modal Event Types
export interface ReservationModalEvents {
    submit: ReservationSubmitData;
    cancel: void;
}

export interface StudentIDModalEvents {
    submit: { studentIds: string[] };
    back: void;
    cancel: void;
}

export interface DetailModalEvents {
    close: void;
    reserve: void;
    checkin: void;
    checkout: void;
}

export interface TableButtonEvents {
    click: Table;   
}

// Auth Types
export interface AuthCallbacks {
    signIn: (params: { user: UserStu; account?: any; profile?: any }) => Promise<boolean>;
    session: (params: { session: Record<string, any>; token: any }) => Promise<Session>;
}

// Utility Types
// export type GetTableStatusFn = (
//     tableId: number,
//     timeSlot: string,
//     statuses: TableStatuses
// ) => TableStatus;
export type GetTableStatusFn = (
    id: number,
    timeSlot: string,
    statuses: any
) => TableStatus;

export type GetStatusColorFn = (status: TableStatusType) => string;
export type GetStatusIconFn = (status: TableStatusType) => string;
export type GetStatusTextFn = (status: TableStatusType) => string;

// Reservation Status Types
export type ReservationStatus = 
    | 'PENDING' 
    | 'CONFIRMED' 
    | 'CHECKED_IN' 
    | 'CHECKED_OUT' 
    | 'CANCELLED' 
    | 'AUTO_CANCELLED' 
    | 'EXPIRED';

// Backend Response Types
export interface BackendTimeSlot {
    slot_id: string;
    start_at: string;
    end_at: string;
}

// ตามโครงสร้างจริงของ Table ใน database
export interface BackendTable {
    table_id: number;
    capacity: number;
    min_capacity?: number;
    floor_id?: number;
    // เพิ่ม fields อื่นๆ ถ้ามี
}

export interface BackendReservationTable {
    reservation_id: number;
    table_id: number;
    timeslot_id: number;
    Table: BackendTable;  // ใช้โครงสร้างที่ถูกต้อง
    // timeslot: BackendTimeSlot;
}

export interface BackendReservation {
    reservation_id: number;
    user_id: number;
    timeslot_id: number;
    party_size: number;
    status: ReservationStatus;
    created_at: string;
    updated_at: string | null;
    timeslot: BackendTimeSlot;
    reservationtable: BackendReservationTable[];
}

// Current Reservation with Actions
export interface CurrentReservation extends BackendReservation {
    canCancel: boolean;
    canCheckin: boolean;
    canCheckout: boolean;
}

// API Response Types
export interface CheckReservationResponse {
    success: boolean;
    status: boolean;
    message?: string;
    tableReservation?: BackendReservation;
}

export interface ReservationHistoryResponse {
    success: boolean;
    reservations: BackendReservation[];
    count: number;
}

export interface ReservationActionResponse {
    success: boolean;
    message?: string;
    message_th?: string;
    error?: string;
    error_th?: string;
    reservation_id?: number;
    checkin_id?: number;
    checkin_time?: string;
}