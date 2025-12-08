"use client";

import { type FormEvent, useEffect, useState } from "react";

type ClienteFormValues = {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  tipoFactura: string;
  tipoIVA: string;
  cuit: string;
};

interface FormularioClienteProps {
  onClose: () => void;
  editItem?: ClienteFormValues | null;
  onSave: (data: ClienteFormValues) => void;
}

export default function FormularioCliente({
  onClose,
  editItem,
  onSave,
}: FormularioClienteProps) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [tipoFactura, setTipoFactura] = useState("");
  const [tipoIVA, setTipoIVA] = useState("");
  const [cuit, setCuit] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setNombre(editItem?.nombre ?? "");
      setEmail(editItem?.email ?? "");
      setTelefono(editItem?.telefono ?? "");
      setTipoFactura(editItem?.tipoFactura ?? "");
      setTipoIVA(editItem?.tipoIVA ?? "");
      setCuit(editItem?.cuit ?? "");
    }, 0);

    return () => clearTimeout(timer);
  }, [editItem]);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    onSave({
      id: editItem?.id || Date.now().toString(),
      nombre,
      email,
      telefono,
      tipoFactura,
      tipoIVA,
      cuit,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <form onSubmit={submit} className="bg-white p-6 rounded shadow w-96">
        <h2 className="text-xl font-semibold mb-4">
          {editItem ? "Editar Cliente" : "Nuevo Cliente"}
        </h2>

        <input
          className="input"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <input
          className="input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="input"
          placeholder="Teléfono"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
        />

        <input
          className="input"
          placeholder="Tipo de Factura (A/B/C)"
          value={tipoFactura}
          onChange={(e) => setTipoFactura(e.target.value)}
        />

        <input
          className="input"
          placeholder="Tipo de IVA (RI/MONO/EXENTO)"
          value={tipoIVA}
          onChange={(e) => setTipoIVA(e.target.value)}
        />

        <input
          className="input"
          placeholder="CUIT"
          value={cuit}
          onChange={(e) => setCuit(e.target.value)}
        />

        <div className="flex justify-end gap-3 mt-4">
          <button type="button" onClick={onClose} className="text-gray-600">
            Cancelar
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}
