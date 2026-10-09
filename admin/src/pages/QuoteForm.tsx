import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { notify } from '../hooks/useNotification';

// Hooks
import { useCustomers } from '../hooks/useCustomers';
import { useProducts } from '../hooks/useProducts';
import { useQuotes } from '../hooks/useQuotes';
import { useQuoteCart } from '../hooks/useQuoteCart';

// Components
import { QuoteCustomerStep } from '../components/quotes/QuoteCustomerStep';
import { QuoteProductsStep } from '../components/quotes/QuoteProductsStep';
import { QuoteDetailsStep } from '../components/quotes/QuoteDetailsStep';
import { QuoteSummary } from '../components/quotes/QuoteSummary';
import CurtainCalculator from '../components/CurtainCalculator';

export default function QuoteForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  // Data
  const { customers } = useCustomers();
  const { products, finishes } = useProducts();
  const { createQuote, isCreating } = useQuotes();
  
  // Cart & State
  const cartState = useQuoteCart();
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [notes, setNotes] = useState('');
  const [validUntil, setValidUntil] = useState('');
  
  // Curtain Calculator state
  const [showCurtainCalc, setShowCurtainCalc] = useState(false);
  const [selectedProductForCalc, setSelectedProductForCalc] = useState<any>(null);

  useEffect(() => {
    // Default valid until: +30 days
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);
    setValidUntil(defaultDate.toISOString().split('T')[0]);
  }, []);

  const handleAddProduct = (product: any) => {
    const productType = cartState.getProductType(product.category?.name || '');
    
    if (productType === 'custom_measure') {
      setSelectedProductForCalc(product);
      setShowCurtainCalc(true);
    } else {
      cartState.addUnitProduct(product);
    }
  };

  const handleAddCurtain = (data: any) => {
    if (!selectedProductForCalc) return;
    cartState.addCurtainProduct(data, selectedProductForCalc);
    setSelectedProductForCalc(null);
  };

  const handleSubmit = async () => {
    if (!selectedCustomerId || cartState.cart.length === 0) {
      notify.warning('Selecciona un cliente y agrega productos');
      return;
    }
    
    if (!validUntil) {
      notify.warning('Ingresa la fecha de vigencia');
      return;
    }

    try {
      await createQuote({
        customer_id: selectedCustomerId,
        items: cartState.cart.map(item => ({
          product_id: item.product_id,
          item_type: item.item_type,
          quantity: item.quantity,
          width_meters: item.width_meters,
          height_meters: item.height_meters,
          fabric_type: item.fabric_type,
          finish_id: item.finish_id,
          unit_price: item.unit_price,
          subtotal: item.subtotal,
          finish_price: item.finish_price
        })),
        discount: cartState.discount,
        tax: cartState.tax,
        total: cartState.total,
        notes,
        valid_until: validUntil
      });

      notify.success('¡Cotización creada exitosamente!');
      navigate('/quotes');
    } catch (error) {
      console.error('Error creating quote:', error);
      notify.error('Error al crear cotización');
    }
  };

  const selectedCustomer = customers.find((c: any) => c.id === selectedCustomerId);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">
            Nueva Cotización
          </h1>
          <p className="text-zinc-600 mt-1 text-sm sm:text-base">Crea una cotización para nuestros clientes</p>
        </div>
        <button
          onClick={() => navigate('/quotes')}
          className="text-center px-4 py-2 text-zinc-600 hover:text-gray-900 font-semibold text-sm sm:text-base"
        >
          ← Volver
        </button>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: 'Cliente' },
            { num: 2, label: 'Productos' },
            { num: 3, label: 'Detalles' }
          ].map((s, i) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={clsx(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all",
                  step >= s.num 
                    ? "bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm transition-all shadow-sm"
                    : "bg-gray-200 text-gray-500"
                )}>
                  {s.num}
                </div>
                <span className={clsx(
                  "text-xs font-semibold mt-2",
                  step >= s.num ? "text-zinc-600" : "text-gray-500"
                )}>
                  {s.label}
                </span>
              </div>
              {i < 2 && (
                <div className={clsx(
                  "flex-1 h-1 mx-2",
                  step > s.num ? "bg-gradient-to-r from-blue-600 to-zinc-600" : "bg-gray-200"
                )} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-2 space-y-6">
          {step === 1 && (
            <QuoteCustomerStep
              customers={customers as any[]}
              selectedCustomerId={selectedCustomerId}
              setSelectedCustomerId={setSelectedCustomerId}
              onNext={() => setStep(2)}
            />
          )}

          {step === 2 && (
            <QuoteProductsStep
              products={products as any[]}
              getProductType={cartState.getProductType}
              cartContains={(id) => cartState.cart.some((i: any) => i.product_id === id)}
              onAddProduct={handleAddProduct}
            />
          )}

          {step === 3 && (
            <QuoteDetailsStep
              selectedCustomer={selectedCustomer as any}
              discount={cartState.discount}
              setDiscount={cartState.setDiscount}
              validUntil={validUntil}
              setValidUntil={setValidUntil}
              notes={notes}
              setNotes={setNotes}
              onBack={() => setStep(2)}
              onSubmit={handleSubmit}
              isLoading={isCreating}
            />
          )}
        </div>

        <div className="lg:col-span-1">
          <QuoteSummary
            cart={cartState.cart as any[]}
            subtotal={cartState.subtotal}
            discount={cartState.discount}
            tax={cartState.tax}
            total={cartState.total}
            onRemoveItem={cartState.removeItem}
            onUpdateQuantity={cartState.updateQuantity}
            step={step}
            setStep={setStep}
          />
        </div>
      </div>

      {showCurtainCalc && selectedProductForCalc && (
        <CurtainCalculator
          isOpen={showCurtainCalc}
          onClose={() => {
            setShowCurtainCalc(false);
            setSelectedProductForCalc(null);
          }}
          product={selectedProductForCalc}
          finishes={finishes as any[]}
          onAdd={handleAddCurtain}
        />
      )}
    </div>
  );
}
