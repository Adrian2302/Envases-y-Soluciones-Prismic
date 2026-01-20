"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItem {
  productId: string;
  productName: string;
  productImage: string;
  variantCode: string;
  capacity: number;
  height: number;
  diameter: number;
  price: number;
  discountPrice?: number;
  quantity: number;
  selectedLidColor?: string; // Color de tapa seleccionado (si aplica)
}

// Genera un ID único para cada item basado en código de variante + color de tapa
export function getCartItemId(variantCode: string, lidColor?: string): string {
  return lidColor ? `${variantCode}-${lidColor}` : variantCode;
}

interface Notification {
  id: number;
  message: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  notifications: Notification[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationId, setNotificationId] = useState(0);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cotizacion-cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Error loading cart:", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage when items change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("cotizacion-cart", JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const showNotification = (message: string) => {
    const id = notificationId + 1;
    setNotificationId(id);
    setNotifications((prev) => [...prev, { id, message }]);

    // Auto-remove notification after 3 seconds + 0.3s animation
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3300);
  };

  const addItem = (item: CartItem) => {
    setItems((prevItems) => {
      const itemId = getCartItemId(item.variantCode, item.selectedLidColor);
      const existingItem = prevItems.find(
        (i) => getCartItemId(i.variantCode, i.selectedLidColor) === itemId
      );
      if (existingItem) {
        return prevItems.map((i) =>
          getCartItemId(i.variantCode, i.selectedLidColor) === itemId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prevItems, item];
    });

    // Show notification
    showNotification(`"${item.productName}" añadido al carrito`);
  };

  const removeItem = (itemId: string) => {
    setItems((prevItems) =>
      prevItems.filter((item) => getCartItemId(item.variantCode, item.selectedLidColor) !== itemId)
    );
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        getCartItemId(item.variantCode, item.selectedLidColor) === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        isCartOpen,
        setIsCartOpen,
        notifications,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
