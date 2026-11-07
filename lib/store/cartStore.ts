import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // product id
  name: string;
  price: number;
  image: string;
  size: string;
  qty: number;
  stock: number;
}

interface CartState {
  items: CartItem[];
  addToCart: (product: { id: string; name: string; price: number; images: string[] }, size: string, qty: number, stock: number) => void;
  removeFromCart: (id: string, size: string) => void;
  updateQty: (id: string, size: string, qty: number) => void;
  clearCart: () => void;
  cartTotal: () => number;
  cartCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addToCart: (product, size, qty, stock) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.id === product.id && item.size === size
          );

          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            const newQty = Math.min(updatedItems[existingIndex].qty + qty, stock);
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              qty: newQty,
            };
            return { items: updatedItems };
          } else {
            return {
              items: [
                ...state.items,
                {
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.images[0] || '',
                  size,
                  qty: Math.min(qty, stock),
                  stock,
                },
              ],
            };
          }
        });
      },
      removeFromCart: (id, size) => {
        set((state) => ({
          items: state.items.filter((item) => !(item.id === id && item.size === size)),
        }));
      },
      updateQty: (id, size, qty) => {
        set((state) => ({
          items: state.items
            .map((item) => {
              if (item.id === id && item.size === size) {
                const newQty = Math.max(1, Math.min(qty, item.stock));
                return { ...item, qty: newQty };
              }
              return item;
            }),
        }));
      },
      clearCart: () => set({ items: [] }),
      cartTotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.qty, 0);
      },
      cartCount: () => {
        return get().items.reduce((sum, item) => sum + item.qty, 0);
      },
    }),
    {
      name: 'starfashion-cart-storage',
    }
  )
);
