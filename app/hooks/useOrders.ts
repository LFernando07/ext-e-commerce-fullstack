"use client";

import { PedidoEstado, Pedido } from "@/types/api";
import { ordersService } from "@/services/orders.service";
import { useCallback, useEffect, useState } from "react";

export function useOrders() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEstado, setFilterEstado] = useState<PedidoEstado | "todos">(
    "todos",
  );
  const [actionLoading, setActionLoading] = useState(false);

  // Estado del formulario nuevo pedido (POST)
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Estado general del formulario para crear un nuevo pedido
  const [pedidoForm, setPedidoForm] = useState({
    clienteNombre: "",
    concepto: "",
    monto: "",
    plazos: "4",
  });

  // Cargar pedidos utilizando `ordersService.getPedidos`
  const fetchPedidos = useCallback(async () => {
    try {
      const params = filterEstado !== 'todos' ? { estado: filterEstado } : undefined;
      const res = await ordersService.getPedidos(params);
      setPedidos(res.data);
    } catch (err: unknown) {
      alert(`Error al cargar pedidos: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [filterEstado]);

  useEffect(() => {
    let ignore = false;

    async function loadInitial() {
      try {
        const params = filterEstado !== 'todos' ? { estado: filterEstado } : undefined;
        const res = await ordersService.getPedidos(params);
        // Solo actualizar estado si el componente sigue montado
        if (!ignore) {
          setPedidos(res.data);
        }
      } catch (err: unknown) {
        if (!ignore) {
          alert(`Error al cargar pedidos: ${(err as Error).message}`);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadInitial();

    // Cleanup para evitar actualizar estado si el componente se desmonta
    return () => {
      ignore = true;
    };
  }, [filterEstado]);

  return {
    pedidos,
    setPedidos,
    loading,
    setLoading,
    filterEstado,
    setFilterEstado,
    actionLoading,
    setActionLoading,
    isFormOpen,
    setIsFormOpen,
    pedidoForm,
    setPedidoForm,
    fetchPedidos,
  };
}
