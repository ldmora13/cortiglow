import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { formatCOP } from '../utils/currency';
import { notify } from '../hooks/useNotification';

// Hooks
import { useCustomers } from '../hooks/useCustomers';
import { useProducts } from '../hooks/useProducts';
import { useOrders } from '../hooks/useOrders';
import { useCart } from '../hooks/useCart';

// Components
import { OrderCustomerStep } from '../components/orders/OrderCustomerStep';
import { OrderProductsStep } from '../components/orders/OrderProductsStep';
import { OrderPaymentStep } from '../components/orders/OrderPaymentStep';
import { OrderCartSummary } from '../components/orders/OrderCartSummary';
import type { Customer } from '../types/customer.types';

export default function OrderForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  // Data Fetching
  const { customers } = useCustomers();
  const { products, categories } = useProducts();
  const { createOrder, isCreating } = useOrders();
  
  // Cart & State
  const cartState = useCart();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [notes, setNotes] = useState('');
  const [addingProduct, setAddingProduct] = useState<string | null>(null);

  const handleAddToCart = (product: any) => {
    const added = cartState.addToCart(product);
    if (added) {
      setAddingProduct(product.id);
      setTimeout(() => setAddingProduct(null), 500);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCustomer || cartState.cart.length === 0) {
      notify.warning('Selecciona un cliente y agrega productos');
      return;
    }

    try {
      await createOrder({
        customer_id: selectedCustomer.id,
        items: cartState.cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.unit_price * item.quantity
        })),
        discount: cartState.discount,
        tax: cartState.tax,
        payment_method: paymentMethod,
        delivery_cost: cartState.deliveryCost,
        notes
      });

      notify.success('¡Orden creada exitosamente!');
      navigate('/orders');
    } catch (error: any) {
      console.error('Error creating order:', error);
      const errorMsg = error.response?.data?.error || 'Error al crear orden';
      const invalidItems = error.response?.data?.invalid_items;
      
      if (invalidItems && invalidItems.length > 0) {
        const itemsList = invalidItems.map((i: any) => 
          `${i.product_name || 'Producto'}: ${i.message}`
        ).join(', ');
        notify.error(`Stock insuficiente: ${itemsList}`);
      } else {
        notify.error(errorMsg);
      }
    }
  };

  return (
    <div className="pb-20 md:pb-6">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-zinc-200 text-zinc-900 shadow-md mb-6">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="hidden md:flex w-12 h-12 bg-zinc-100 rounded-xl items-center justify-center text-2xl">
                🛍️
              </div>
              <div className="min-w-0">
                <h1 className="text-lg md:text-2xl font-bold truncate">Nueva Venta</h1>
                {selectedCustomer && (
                  <p className="text-xs md:text-sm text-zinc-500 truncate">
                    {selectedCustomer.name}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-zinc-500">Total</p>
              <p className="text-xl md:text-3xl font-bold text-zinc-900">{formatCOP(cartState.total)}</p>
              <p className="text-xs text-zinc-500">{cartState.cart.length} items</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Progress Steps */}
        <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Cliente', color: 'blue' },
              { num: 2, label: 'Productos', color: 'blue' },
              { num: 3, label: 'Pago', color: 'green' }
            ].map((s, idx) => (
              <div key={s.num} className="flex-1 flex items-center">
                <div className="flex flex-col items-center flex-1">
                  <div className={clsx(
                    "relative w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-xl md:text-2xl font-bold transition-all duration-500 transform",
                    step >= s.num 
                      ? `bg-zinc-900 text-white shadow-md scale-110` 
                      : "bg-gray-100 text-gray-400 scale-100"
                  )}>
                    {step > s.num ? <span className="animate-pulse">✓</span> : <span>{s.num}</span>}
                  </div>
                  <span className={clsx(
                    "text-xs md:text-sm mt-2 font-semibold transition-all duration-300",
                    step >= s.num ? "text-gray-900" : "text-gray-400"
                  )}>
                    {s.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div className="relative flex-1 mx-2 md:mx-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={clsx(
                      "absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out",
                      step > s.num ? "w-full bg-zinc-900" : "w-0 bg-gray-200"
                    )} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {step === 1 && (
              <OrderCustomerStep 
                customers={customers as any[]} 
                selectedCustomer={selectedCustomer}
                setSelectedCustomer={setSelectedCustomer as any}
                onNext={() => setStep(2)}
              />
            )}

            {step === 2 && (
              <OrderProductsStep
                products={products as any[]}
                categories={categories.map((c: any) => c.name)}
                addToCart={handleAddToCart}
                cartContains={(id) => cartState.cart.some((i: any) => i.product_id === id)}
                addingProduct={addingProduct}
                onBack={() => setStep(1)}
                onNext={() => setStep(3)}
                isNextDisabled={cartState.cart.length === 0}
              />
            )}

            {step === 3 && (
              <OrderPaymentStep
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                discount={cartState.discount}
                setDiscount={cartState.setDiscount}
                deliveryCost={cartState.deliveryCost}
                setDeliveryCost={cartState.setDeliveryCost}
                notes={notes}
                setNotes={setNotes}
                subtotal={cartState.subtotal}
                applyQuickDiscount={cartState.applyQuickDiscount}
                onBack={() => setStep(2)}
                onSubmit={handleSubmit}
                isLoading={isCreating}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <OrderCartSummary 
                {...cartState} 
                cart={cartState.cart as any[]} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
