export interface User {
    id: string;
    name: string;
    email: string;
    handle: string;
    avatar: string;
    role: 'user' | 'admin' | 'staff';
    balance: number;
    zyncPoints: number;
    tier: 'Standard' | 'Gold' | 'Platinum';
    cards: PaymentMethod[];
    stats: {
        orders: number;
        spent: number;
        nights: number;
    };
}

export interface PaymentMethod {
    id: string;
    type: 'visa' | 'mastercard' | 'amex';
    last4: string;
    expiry: string;
    holderName: string;
}

export interface Establishment {
    id: string;
    name: string;
    location: string;
    image: string;
    theme: 'cyber' | 'retro' | 'industrial';
    video: string;
    rating: number;
    currentDj?: {
        name: string;
        genre: string;
        startTime: string;
        endTime: string;
        isLive: boolean;
    };
}

export interface Song {
    id: string;
    title: string;
    artist: string;
    album: string;
    price: number;
    cover: string;
    duration: string;
}

export interface Product {
    id: string;
    category: string;
    name: string;
    description: string;
    price: number;
    image: string;
    isFeatured?: boolean;
}

// MOCK DATA

export const MOCK_USERS: User[] = [
    {
        id: 'u1',
        name: 'Frank Yanez',
        email: 'frank@zync.com',
        handle: '@frank_cyber',
        avatar: 'https://i.pravatar.cc/150?u=frank',
        role: 'user',
        balance: 15000,
        zyncPoints: 2450,
        tier: 'Gold',
        cards: [
            { id: 'c1', type: 'visa', last4: '4242', expiry: '12/26', holderName: 'FRANK YANEZ' },
            { id: 'c2', type: 'mastercard', last4: '8899', expiry: '09/25', holderName: 'FRANK YANEZ' }
        ],
        stats: {
            orders: 12,
            spent: 154000,
            nights: 5
        }
    }
];

export const MOCK_ESTABLISHMENTS: Establishment[] = [
    {
        id: 'e1',
        name: 'Brothers',
        location: 'Sector 7, Neo-Santiago',
        image: 'https://example.com/vertigo.jpg',
        theme: 'cyber',
        video: 'https://www.pexels.com/es-es/download/video/854128/',
        rating: 4.5,
        currentDj: {
            name: 'K-LIX',
            genre: 'Tech House',
            startTime: '22:00',
            endTime: '04:00',
            isLive: true
        }
    },
    {
        id: 'e2',
        name: 'Club Vertigo',
        location: 'Sector 7, Neo-Santiago',
        image: 'https://example.com/vertigo.jpg',
        theme: 'cyber',
        video: 'https://www.pexels.com/es-es/download/video/854128/',
        rating: 4.5,

    },
    {
        id: 'e3',
        name: 'Ogham',
        location: 'Sector 7, Neo-Santiago',
        image: 'https://example.com/vertigo.jpg',
        theme: 'cyber',
        video: 'https://www.pexels.com/es-es/download/video/854128/',
        rating: 4.5,

    },
    {
        id: 'e4',
        name: 'Harrys',
        location: 'Sector 7, Neo-Santiago',
        image: 'https://example.com/vertigo.jpg',
        theme: 'cyber',
        video: 'https://www.pexels.com/es-es/download/video/854128/',
        rating: 4.5,

    },
    {
        id: 'e5',
        name: 'The Last',
        location: 'Sector 7, Neo-Santiago',
        image: 'https://example.com/vertigo.jpg',
        theme: 'cyber',
        video: 'https://www.pexels.com/es-es/download/video/854128/',
        rating: 4.5,

    },

];

export const MOCK_SONGS: Song[] = [
    { id: 's1', title: 'Neon Lights', artist: 'Kraftwerk', album: 'The Man-Machine', price: 2000, cover: 'https://i.scdn.co/image/ab67616d0000b273295b9557b447831003756a11', duration: '3:45' },
    { id: 's2', title: 'Midnight City', artist: 'M83', album: 'Hurry Up, We\'re Dreaming', price: 2000, cover: 'https://i.scdn.co/image/ab67616d0000b2733bccc993683a483ca8605c30', duration: '4:03' },
    { id: 's3', title: 'Tech Noir', artist: 'Gunship', album: 'Gunship', price: 2000, cover: 'https://i.scdn.co/image/ab67616d0000b273ca612b77a944ae5573752e07', duration: '3:29' },
    { id: 's4', title: 'Turbo Killer', artist: 'Carpenter Brut', album: 'Trilogy', price: 2500, cover: 'https://i.scdn.co/image/ab67616d0000b273c0993952541dd31471da3791', duration: '4:15' },
    { id: 's5', title: 'Resonance', artist: 'Home', album: 'Odyssey', price: 1500, cover: 'https://i.scdn.co/image/ab67616d0000b273574c965c276587c427382285', duration: '3:32' },
    { id: 's6', title: 'Nightcall', artist: 'Kavinsky', album: 'OutRun', price: 2000, cover: 'https://i.scdn.co/image/ab67616d0000b273c02747376c36729052b65076', duration: '4:18' },
];

export const MOCK_MENU: Product[] = [
    // Signature Drinks
    { id: 'd1', category: 'Autor', name: 'Neon Noir', description: 'Gin, blackberry liqueur, lemon, tonic, activated charcoal foam.', price: 12000, image: 'https://example.com/neon-noir.jpg', isFeatured: true },
    { id: 'd2', category: 'Autor', name: 'Cyber Sour', description: 'Pisco, lime, egg white, neon bitters, electric dust.', price: 10000, image: 'https://example.com/cyber-sour.jpg', isFeatured: true },
    { id: 'd3', category: 'Autor', name: 'Matrix Mule', description: 'Vodka, ginger beer, lime, cucumber, digital mint.', price: 11000, image: 'https://example.com/matrix-mule.jpg', isFeatured: true },
    { id: 'd4', category: 'Autor', name: 'Void Walker', description: 'Blue curaçao, white rum, pineapple, glowing ice cube.', price: 14000, image: 'https://example.com/void-walker.jpg', isFeatured: true },

    // Classics
    { id: 'd5', category: 'Clásicos', name: 'Old Fashioned', description: 'Bourbon, sugar, angostura bitters.', price: 9000, image: '', isFeatured: false },
    { id: 'd6', category: 'Clásicos', name: 'Mojito', description: 'Rum, mint, lime, soda.', price: 8500, image: '', isFeatured: false },

    // Beers
    { id: 'b1', category: 'Cervezas', name: 'Cyber IPA', description: 'Hazy IPA 6.5%', price: 5000, image: '', isFeatured: false },
    { id: 'b2', category: 'Cervezas', name: 'Stella Artois', description: 'Lager', price: 4000, image: '', isFeatured: false },
];