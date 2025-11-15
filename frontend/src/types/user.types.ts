export interface OnlineUser {
    userId: string;
    userData: {
        id: string;
        name: string;
        email: string;
        avatar?: string;
    };
    lastSeen: string;
}