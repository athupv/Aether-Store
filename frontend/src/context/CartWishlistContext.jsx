import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth, API_URL } from './AuthContext';

const CartWishlistContext = createContext(null);

export const CartWishlistProvider = ({ children }) => {
  const { user, authenticatedFetch } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user) return;
    try {
      const response = await authenticatedFetch(`${API_URL}/cart/`);
      if (response.ok) {
        const data = await response.json();
        setCartItems(data);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    }
  };

  const fetchWishlist = async () => {
    if (!user) return;
    try {
      const response = await authenticatedFetch(`${API_URL}/wishlist/`);
      if (response.ok) {
        const data = await response.json();
        setWishlistItems(data);
      }
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    }
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([fetchCart(), fetchWishlist()]).finally(() => setLoading(false));
    } else {
      setCartItems([]);
      setWishlistItems([]);
    }
  }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) return { success: false, error: "Please log in to add items to the cart." };
    try {
      const response = await authenticatedFetch(`${API_URL}/cart/`, {
        method: 'POST',
        body: JSON.stringify({ product: productId, quantity })
      });
      if (response.ok) {
        await fetchCart();
        return { success: true };
      } else {
        const data = await response.json();
        return { success: false, error: data.error || "Failed to add item to cart." };
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      return { success: false, error: "Network error occurred." };
    }
  };

  const removeFromCart = async (cartItemId) => {
    if (!user) return;
    try {
      const response = await authenticatedFetch(`${API_URL}/cart/${cartItemId}/`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setCartItems(prev => prev.filter(item => item.id !== cartItemId));
      }
    } catch (error) {
      console.error("Remove from cart error:", error);
    }
  };

  const updateCartQuantity = async (cartItemId, quantity) => {
    if (!user || quantity < 1) return;
    try {
      const response = await authenticatedFetch(`${API_URL}/cart/${cartItemId}/`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity })
      });
      if (response.ok) {
        setCartItems(prev => prev.map(item => item.id === cartItemId ? { ...item, quantity } : item));
        fetchCart();
      }
    } catch (error) {
      console.error("Update quantity error:", error);
    }
  };

  const toggleWishlist = async (productId) => {
    if (!user) return { success: false, error: "Please log in to add items to your wishlist." };
    
    const existingItem = wishlistItems.find(item => item.product === productId || item.product_details?.id === productId);
    
    try {
      if (existingItem) {
        const response = await authenticatedFetch(`${API_URL}/wishlist/${existingItem.id}/`, {
          method: 'DELETE'
        });
        if (response.ok) {
          setWishlistItems(prev => prev.filter(item => item.id !== existingItem.id));
          return { success: true, action: 'removed' };
        }
      } else {
        const response = await authenticatedFetch(`${API_URL}/wishlist/`, {
          method: 'POST',
          body: JSON.stringify({ product: productId })
        });
        if (response.ok) {
          await fetchWishlist();
          return { success: true, action: 'added' };
        }
      }
      return { success: false, error: "Failed to update wishlist." };
    } catch (error) {
      console.error("Toggle wishlist error:", error);
      return { success: false, error: "Network error occurred." };
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.product === productId || item.product_details?.id === productId);
  };

  const clearCartLocal = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.product_details?.price || 0);
      return total + (price * item.quantity);
    }, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartWishlistContext.Provider value={{
      cartItems,
      wishlistItems,
      loading,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      toggleWishlist,
      isInWishlist,
      getCartTotal,
      getCartCount,
      clearCartLocal,
      refreshCart: fetchCart
    }}>
      {children}
    </CartWishlistContext.Provider>
  );
};

export const useCartWishlist = () => useContext(CartWishlistContext);
