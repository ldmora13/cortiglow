import { useState, useMemo } from 'react';
import type { Product } from '../types/product.types';
import type { CartItem } from '../types/order.types';
import { notify } from './useNotification';

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [deliveryCost, setDeliveryCost] = useState(0);

  const addToCart = (product: Product) => {
    const maxStock = product.inventory?.quantity || 0;
    
    if (maxStock === 0) {
      notify.warning(`${product.name} no tiene stock disponible`);
      return false;
    }

    const existing = cart.find(item => item.product_id === product.id);
    
    if (existing) {
      if (existing.quantity >= maxStock) {
        notify.warning(`Solo hay ${maxStock} unidades disponibles de ${product.name}`);
        return false;
      }
      setCart(cart.map(item => 
        item.product_id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        product_id: product.id,
        name: product.name,
        unit_price: Number(product.price),
        quantity: 1,
        max_stock: maxStock,
        image: product.images?.[0]
      }]);
    }
    return true;
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const item = cart.find(i => i.product_id === productId);
    if (!item) return;

    if (quantity <= 0) {
      removeFromCart(productId);
    } else if (quantity > item.max_stock) {
      notify.warning(`Solo hay ${item.max_stock} unidades disponibles`);
    } else {
      setCart(cart.map(i => 
        i.product_id === productId 
          ? { ...i, quantity }
          : i
      ));
    }
  };

  const incrementQuantity = (productId: string) => {
    const item = cart.find(i => i.product_id === productId);
    if (item) updateQuantity(productId, item.quantity + 1);
  };

  const decrementQuantity = (productId: string) => {
    const item = cart.find(i => i.product_id === productId);
    if (item) updateQuantity(productId, item.quantity - 1);
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setDeliveryCost(0);
  };

  const applyQuickDiscount = (percentage: number) => {
    const currentSubtotal = cart.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    setDiscount(Math.round(currentSubtotal * (percentage / 100)));
  };

  // Calculations
  const calculations = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const taxRate = 0.19; // 19% IVA
    const taxableAmount = subtotal - discount;
    const tax = taxableAmount > 0 ? taxableAmount * taxRate : 0;
    const total = subtotal - discount + tax + deliveryCost;

    return { subtotal, tax, total };
  }, [cart, discount, deliveryCost]);

  return {
    cart,
    discount,
    deliveryCost,
    setDiscount,
    setDeliveryCost,
    addToCart,
    removeFromCart,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    applyQuickDiscount,
    ...calculations
  };
};
