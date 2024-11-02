export interface Schedule {
    id: number;
    name: string;
    description: string;
    startDate: string; // ISO 8601 format
    endDate: string;   // ISO 8601 format
    blocks: Block[];
    createdAt: string; // ISO 8601 format
    updatedAt: string; // ISO 8601 format
}

export interface Block {
    id: number;
    name: string;
    type: string;
    startTime: string; // ISO 8601 format
    duration: number;  // Duration in minutes
    description: string;
    order: number;
    items: BlockItem[];
}

export interface BlockItem {
    id: number;
    name: string;
    type: string;
    description: string;
    duration: number;  // Duration in minutes
    order: number;
    performer: string;
    requirements: string;
}