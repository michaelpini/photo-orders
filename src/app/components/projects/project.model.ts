export enum ProjectStatus {
    'draft' = 0,
    'offer submitted' = 1,
    'po received' = 10,
    'photo selection' = 11,
    'billing' = 20,
    'paid' = 21,
    'cancelled' = 30
}
export const statusMapDe = {
    0: 'Entwurf',
    1: 'Offerte erstellt',
    10: 'Auftrag erhalten',
    11: 'Photo Auswahl',
    20: 'Rechnung verschickt',
    21: 'Bezahlt',
    30: 'Storniert'
}

export interface Picture {
    id: string;
    url: string;
    userId: string;
    name?: string;
    sizeMb?: number;
    resolution?: string;
    selected?: boolean;
    tag?: string;
}

export interface ProjectInfo {
    id: string;
    userId?: string;
    projectName?: string
    status?: ProjectStatus;
    description?: string;
    eventDate?: string;
    eventLocation?: string;
    equipment?: string;
    numberOfPhotos?: number;
    selectionByCustomer?: boolean;
    resolutionAndType?: string;
    editingOptions?: string;
    deadline?: string;
}

interface ProjectCost {
    travelHours?: number;
    preparationHours?: number;
    photoShootingHours?: number;
    postProductionHours?: number;
    totalHours?: number;
    hourlyRateCHF?: number;
    totalCHF?: number;
    issueDate?: string;
    remarks?: string;
}

export interface ProjectQuote extends ProjectCost {
    poDate?: string;
}

export interface ProjectInvoice extends ProjectCost {
    paidDate?: string;
}
export interface Project extends ProjectInfo {
    quote?: ProjectQuote,
    invoice?: ProjectInvoice
}


