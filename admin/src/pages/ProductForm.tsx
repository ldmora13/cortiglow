import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { formatCOP, parseCOPInput } from '../utils/currency';
import { notify } from '../hooks/useNotification';
import { useProducts } from '../hooks/useProducts';
import { useProviders } from '../hooks/useProviders';
import { getCategoryPath, getCategoryDepth } from '../utils/categoryUtils';

interface ProductFormData {
  name: string;
  sku: string;
  description: string;
  price: string;
  cost: string;
  category_id: string;
  provider_id: string;
  images: string[];
  video_url: string;
  min_stock: string;
}

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
    category_id: '',
    provider_id: '',
    images: [],
    video_url: '',
    min_stock: '5'
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [level1Id, setLevel1Id] = useState('');
  const [level2Id, setLevel2Id] = useState('');

  useEffect(() => {
    if (categories.length > 0 && formData.category_id) {
      const path = getCategoryPath(categories, formData.category_id);
      if (path.length >= 2) {
         if (path[0]) setLevel1Id(path[0].id);
         if (path[1]) setLevel2Id(path[1].id);
      }
    }
  }, [formData.category_id, categories]);

  useEffect(() => {
    if (isEditing && initialProduct) {
      setFormData({
        name: initialProduct.name,
        sku: initialProduct.sku || '',
        description: initialProduct.description || '',
        price: initialProduct.price.toString(),
        cost: initialProduct.cost ? initialProduct.cost.toString() : '',
        category_id: initialProduct.category_id || '',
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
    
    if (files.length + imageFiles.length + formData.images.length > 5) {
      notify.error('Máximo 5 imágenes por producto');
      return;
    }

    setImageFiles([...imageFiles, ...files]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!formData.name.trim()) throw new Error('El nombre es requerido');
      if (!formData.price || parseFloat(formData.price) <= 0) throw new Error('El precio debe ser mayor a 0');
      if (imagePreviews.length === 0) throw new Error('Debes agregar al menos una imagen');

      const imageUrls = await uploadImages();

      const payload = {
        name: formData.name.trim(),
        sku: formData.sku.trim() || null,
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        cost: formData.cost ? parseFloat(formData.cost) : 0,
        category_id: formData.category_id || null,
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
  
  const selectedCat = categories.find((c: any) => c.id === level1Id);
  const catName = selectedCat?.name?.toLowerCase() || '';
  const isSquareMeter = catName.includes('cortina') || catName.includes('persiana');
  const priceUnit = isSquareMeter ? 'COP / m²' : 'COP / Und';

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 md:pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
            {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
          </h1>
          <p className="text-zinc-600 mt-1">
            {isEditing ? 'Actualiza los detalles del producto' : 'Agrega un nuevo producto al catálogo'}
          </p>
        </div>
        <button
          onClick={() => navigate('/products')}
          className="text-center px-4 py-2 text-zinc-600 hover:text-gray-900 font-semibold"
        >
          ← Volver
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="p-6 md:p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Columna Izquierda (Principal) */}
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              
              {/* Tarjeta: Información General */}
              <div className="bg-zinc-50/50 p-5 md:p-7 rounded-2xl border border-zinc-100 space-y-5 md:space-y-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-xl">📝</span> Información General
                </h3>
                
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Nombre del Producto *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    onBlur={() => {
                      const formattedName = formData.name
                        .split(' ')
                        .filter(w => w)
                        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                        .join(' ');
                      setFormData({ ...formData, name: formattedName });
                    }}
                    className="w-full px-4 py-3 border-2 border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all bg-white"
                    placeholder="Ej. Lámpara Colgante Vintage"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">
                    SKU / Código Referencia <span className="font-normal text-zinc-500">(Opcional)</span>
                  </label>
                  <p className="text-xs text-zinc-500 mb-2">Si lo dejas en blanco, el sistema generará uno automáticamente.</p>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all uppercase bg-white placeholder-zinc-400"
                    placeholder="Ej. LAMP-001 (Autogenerado)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Descripción Corta</label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all resize-none bg-white"
                    placeholder="Describe las características principales del producto..."
                  />
                </div>
              </div>

              {/* Tarjeta: Precios y Costos */}
              <div className="bg-zinc-50/50 p-5 md:p-7 rounded-2xl border border-zinc-100 space-y-5 md:space-y-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  Precios y Costos
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center justify-between">
                      <span>Costo (Proveedor)</span>
                      <span className="text-xs text-zinc-600 font-bold bg-zinc-100 px-2 py-1 rounded-md">{priceUnit}</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-emerald-600 font-bold">$</span>
                      </div>
                      <input
                        type="text"
                        value={formData.cost.toString() ? formatCOP(parseFloat(formData.cost)).replace('$ ', '') : ''}
                        onChange={(e) => setFormData({ ...formData, cost: parseCOPInput(e.target.value).toString() })}
                        className="w-full pl-10 pr-4 py-3 border-2 border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-lg font-bold text-emerald-700 bg-emerald-50/50 placeholder-emerald-300"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center justify-between">
                      <span>Precio de Venta *</span>
                      <span className="text-xs text-zinc-600 font-bold bg-zinc-100 px-2 py-1 rounded-md">{priceUnit}</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-zinc-500 font-bold">$</span>
                      </div>
                      <input
                        type="text"
                        required
                        value={formData.price.toString() ? formatCOP(parseFloat(formData.price)).replace('$ ', '') : ''}
                        onChange={(e) => setFormData({ ...formData, price: parseCOPInput(e.target.value).toString() })}
                        className="w-full pl-10 pr-4 py-3 border-2 border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all text-lg font-bold bg-white"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tarjeta: Inventario */}
              <div className="bg-zinc-50/50 p-5 md:p-7 rounded-2xl border border-zinc-100 space-y-5 md:space-y-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  Inventario
                </h3>
                
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">
                    Cantidad Mínima Recomendada
                  </label>
                  <p className="text-xs text-zinc-500 mb-2">El sistema te alertará cuando el stock baje de esta cantidad.</p>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.min_stock}
                    onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all bg-white font-medium"
                    placeholder="Ej. 5"
                  />
                </div>
              </div>
            </div>

            {/* Columna Derecha (Secundaria) */}
            <div className="space-y-6 md:space-y-8">
              
              {/* Tarjeta: Organización */}
              <div className="bg-zinc-50/50 p-5 md:p-7 rounded-2xl border border-zinc-100 space-y-5 md:space-y-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-xl">📂</span> Clasificación
                </h3>
                
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-900">Categoría del Producto *</label>
                  {/* Nivel 1 */}
                  <div>
                    <select
                      required
                      value={level1Id}
                      onChange={(e) => {
                        setLevel1Id(e.target.value);
                        setLevel2Id('');
                        setFormData({ ...formData, category_id: '' });
                      }}
                      className="w-full px-4 py-3 border-2 border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all bg-white"
                    >
                      <option value="" disabled>Selecciona Familia Principal...</option>
                      {categories.filter((cat: any) => getCategoryDepth(categories, cat.id) === 0).map((cat: any) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Nivel 2 */}
                  {level1Id && (
                    <div className="pl-3 border-l-2 border-zinc-300 animate-in fade-in slide-in-from-top-2 duration-300">
                      <select
                        required
                        value={level2Id}
                        onChange={(e) => {
                          setLevel2Id(e.target.value);
                          setFormData({ ...formData, category_id: '' });
                        }}
                        className="w-full px-4 py-3 border-2 border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all bg-white"
                      >
                        <option value="" disabled>Selecciona Subcategoría (2do Nivel)...</option>
                        {categories.filter((cat: any) => cat.parent_id === level1Id).map((cat: any) => (
                          <option key={cat.id} value={cat.id}>↳ {cat.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Nivel 3 */}
                  {level2Id && (
                    <div className="pl-6 border-l-2 border-zinc-300 animate-in fade-in slide-in-from-top-2 duration-300">
                      <select
                        required
                        value={formData.category_id}
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all bg-white"
                      >
                        <option value="" disabled>Selecciona Subcategoría (3er Nivel)...</option>
                        {categories.filter((cat: any) => cat.parent_id === level2Id).map((cat: any) => (
                          <option key={cat.id} value={cat.id}>↳ {cat.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Proveedor *</label>
                  <select
                    required
                    value={formData.provider_id}
                    onChange={(e) => setFormData({ ...formData, provider_id: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all bg-white"
                  >
                    <option value="">Seleccione un proveedor...</option>
                    {providers.map(provider => (
                      <option key={provider.id} value={provider.id}>{provider.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tarjeta: Multimedia */}
              <div className="bg-zinc-50/50 p-5 md:p-7 rounded-2xl border border-zinc-100 space-y-5 md:space-y-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-xl">📸</span> Multimedia
                </h3>
                
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">Imágenes *</label>
                  <p className="text-xs text-zinc-500 mb-3">Máx. 5 imágenes (Recomendado: 800x800px)</p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                    {imagePreviews.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-xl border-2 border-zinc-200 overflow-hidden group shadow-sm bg-white">
                        <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
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
                        <input type="file" multiple accept="image/*" onChange={handleImageSelect} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Video Demostrativo (Opcional)</label>
                  <input
                    type="url"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all bg-white text-sm"
                    placeholder="https://youtube.com/..."
                  />
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-6 md:px-8 py-5 border-t border-zinc-200 flex justify-end gap-3">
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
