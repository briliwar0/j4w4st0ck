import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { CartItem, InsertCartItem, Asset } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "./AuthContext";
import { allAssets } from "@/lib/sample-data";

interface CartContextType {
  cartItems: CartItem[];
  cartAssets: Asset[];
  isLoading: boolean;
  addToCart: (item: Omit<InsertCartItem, "userId">) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const { isAuthenticated, user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartAssets, setCartAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch cart items when authenticated
  useEffect(() => {
    const fetchCartItems = async () => {
      if (isAuthenticated) {
        try {
          setIsLoading(true);
          const response = await fetch("/api/cart", {
            credentials: "include",
          });

          if (response.ok) {
            const items = await response.json();
            setCartItems(items);
            
            // In a real app, we would fetch the assets for each cart item
            // For now, use the sample data to match cart items to assets
            let assets = [];
            try {
              if (Array.isArray(items)) {
                assets = items.map((item: CartItem) => {
                  return allAssets.find(asset => asset.id === item.assetId) || null;
                }).filter(Boolean);
              } else {
                console.error("Cart items are not an array:", items);
                assets = [];
              }
            } catch (error) {
              console.error("Error mapping cart items:", error);
              assets = [];
            }
            
            setCartAssets(assets);
          }
        } catch (error) {
          console.error("Fetch cart error:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        // If not authenticated, reset cart
        setCartItems([]);
        setCartAssets([]);
        setIsLoading(false);
      }
    };

    fetchCartItems();
  }, [isAuthenticated]);

  const addToCart = async (item: Omit<InsertCartItem, "userId">): Promise<void> => {
    if (!isAuthenticated) {
      throw new Error("User must be authenticated to add to cart");
    }

    try {
      const response = await apiRequest("POST", "/api/cart", item);
      const newItem = await response.json();
      
      // Update cart items
      setCartItems((prev) => [...prev, newItem]);
      
      // Find the asset for the cart item
      const asset = allAssets.find(a => a.id === item.assetId);
      if (asset) {
        setCartAssets((prev) => [...prev, asset]);
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      throw error;
    }
  };

  const removeFromCart = async (itemId: number): Promise<void> => {
    try {
      await apiRequest("DELETE", `/api/cart/${itemId}`, undefined);
      
      // Remove the item from cartItems
      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
      
      // Get the assetId before removing the cart item
      const removedItem = cartItems.find(item => item.id === itemId);
      if (removedItem) {
        // Remove the corresponding asset from cartAssets
        setCartAssets((prev) => prev.filter((asset) => asset.id !== removedItem.assetId));
      }
    } catch (error) {
      console.error("Remove from cart error:", error);
      throw error;
    }
  };

  const clearCart = async (): Promise<void> => {
    try {
      await apiRequest("DELETE", "/api/cart", undefined);
      setCartItems([]);
      setCartAssets([]);
    } catch (error) {
      console.error("Clear cart error:", error);
      throw error;
    }
  };

  const getCartTotal = (): number => {
    return cartAssets.reduce((total, asset) => total + asset.price, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartAssets,
        isLoading,
        addToCart,
        removeFromCart,
        clearCart,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
