import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, CircleDollarSign, Boxes, FolderTree, Images } from 'lucide-react';
import { api } from '../lib/api';
import { formatCOP, parseCOPInput } from '../utils/currency';
import { notify } from '../hooks/useNotification';
import { useProducts } from '../hooks/useProducts';
import { useProviders } from '../hooks/useProviders';
import { getCategoryPath } from '../utils/categoryUtils';
import type { Category } from '../services/category.service';

interface ProductFormData {
  name: string;
  sku: string;
  description: string;
  price: string;
  cost: string;
  provider_id: string;
  images: string[];
  video_url: string;
  min_stock: string;
}

const inputBase =
  'w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all bg-white';
const inputOk = 'border-zinc-200';
const inputError = 'border-red-300 focus:ring-red-500';

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const { categories, getProductQuery, createProduct, updateProduct, isCreating, isUpdating } = useProducts();
  const { providers } = useProviders();
  const { data: initialProduct, isLoading: isLoadingProduct } = getProductQuery(id || '');

  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    sku: '',
    description: '',
    price: '',
    cost: '',
    provider_id: '',
    images: [],
    video_url: '',
    min_stock: '5'
  });

  // Ruta de categoría seleccionada, de raíz a hoja: levels[0] = familia principal.
  const [levels, setLevels] = useState<string[]>([]);
  // Campo monetario con foco: mientras se edita se muestra el valor crudo.
  const [moneyFocus, setMoneyFocus] = useState<'price' | 'cost' | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const childrenOf = (parentId: string | null): Category[] =>
    parentId
      ? categories.filter((c: Category) => c.parent_id === parentId)
      : categories.filter((c: Category) => !c.parent_id);

  const selectedCategoryId = levels.length > 0 ? levels[levels.length - 1] : '';
  const selectedNode = categories.find((c: Category) => c.id === selectedCategoryId);
  const selectedHasChildren = selectedNode ? childrenOf(selectedNode.id).length > 0 : false;

  // Niveles a renderizar: uno por profundidad mientras el padre tenga hijos.
  const levelRows: { depth: number; options: Category[]; value: string }[] = [];
  {
    let parent: string | null = null;
    for (let depth = 0; ; depth++) {
      const options = childrenOf(parent);
      if (options.length === 0) break;
      levelRows.push({ depth, options, value: levels[depth] || '' });
      if (!levels[depth]) break;
      parent = levels[depth];
    }
  }

  // Restaurar la ruta completa al editar (cualquier profundidad, no solo 3 niveles).
  useEffect(() => {
    if (isEditing && initialProduct?.category_id && categories.length > 0) {
      const self = categories.find((c: Category) => c.id === initialProduct.category_id);
      if (self) {
        const path = getCategoryPath(categories, self.id);
        setLevels([...path.map((p) => p.id), self.id]);
      }
    }
  }, [isEditing, initialProduct, categories]);

  useEffect(() => {
    if (isEditing && initialProduct) {
      setFormData({
        name: initialProduct.name,
        sku: initialProduct.sku || '',
        description: initialProduct.description || '',
        price: initialProduct.price != null ? initialProduct.price.toString() : '',
        cost: initialProduct.cost ? initialProduct.cost.toString() : '',
        provider_id: initialProduct.provider_id || '',
        images: initialProduct.images || [],
        video_url: (initialProduct as any).video_url || '',
        min_stock: initialProduct.inventory?.min_stock?.toString() || '5'
      });
      setImagePreviews(initialProduct.images || []);
    }
  }, [isEditing, initialProduct]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';

    if (files.length + imageFiles.length + formData.images.length > 5) {
      setErrors((prev) => ({ ...prev, images: 'Máximo 5 imágenes por producto' }));
      return;
    }

    setErrors((prev) => {
      const next = { ...prev };
      delete next.images;
      return next;
    });
    setImageFiles((prev) => [...prev, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    if (index < formData.images.length) {
      setFormData({
        ...formData,
        images: formData.images.filter((_, i) => i !== index)
      });
    } else {
      const fileIndex = index - formData.images.length;
      setImageFiles(imageFiles.filter((_, i) => i !== fileIndex));
    }
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (imageFiles.length === 0) return formData.images;

    setUploading(true);
    const uploadedUrls: string[] = [...formData.images];

    try {
      for (const file of imageFiles) {
        const uploadData = new FormData();
        uploadData.append('file', file);
        const { data } = await api.post('/upload', uploadData, { headers: { 'Content-Type': 'multipart/form-data' } });
        const publicUrl = data.url;

        uploadedUrls.push(publicUrl);
      }

      return uploadedUrls;
    } catch (err: any) {
      throw new Error('Error al subir imágenes: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const set = (patch: Partial<ProductFormData>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
    const touched = Object.keys(patch)[0];
    if (touched) {
      setErrors((prev) => {
        if (!prev[touched]) return prev;
        const next = { ...prev };
        delete next[touched];
        return next;
      });
    }
  };

  const validate = (): Record<string, string> => {
    const next: Record<string, string> = {};
    if (!formData.name.trim()) next.name = 'El nombre es requerido';
    const price = parseCOPInput(formData.price);
    if (!formData.price || !(price > 0)) next.price = 'El precio debe ser mayor a 0';
    if (formData.cost) {
      const cost = parseCOPInput(formData.cost);
      if (Number.isNaN(cost) || cost < 0) next.cost = 'El costo no puede ser negativo';
    }
    if (levels.length === 0 || !selectedCategoryId) {
      next.category = 'Selecciona la familia principal';
    } else if (selectedHasChildren) {
      next.category = `Selecciona la subcategoría dentro de "${selectedNode?.name}"`;
    }
    if (!formData.provider_id) next.provider = 'Selecciona un proveedor';
    if (imagePreviews.length === 0) next.images = 'Agrega al menos una imagen del producto';
    if (formData.video_url.trim() && !/^https?:\/\/.+/.test(formData.video_url.trim())) {
      next.video = 'Ingresa una URL válida que empiece con https://';
    }
    const minStock = parseInt(formData.min_stock, 10);
    if (Number.isNaN(minStock) || minStock < 0) next.min_stock = 'Ingresa un número igual o mayor a 0';
    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      const firstKey = Object.keys(validationErrors)[0];
      document.getElementById(`field-${firstKey}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    try {
      const imageUrls = await uploadImages();

      const payload = {
        name: formData.name.trim(),
        sku: formData.sku.trim() || null,
        description: formData.description.trim(),
        price: parseCOPInput(formData.price),
        cost: formData.cost ? parseCOPInput(formData.cost) : 0,
        category_id: selectedCategoryId || null,
        provider_id: formData.provider_id || null,
        images: imageUrls,
        video_url: formData.video_url.trim() || null,
        min_stock: parseInt(formData.min_stock) || 5
      };

      if (isEditing) {
        await updateProduct({ id: id!, data: payload });
        notify.success('Producto actualizado correctamente');
      } else {
        await createProduct(payload);
        notify.success('Producto creado correctamente');
      }

      navigate('/products');
    } catch (err: any) {
      notify.error(err.response?.data?.error || err.message || 'Error al guardar el producto');
    }
  };

  if (isEditing && isLoadingProduct) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-300 mx-auto"></div>
          <p className="mt-4 text-zinc-600">Cargando producto...</p>
        </div>
      </div>
    );
  }

  const isSubmitting = isCreating || isUpdating || uploading;

  const level1Name = (categories.find((c: Category) => c.id === levels[0])?.name || '').toLowerCase();
  const isSquareMeter = level1Name.includes('cortina') || level1Name.includes('persiana');
  const priceUnit = isSquareMeter ? 'COP / m²' : 'COP / Und';

  const moneyDisplay = (key: 'price' | 'cost') => {
    const raw = formData[key];
    if (raw === '') return '';
    if (moneyFocus === key) return raw;
    const parsed = parseFloat(raw);
    if (Number.isNaN(parsed)) return raw;
    return formatCOP(parsed).replace('$ ', '');
  };

  const err = (key: string) =>
    errors[key] ? (
      <p id={`field-${key}-error`} role="alert" className="mt-1.5 text-xs font-semibold text-red-600">
        {errors[key]}
      </p>
    ) : null;

  const fieldClass = (key: string) => `${inputBase} ${errors[key] ? inputError : inputOk}`;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 md:pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
            {isEditing ? 'Editar producto' : 'Nuevo producto'}
          </h1>
          <p className="text-zinc-600 mt-1">
            {isEditing ? 'Actualiza los detalles del producto' : 'Agrega un nuevo producto al catálogo'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/products')}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 font-semibold rounded-xl transition-colors self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="bg-white rounded-2xl shadow-sm border border-zinc-200">
        <div className="p-6 md:p-8">
          <div className="space-y-6 md:space-y-8">

              {/* Tarjeta: Clasificación */}
              <div className="bg-zinc-50/50 p-5 md:p-7 rounded-2xl border border-zinc-100 space-y-5 md:space-y-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FolderTree className="w-5 h-5 text-zinc-500" />
                  Clasificación
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                  <div id="field-category" className="space-y-3">
                    <span id="product-category-label" className="block text-sm font-bold text-gray-900">
                      Categoría del Producto *
                    </span>
                    {levelRows.map(({ depth, options, value }) => (
                      <div key={depth} className={depth > 0 ? 'pl-3 border-l-2 border-zinc-200' : undefined}>
                        <label htmlFor={`product-category-${depth}`} className="sr-only">
                          {depth === 0 ? 'Familia principal' : `Subcategoría, nivel ${depth + 1}`}
                        </label>
                        <select
                          id={`product-category-${depth}`}
                          aria-labelledby="product-category-label"
                          value={value}
                          aria-invalid={!!errors.category}
                          aria-describedby={errors.category ? 'field-category-error' : undefined}
                          onChange={(e) => {
                            const next = [...levels.slice(0, depth), e.target.value].filter(Boolean);
                            setLevels(next);
                            setErrors((prev) => {
                              if (!prev.category) return prev;
                              const copy = { ...prev };
                              delete copy.category;
                              return copy;
                            });
                          }}
                          className={fieldClass('category')}
                        >
                          <option value="">
                            {depth === 0 ? 'Selecciona la categoria' : 'Selecciona la subcategoría…'}
                          </option>
                          {options.map((cat: Category) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                    {selectedCategoryId && !selectedHasChildren && (
                      <p className="text-xs font-semibold text-zinc-500">
                        {levels
                          .map((idLvl) => categories.find((c: Category) => c.id === idLvl)?.name)
                          .filter(Boolean)
                          .join(' › ')}
                      </p>
                    )}
                    {err('category')}
                  </div>

                  <div id="field-provider">
                    <label htmlFor="product-provider" className="block text-sm font-bold text-gray-900 mb-3">
                      Proveedor *
                    </label>
                    <select
                      id="product-provider"
                      value={formData.provider_id}
                      aria-invalid={!!errors.provider}
                      aria-describedby={errors.provider ? 'field-provider-error' : undefined}
                      onChange={(e) => set({ provider_id: e.target.value })}
                      className={fieldClass('provider')}
                    >
                      <option value="">Selecciona un proveedor…</option>
                      {providers.map(provider => (
                        <option key={provider.id} value={provider.id}>{provider.name}</option>
                      ))}
                    </select>
                    {err('provider')}
                  </div>
                </div>
              </div>

              {/* Tarjeta: Información General */}
              <div className="bg-zinc-50/50 p-5 md:p-7 rounded-2xl border border-zinc-100 space-y-5 md:space-y-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-zinc-500" />
                  Información General
                </h3>

                <div id="field-name">
                  <label htmlFor="product-name" className="block text-sm font-bold text-gray-900 mb-2">
                    Nombre del Producto *
                  </label>
                  <input
                    id="product-name"
                    type="text"
                    value={formData.name}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'field-name-error' : undefined}
                    onChange={(e) => set({ name: e.target.value })}
                    onBlur={() => {
                      const formattedName = formData.name
                        .split(' ')
                        .filter(w => w)
                        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                        .join(' ');
                      set({ name: formattedName });
                    }}
                    className={fieldClass('name')}
                    placeholder="Ej. Lámpara Colgante Vintage"
                  />
                  {err('name')}
                </div>

                <div>
                  <label htmlFor="product-sku" className="block text-sm font-bold text-gray-900 mb-1">
                    SKU / Código Referencia <span className="font-normal text-zinc-500">(Opcional)</span>
                  </label>
                  <p className="text-xs text-zinc-500 mb-2">Si lo dejas en blanco, el sistema generará uno automáticamente.</p>
                  <input
                    id="product-sku"
                    type="text"
                    value={formData.sku}
                    onChange={(e) => set({ sku: e.target.value })}
                    className={`${inputBase} ${inputOk} uppercase placeholder-zinc-400`}
                    placeholder="Ej. LAMP-001 (Autogenerado)"
                  />
                </div>

                <div>
                  <label htmlFor="product-description" className="block text-sm font-bold text-gray-900 mb-2">
                    Descripción Corta
                  </label>
                  <textarea
                    id="product-description"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => set({ description: e.target.value })}
                    className={`${inputBase} ${inputOk} resize-none`}
                    placeholder="Describe las características principales del producto..."
                  />
                </div>
              </div>

              {/* Tarjeta: Precios y Costos */}
              <div className="bg-zinc-50/50 p-5 md:p-7 rounded-2xl border border-zinc-100 space-y-5 md:space-y-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <CircleDollarSign className="w-5 h-5 text-zinc-500" />
                  Precios y Costos
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
                  <div id="field-cost">
                    <label htmlFor="product-cost" className="block text-sm font-bold text-gray-900 mb-2 flex items-center justify-between">
                      <span>Costo (Proveedor)</span>
                      <span className="text-xs text-zinc-600 font-bold bg-zinc-100 px-2 py-1 rounded-md">{priceUnit}</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-emerald-600 font-bold">$</span>
                      </div>
                      <input
                        id="product-cost"
                        type="text"
                        inputMode="numeric"
                        value={moneyDisplay('cost')}
                        aria-invalid={!!errors.cost}
                        aria-describedby={errors.cost ? 'field-cost-error' : undefined}
                        onFocus={() => setMoneyFocus('cost')}
                        onBlur={() => setMoneyFocus(null)}
                        onChange={(e) => {
                          const v = e.target.value;
                          set({ cost: v === '' ? '' : parseCOPInput(v).toString() });
                        }}
                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-lg font-bold text-emerald-700 bg-emerald-50/50 placeholder-emerald-300 tabular-nums ${errors.cost ? 'border-red-300' : 'border-emerald-200'}`}
                        placeholder="0"
                      />
                    </div>
                    {err('cost')}
                  </div>

                  <div id="field-price">
                    <label htmlFor="product-price" className="block text-sm font-bold text-gray-900 mb-2 flex items-center justify-between">
                      <span>Precio de Venta *</span>
                      <span className="text-xs text-zinc-600 font-bold bg-zinc-100 px-2 py-1 rounded-md">{priceUnit}</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-zinc-500 font-bold">$</span>
                      </div>
                      <input
                        id="product-price"
                        type="text"
                        inputMode="numeric"
                        value={moneyDisplay('price')}
                        aria-invalid={!!errors.price}
                        aria-describedby={errors.price ? 'field-price-error' : undefined}
                        onFocus={() => setMoneyFocus('price')}
                        onBlur={() => setMoneyFocus(null)}
                        onChange={(e) => {
                          const v = e.target.value;
                          set({ price: v === '' ? '' : parseCOPInput(v).toString() });
                        }}
                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all text-lg font-bold bg-white tabular-nums ${errors.price ? 'border-red-300' : 'border-zinc-200'}`}
                        placeholder="0"
                      />
                    </div>
                    {err('price')}
                  </div>
                </div>
              </div>

              {/* Tarjeta: Inventario */}
              <div className="bg-zinc-50/50 p-5 md:p-7 rounded-2xl border border-zinc-100 space-y-5 md:space-y-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Boxes className="w-5 h-5 text-zinc-500" />
                  Inventario
                </h3>

                <div id="field-min_stock">
                  <label htmlFor="product-min-stock" className="block text-sm font-bold text-gray-900 mb-1">
                    Cantidad Mínima Recomendada
                  </label>
                  <p className="text-xs text-zinc-500 mb-2">El sistema te alertará cuando el stock baje de esta cantidad.</p>
                  <input
                    id="product-min-stock"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.min_stock}
                    aria-invalid={!!errors.min_stock}
                    aria-describedby={errors.min_stock ? 'field-min_stock-error' : undefined}
                    onChange={(e) => set({ min_stock: e.target.value })}
                    className={`${fieldClass('min_stock')} font-medium`}
                    placeholder="Ej. 5"
                  />
                  {err('min_stock')}
                </div>
              </div>
              {/* Tarjeta: Multimedia */}
              <div className="bg-zinc-50/50 p-5 md:p-7 rounded-2xl border border-zinc-100 space-y-5 md:space-y-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Images className="w-5 h-5 text-zinc-500" />
                  Multimedia
                </h3>

                <div id="field-images">
                  <span id="product-images-label" className="block text-sm font-bold text-gray-900 mb-1">
                    Imágenes *
                  </span>
                  <p className="text-xs text-zinc-500 mb-3">Máx. 5 imágenes (Recomendado: 800x800px)</p>

                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4">
                    {imagePreviews.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-xl border-2 border-zinc-200 overflow-hidden group shadow-sm bg-white">
                        <img src={url} alt={`Imagen ${index + 1} del producto`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            aria-label={`Eliminar imagen ${index + 1}`}
                            className="bg-red-500 text-white p-2 rounded-xl hover:bg-red-600 transition-all shadow-lg hover:scale-110 active:scale-95"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>
                    ))}

                    {imagePreviews.length < 5 && (
                      <label className="relative aspect-square rounded-xl border-2 border-dashed border-zinc-300 hover:border-zinc-500 hover:bg-zinc-100 bg-white transition-all cursor-pointer flex flex-col items-center justify-center group shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-zinc-100 group-hover:bg-zinc-200 flex items-center justify-center mb-2 transition-colors">
                          <svg className="w-5 h-5 text-zinc-500 group-hover:text-zinc-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <span className="text-xs font-bold text-zinc-500 group-hover:text-zinc-700 transition-colors">Agregar</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          aria-labelledby="product-images-label"
                          onChange={handleImageSelect}
                          className="sr-only"
                        />
                      </label>
                    )}
                  </div>
                  {err('images')}
                </div>

                <div id="field-video">
                  <label htmlFor="product-video" className="block text-sm font-bold text-gray-900 mb-2">
                    Video Demostrativo <span className="font-normal text-zinc-500">(Opcional)</span>
                  </label>
                  <input
                    id="product-video"
                    type="url"
                    inputMode="url"
                    value={formData.video_url}
                    aria-invalid={!!errors.video}
                    aria-describedby={errors.video ? 'field-video-error' : undefined}
                    onChange={(e) => set({ video_url: e.target.value })}
                    className={`${fieldClass('video')} text-sm`}
                    placeholder="https://youtube.com/..."
                  />
                  {err('video')}
                </div>
              </div>
          </div>
        </div>

        <div className="sticky bottom-0 z-10 bg-gray-50/95 backdrop-blur px-6 md:px-8 py-4 border-t border-zinc-200 rounded-b-2xl flex flex-col-reverse sm:flex-row justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-white hover:border-gray-400 transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm transition-all rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px] flex justify-center items-center"
          >
            {isSubmitting ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              isEditing ? 'Guardar Cambios' : 'Crear Producto'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
