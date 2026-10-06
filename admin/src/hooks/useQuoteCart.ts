import { useState, useMemo } from 'react';
import type { Product } from '../types/product.types';
import type { QuoteItem } from '../types/quote.types';


export const useQuoteCart = () => {
  const [cart, setCart] = useState<QuoteItem[]>([]);
  const [discount, setDiscount] = useState(0);

  const getProductType = (categoryName: string): 'unit' | 'custom_measure' => {
    const CURTAIN_CATEGORIES = ['Cortinas', 'Persianas', 'Rollers', 'cortinas', 'persianas', 'rollers'];
    return CURTAIN_CATEGORIES.includes(categoryName) ? 'custom_measure' : 'unit';
  };

  const addUnitProduct = (product: Product) => {
    const existingItem = cart.find(item => item.product_id === product.id && item.item_type === 'unit');
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.product_id === product.id && item.item_type === 'unit'
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.unit_price }
          : item
      ));
    } else {
      setCart([...cart, {
        id: crypto.randomUUID(),
        quote_id: '',
        product_id: product.id,
        product,
        item_type: 'unit',
        quantity: 1,
        unit_price: product.price,
        finish_price: 0,
        subtotal: product.price
      }]);
    }
  };

  const addCurtainProduct = (data: any, product: Product) => {
    setCart([...cart, {
      id: crypto.randomUUID(),
      quote_id: '',
      product_id: product.id,
      product: product,
      item_type: 'custom_measure',
      quantity: 1,
      unit_price: product.price,
      width_meters: data.width_meters,
      height_meters: data.height_meters,
      square_meters: data.square_meters,
      fabric_type: data.fabric_type,
      finish_id: data.finish_id,
      finish_price: data.finish_price,
      subtotal: data.subtotal
    }]);
  };

  const removeItem = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCart(cart.map((item, i) => 
      i === index && item.item_type === 'unit'
        ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.unit_price }
        : item
    ));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
  };

  const calculations = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const taxRate = 0.19; // 19% IVA
    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = taxableAmount * taxRate;
    const total = subtotal - discount + tax;

    return { subtotal, tax, total };
  }, [cart, discount]);

  return {
    cart,
    discount,
    setDiscount,
    getProductType,
    addUnitProduct,
    addCurtainProduct,
    removeItem,
    updateQuantity,
    clearCart,
    ...calculations
  };
};
