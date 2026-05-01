export interface Location {
    lat: number;
    lng: number;
}
/** Shape returned on the wire for an SOS alert */
export interface SosAlertDto {
    sosId: string;
    userId: string;
    tripId: string | null;
    status: 'active' | 'cancelled';
    location: Location;
    message: string | null;
    /** Unix milliseconds */
    createdAt: number;
}
export interface SosAlertRow {
    id: string;
    user_id: string;
    trip_id: string | null;
    status: string;
    lat: number;
    lng: number;
    message: string | null;
    created_at: Date;
    updated_at: Date;
}
export interface EmergencyContactRow {
    id: string;
    user_id: string;
    name: string;
    phone: string;
    is_active: boolean;
    created_at: Date;
}
export interface JwtPayload {
    sub: string;
    role: string;
    jti?: string;
    iat?: number;
    exp?: number;
}
export interface ResponseMeta {
    requestId: string;
    ts: number;
}
export interface ApiResponse<T> {
    success: true;
    data: T;
    meta: ResponseMeta;
}
//# sourceMappingURL=types.d.ts.map