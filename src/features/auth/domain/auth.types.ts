export interface RegisterDto {
    email: string;
    password?: string;
    firstName: string;
    lastName: string;
    nationality: string;
    phone: string;
    city: string;
    state: string;
    country: string;
}

export interface LoginUserDto {
    email: string;
    password?: string;
}

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    nationality?: string;
    phone?: string;
    city?: string;
    state?: string;
    country?: string;
    zyncPoints: number;
    // Add other user fields as needed
}

export interface RequestEmailVerificationDto {
    email: string;
    locale?: string;
}

export interface VerifyEmailOtpDto {
    email: string;
    otp: string;
}

export interface AuthResponse {
    accessToken: string;
    user: User;
}
