import { create } from 'zustand';

export type GroceryCategory = "Produce" | "Dairy" | "Bakery" | "Pantry" | "Snack" | "Meat";
export type GroceryPriority = "low" | "medium" | "high";

export type GroceryItem = {
    id: string;
    name: string;
    category: GroceryCategory;
    quantity: number;
    purchased: boolean;
    priority: GroceryPriority;
}

export type CreateItemInput = {
    name: string;
    quantity: number;
    category: GroceryCategory;
    priority: GroceryPriority;
}

type GroceryStore = {
    items: GroceryItem[];
    isLoading: boolean;
    error: string | null;
    loadItems: () => Promise<void>;
    addItem: (input: CreateItemInput) => Promise<GroceryItem | void>;
    updateQuantity: (id: string, quantity: number) => Promise<void>;
    togglePurchased: (id: string) => Promise<void>;
    removeItem: (id: string) => Promise<void>;
    clearPurchased: () => Promise<void>;
}

export const useGroceryStore = create<GroceryStore>((set, get) => ({
    items: [],
    isLoading: false,
    error: null,

    loadItems: async () => {
        set({ isLoading: true });
        // Simulate a tiny delay for realism if needed, otherwise just set items
        set({ isLoading: false });
    },

    addItem: async (input) => {
        const newItem: GroceryItem = {
            id: Math.random().toString(36).substring(2, 9),
            name: input.name,
            category: input.category,
            quantity: input.quantity,
            priority: input.priority,
            purchased: false,
        };
        set((state) => ({ items: [newItem, ...state.items] }));
        return newItem;
    },

    updateQuantity: async (id, quantity) => {
        set((state) => ({
            items: state.items.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item))
        }));
    },

    togglePurchased: async (id) => {
        set((state) => ({
            items: state.items.map((item) => (item.id === id ? { ...item, purchased: !item.purchased } : item))
        }));
    },

    removeItem: async (id) => {
        set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
    },

    clearPurchased: async () => {
        set((state) => ({ items: state.items.filter((item) => !item.purchased) }));
    },
}))