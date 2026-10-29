import { useDeferredValue, useState } from 'react';
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
  const [customerSearch, setCustomerSearch] = useState('');
  const deferredCustomerSearch = useDeferredValue(customerSearch);
  const { customers, isLoadingCustomers } = useCustomers(
    deferredCustomerSearch
      ? { search: deferredCustomerSearch, limit: 25 }
      : { limit: 5, sort: 'sales' }
  );
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
      <div className="sticky top-0 z-30 bg-white border-b border-zinc-200 text-zinc-900 shadow-sm mb-3">
        <div className="max-w-7xl mx-auto px-3 py-1.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="text-sm md:text-base font-bold truncate">Nueva Venta</h1>
              {selectedCustomer && (
                <span className="hidden sm:inline text-xs text-zinc-500 truncate border-l border-zinc-200 pl-2">
                  {selectedCustomer.name}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-semibold text-zinc-500">{cartState.cart.length} items</span>
              <span className="text-base md:text-lg font-bold tabular-nums text-zinc-900">{formatCOP(cartState.total)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3">
        {/* Progress Steps */}
        <div className="mb-3 bg-white rounded-xl shadow-sm border border-gray-100 px-3 py-2">
          <div className="flex items-center">
            {[
              { num: 1, label: 'Cliente' },
              { num: 2, label: 'Productos' },
              { num: 3, label: 'Pago' }
            ].map((s, idx) => (
              <div key={s.num} className="flex-1 flex items-center">
                <div className="flex items-center gap-2 shrink-0">
                  <div className={clsx(
                    "w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-300",
                    step >= s.num ? "bg-zinc-900 text-white" : "bg-gray-100 text-gray-400"
                  )}>
                    {step > s.num ? '✓' : s.num}
                  </div>
                  <span className={clsx(
                    "text-[11px] md:text-xs font-semibold transition-colors",
                    step >= s.num ? "text-gray-900" : "text-gray-400"
                  )}>
                    {s.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div className="relative flex-1 mx-2 md:mx-3 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className={clsx(
                      "absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out",
                      step > s.num ? "w-full bg-zinc-900" : "w-0 bg-gray-200"
                    )} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-3">
            {step === 1 && (
              <OrderCustomerStep 
                customers={customers as any[]} 
                search={customerSearch}
                onSearchChange={setCustomerSearch}
                isLoading={isLoadingCustomers}
                selectedCustomer={selectedCustomer}
                setSelectedCustomer={setSelectedCustomer as any}
                onNext={() => setStep(2)}
              />
            )}

            {step === 2 && (
              <OrderProductsStep
                products={products as any[]}
                categories={categories as any[]}
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
            <div className="sticky top-2 space-y-4">
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
