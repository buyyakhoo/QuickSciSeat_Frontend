// User and Session Types
export interface User {
    name?: string;
    email?: string;
    image?: string;
    student_id?: string;
    role?: string;
}

export interface Session {
    user?: User;
    expires?: string;
}

// Table Types
export interface Table {
    id: number;
    capacity: number;
    minCapacity: number;
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
    signIn: (params: { user: User; account?: any; profile?: any }) => Promise<boolean>;
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