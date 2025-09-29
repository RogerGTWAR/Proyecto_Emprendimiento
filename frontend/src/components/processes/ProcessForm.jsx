import { useEffect, useMemo, useRef, useState } from "react";
import Button from "../ui/Button";
import CloseButton from "../ui/CloseButton";
import WorkerSearchModal from "./WorkerSearchModal";
import ServiceForm from "./ServiceForm";
import WorkerCard from "./WorkerCard";
import ServiceCard from "./ServiceCard";

import { fetchProducts } from "../../data/products";
import { fetchWorkers } from "../../data/workers";

import { createService as createServiceApi, deleteService as deleteServiceApi } from "../../data/services";

import { createProcess, updateProcess } from "../../data/processes";

const safeNum = (v, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};
const str = (v) => String(v ?? "");

const uniqById = (arr = []) => {
  const map = new Map();
  for (const x of arr) {
    const id =
      safeNum(x?.id, NaN) ||
      safeNum(x?.worker_id, NaN) ||
      safeNum(x?.service_id, NaN);
    if (Number.isFinite(id)) map.set(id, x);
  }
  return Array.from(map.values());
};

const toWorkerUI = (w = {}, all = []) => {
  const id = safeNum(w.id ?? w.worker_id ?? w?.workers?.id, NaN);
  const base = Array.isArray(all) ? all.find((x) => safeNum(x.id, NaN) === id) : null;

  const nombre = str(
    w.nombre ?? w.name ?? w.firstname ?? w.first_name ?? base?.nombre ?? base?.name ?? ""
  );
  const apellido = str(
    w.apellido ?? w.lastname ?? w.last_name ?? base?.apellido ?? base?.lastname ?? ""
  );

  const pagoPorHora = safeNum(
    w.pagoPorHora ?? w.pago ?? w.hourly_rate ?? base?.pagoPorHora ?? base?.pago ?? base?.hourly_rate,
    0
  );

  return {
    id: Number.isFinite(id) ? id : null,
    nombre,
    apellido,
    pagoPorHora,
  };
};



const ProcessForm = ({ onClose, onSubmit, initialData, isEdit = false, companyId }) => {
  const [formData, setFormData] = useState({
    producto: null,
    cantidad: 1,
    trabajadores: [],
    servicios: [],
    duracionTotal: 0,
  });

  const [allProducts, setAllProducts] = useState([]);
  const [allWorkers, setAllWorkers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadingW, setLoadingW] = useState(true);
  const [errorW, setErrorW] = useState("");

  const [searchProduct, setSearchProduct] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showProductResults, setShowProductResults] = useState(false);

  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);

  const [deletingIds, setDeletingIds] = useState(new Set());
  const [creatingService, setCreatingService] = useState(false);

  const [submitLoading, setSubmitLoading] = useState(false);

  const searchInputRef = useRef(null);
  const submittingRef = useRef(false); 
  
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const rows = await fetchProducts();
        if (mounted) setAllProducts(Array.isArray(rows) ? rows : []);
      } catch (e) {
        if (mounted) setError(e?.message || "No se pudieron cargar productos");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingW(true);
        const rows = await fetchWorkers();
        if (mounted) setAllWorkers(Array.isArray(rows) ? rows : []);
      } catch (e) {
        if (mounted) setErrorW(e?.message || "No se pudieron cargar trabajadores");
      } finally {
        if (mounted) setLoadingW(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  
useEffect(() => {
  if (isEdit && initialData) {
    setFormData((prev) => ({
      ...prev,
      producto: initialData.producto ?? null,
      cantidad: safeNum(initialData.cantidad, 1) || 1,
      trabajadores: Array.isArray(initialData.trabajadores)
        ? initialData.trabajadores.map((w) => toWorkerUI(w, allWorkers))
        : [],
      servicios: Array.isArray(initialData.servicios)
        ? initialData.servicios.map((s) => ({
            id: s.id ?? s.service_id ?? s?.serviceId ?? s?.Id ?? s?.ID,
            nombre: s.nombre ?? s.name ?? "",
            monto: safeNum(s.monto ?? s.cost ?? s.cost_service, 0),
          }))
        : [],
      duracionTotal: safeNum(initialData.duracionTotal, 0),
    }));
    if (initialData.producto?.nombre) setSearchProduct(str(initialData.producto.nombre));
  }
}, [isEdit, initialData, allWorkers]);


  useEffect(() => {
    if (searchProduct) {
      const q = str(searchProduct).toLowerCase();
      const filtered = (allProducts || []).filter((p) => str(p?.nombre).toLowerCase().includes(q));
      setFilteredProducts(filtered);
      setShowProductResults(true);
    } else {
      setFilteredProducts([]);
      setShowProductResults(false);
    }
  }, [searchProduct, allProducts]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchInputRef.current && !searchInputRef.current.contains(e.target)) {
        setShowProductResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (formData.producto && safeNum(formData.cantidad, 0) > 0) {
      const est = safeNum(formData.producto.estimated_time, 0);
      const duracionTotal = est * safeNum(formData.cantidad, 1);
      setFormData((prev) => ({ ...prev, duracionTotal }));
    }
  }, [formData.producto, formData.cantidad]);

  const formatearMoneda = (monto) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(safeNum(monto, 0));

  const costoDesglosado = useMemo(() => {
    const d = { materiales: 0, manoObra: 0, servicios: 0, total: 0 };

    const materiales = safeNum(formData?.producto?.totalCost ?? formData?.producto?.total_cost, NaN);
    const precioFallback = safeNum(formData?.producto?.precio, NaN);

    if (Number.isFinite(materiales)) d.materiales = materiales;
    else if (Number.isFinite(precioFallback)) d.materiales = precioFallback * safeNum(formData.cantidad, 1);

    if ((formData.trabajadores || []).length > 0 && safeNum(formData.duracionTotal, 0) > 0) {
      const horas = safeNum(formData.duracionTotal, 0) / 60;
      (formData.trabajadores || []).forEach((w) => {
        const pago = safeNum(w?.pagoPorHora ?? w?.pago, 0);
        d.manoObra += pago * horas;
      });
    }

    (formData.servicios || []).forEach((s) => {
      d.servicios += safeNum(s?.monto, 0);
    });

    d.total = d.materiales + d.manoObra + d.servicios;
    return d;
  }, [formData.producto, formData.cantidad, formData.trabajadores, formData.servicios, formData.duracionTotal]);

  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === "cantidad" ? Math.max(1, safeNum(value, 1)) : value }));
  };

  const handleProductSelect = (product) => {
    setFormData((prev) => ({ ...prev, producto: product }));
    setSearchProduct(product?.nombre ?? "");
    setShowProductResults(false);
  };

  const handleProductSearch = (e) => setSearchProduct(e.target.value ?? "");

const handleAddWorkers = (workers) => {
  const existingIds = new Set((formData.trabajadores || []).map((w) => w.id));
  const newWorkers = (workers || [])
    .filter((w) => !existingIds.has(w.id))
    .map((w) => toWorkerUI(w, allWorkers));

  setFormData((prev) => ({ ...prev, trabajadores: [...prev.trabajadores, ...newWorkers] }));
  setShowWorkerModal(false);
};


  const handleRemoveWorker = (workerId) => {
    setFormData((prev) => ({
      ...prev,
      trabajadores: prev.trabajadores.filter((w) => w.id !== workerId),
    }));
  };

  const handleAddService = async (service) => {
    const nombre = str(service?.nombre).trim();
    const monto = safeNum(service?.monto, 0);
    if (!nombre) {
      setShowServiceForm(false);
      return;
    }

    try {
      setCreatingService(true);
      const created = await createServiceApi({ nombre, costo: monto });
      const nuevo = { id: created.id, nombre: created.nombre, monto: safeNum(created.costo, monto) };
      setFormData((prev) => ({ ...prev, servicios: [...prev.servicios, nuevo] }));
      setShowServiceForm(false);
    } catch (err) {
      alert(err?.message || "No se pudo registrar el servicio");
    } finally {
      setCreatingService(false);
    }
  };

  const handleRemoveService = async (serviceId) => {
    const svc = (formData.servicios || []).find((s) => s.id === serviceId);
    if (!svc) return;

    try {
      setDeletingIds((prev) => new Set([...prev, svc.id]));
      await deleteServiceApi(svc.id);
      setFormData((prev) => ({
        ...prev,
        servicios: prev.servicios.filter((s) => s.id !== serviceId),
      }));
    } catch (err) {
      alert(err?.message || "No se pudo eliminar el servicio en el servidor");
    } finally {
      setDeletingIds((prev) => {
        const copy = new Set(prev);
        copy.delete(serviceId);
        return copy;
      });
    }
  };

const handleSubmit = async () => {
  if (submittingRef.current) return; 
  submittingRef.current = true;

  const prod = formData?.producto;
  const prodId = safeNum(prod?.id, NaN);
  if (!Number.isFinite(prodId)) {
    alert("Por favor selecciona un producto");
    submittingRef.current = false;
    return;
  }

  const minutos = safeNum(formData?.duracionTotal, 0);
  const horas = minutos / 60;

  const serviciosUnicos = uniqById(formData.servicios);
  const trabajadoresUnicos = uniqById(formData.trabajadores);

  const servicesPayload = serviciosUnicos
    .map((s) => {
      const sid = safeNum(s?.id, NaN);
      if (!Number.isFinite(sid)) return null;
      return { service_id: sid, cost_service: safeNum(s?.monto, 0) };
    })
    .filter(Boolean);

  const workersPayload = trabajadoresUnicos
    .map((w) => {
      const id = safeNum(w?.id, NaN);
      if (!Number.isFinite(id)) return null;
      const hourly = safeNum(w?.pagoPorHora ?? w?.pago, 0);
      return { id, cost_labor: hourly * horas }; // 🔁 siempre recalculado
    })
    .filter(Boolean);

  const payload = {
    name: `Proceso - ${str(prod?.nombre) || "Sin nombre"}`,
    product_id: prodId,
    ...(Number.isFinite(safeNum(companyId, NaN)) ? { company_id: safeNum(companyId, NaN) } : {}),
    quantity: safeNum(formData?.cantidad, 1) || 1,
    duration_total_minutes: minutos,
    services: servicesPayload,
    workers: workersPayload,
    cost_total: costoDesglosado.total,
  };

  try {
    setSubmitLoading(true);
    const saved =
      isEdit && initialData?.id != null
        ? await updateProcess(initialData.id, payload)
        : await createProcess(payload);

    onSubmit?.(saved);
    onClose?.();
  } catch (err) {
    alert(err?.message || "No se pudo guardar el proceso");
  } finally {
    setSubmitLoading(false);
    submittingRef.current = false;
  }
};


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-[#D1D5DB]">
          <h2 className="text-xl font-semibold text-[#1E1E1E]">
            {isEdit ? "Editar Proceso" : "Agregar Proceso de Producción"}
          </h2>
          <CloseButton onClick={onClose} />
        </div>

        <div className="p-6 space-y-6">
          <div ref={searchInputRef} className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">Producto a Producir *</label>
            <input
              type="text"
              value={searchProduct}
              onChange={handleProductSearch}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
              placeholder={loading ? "Cargando productos..." : error || "Buscar producto..."}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#209E7F] focus:border-transparent"
            />

            {showProductResults && (
              <div
                className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {filteredProducts.map((product) => (
                  <div
                    key={product?.id ?? Math.random()}
                    className="p-3 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleProductSelect(product)}
                  >
                    <div className="font-medium">{product?.nombre}</div>
                    <div className="text-sm text-gray-500">
                      Tiempo unitario: {safeNum(product?.estimated_time, 0)} min
                      {Number.isFinite(safeNum(product?.totalCost ?? product?.total_cost)) &&
                        ` | Costo materiales: ${formatearMoneda(product?.totalCost ?? product?.total_cost)}`}
                      {Number.isFinite(safeNum(product?.precio, NaN)) &&
                        ` | Precio: ${formatearMoneda(product?.precio)}`}
                    </div>
                  </div>
                ))}
                {filteredProducts.length === 0 && <div className="p-3 text-gray-500">No se encontraron productos</div>}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad *</label>
              <input
                type="number"
                name="cantidad"
                min="1"
                value={formData.cantidad}
                onChange={handleChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.preventDefault();
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#209E7F] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duración Total (min)</label>
              <input
                type="number"
                name="duracionTotal"
                value={formData.duracionTotal}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.producto
                  ? `Cálculo: ${safeNum(formData.cantidad, 1)} × ${safeNum(formData.producto?.estimated_time, 0)} min = ${safeNum(formData.duracionTotal, 0)} min`
                  : "Selecciona un producto para calcular la duración"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">Trabajadores Asignados</label>
                <span className="text-sm text-gray-500">{(formData.trabajadores || []).length} seleccionados</span>
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="gray"
                  onClick={() => setShowWorkerModal(true)}
                  className="px-6 py-2.5"
                  disabled={loadingW || !!errorW}
                >
                  {loadingW ? "Cargando..." : errorW || "Trabajadores"}
                </Button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto min-h-[120px]">
                {(formData.trabajadores || []).map((w) => (
                  <WorkerCard key={w.id ?? Math.random()} worker={w} onRemove={handleRemoveWorker} />
                ))}
                {(formData.trabajadores || []).length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">No hay trabajadores agregados</div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">Servicios Adicionales</label>
                <span className="text-sm text-gray-500">{(formData.servicios || []).length} agregados</span>
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="gray"
                  onClick={() => setShowServiceForm(true)}
                  className="px-6 py-2.5"
                  disabled={creatingService}
                >
                  {creatingService ? "Registrando..." : "Servicios"}
                </Button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto min-h-[120px]">
                {(formData.servicios || []).map((s) => (
                  <ServiceCard
                    key={s.id ?? Math.random()}
                    service={s}
                    onRemove={() => handleRemoveService(s.id)}
                    deleting={deletingIds.has(s.id)}
                  />
                ))}
                {(formData.servicios || []).length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">No hay servicios agregados</div>
                )}
              </div>
            </div>
          </div>

          {formData.producto && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Producto Seleccionado:</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Nombre:</span> {formData.producto.nombre}
                </div>
                <div>
                  <span className="font-medium">Tiempo unitario:</span> {safeNum(formData.producto.estimated_time, 0)} min
                </div>
                {Number.isFinite(safeNum(formData.producto.precio, NaN)) && (
                  <div>
                    <span className="font-medium">Precio unitario:</span> {formatearMoneda(formData.producto.precio)}
                  </div>
                )}
                <div className="col-span-2">
                  <span className="font-medium">Descripción:</span> {formData.producto.description}
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Desglose del Costo Estimado</h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Costo de materiales:</span>
                <span>{formatearMoneda(costoDesglosado.materiales)}</span>
              </div>

              <div className="flex justify-between">
                <span>Costo de mano de obra:</span>
                <span>{formatearMoneda(costoDesglosado.manoObra)}</span>
              </div>

              <div className="flex justify-between">
                <span>Servicios adicionales:</span>
                <span>{formatearMoneda(costoDesglosado.servicios)}</span>
              </div>

              <div className="border-t border-gray-300 pt-2 mt-2">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Costo Total Estimado:</span>
                  <span className="text-gray-600">{formatearMoneda(costoDesglosado.total)}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-600 mt-3">
              {(formData.trabajadores || []).length > 0 && safeNum(formData.duracionTotal, 0) > 0
                ? `Cálculo mano de obra: ${(formData.trabajadores || []).length} trabajador(es) × ${safeNum(
                    formData.duracionTotal,
                    0
                  )} min (${(safeNum(formData.duracionTotal, 0) / 60).toFixed(1)} horas)`
                : ""}
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1 py-2.5">
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleSubmit}
              className="flex-1 py-2.5"
              disabled={!formData.producto || submitLoading}
            >
              {submitLoading ? (isEdit ? "Guardando..." : "Agregando...") : isEdit ? "Guardar Cambios" : "Agregar Proceso"}
            </Button>
          </div>
        </div>
      </div>

      {showWorkerModal && (
        <WorkerSearchModal
          isOpen={showWorkerModal}
          onClose={() => setShowWorkerModal(false)}
          workers={Array.isArray(allWorkers) ? allWorkers : []}
          onSelectWorkers={handleAddWorkers}
        />
      )}

      {showServiceForm && (
        <ServiceForm isOpen={showServiceForm} onClose={() => setShowServiceForm(false)} onSubmit={handleAddService} />
      )}
    </div>
  );
};

export default ProcessForm;
