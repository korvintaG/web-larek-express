export type UserInRequest = {
    id: string
}

export type Order = {
    items: string[];
    total: number;
    payment: 'card' | 'online';
    email: string;
    phone: string;
    address : string;
}
