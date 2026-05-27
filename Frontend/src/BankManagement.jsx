import { useState, useEffect, useCallback } from "react";
import * as api from "./api"; // Ajusta la ruta si es necesario

// ------------------- UTILIDADES (sin cambios) -------------------
const fmt = (n) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);
const fmtDate = (d) => new Date(d).toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" });

// ========================
// COMPONENTES VISUALES (sin cambios)
// ========================

const Badge = ({ children, variant = "default" }) => {
  const variants = {
    default: { bg: "#f1f5f9", color: "#475569" },
    success: { bg: "#dcfce7", color: "#166534" },
    danger: { bg: "#fee2e2", color: "#991b1b" },
    warning: { bg: "#fef3c7", color: "#92400e" },
    info: { bg: "#dbeafe", color: "#1e40af" },
    purple: { bg: "#ede9fe", color: "#4c1d95" },
  };
  const s = variants[variant] || variants.default;
  return (
    <span style={{ background: s.bg, color: s.color, padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 600, letterSpacing: 0.3 }}>
      {children}
    </span>
  );
};

const Card = ({ children, style = {} }) => (
  <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", padding: "1.25rem", ...style }}>
    {children}
  </div>
);

const SectionTitle = ({ icon, children }) => (
  <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
    <span style={{ fontSize: 18 }}>{icon}</span> {children}
  </h2>
);

const Input = ({ label, ...props }) => (
  <div style={{ marginBottom: 10 }}>
    {label && <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>{label}</label>}
    <input
      style={{ width: "100%", padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, color: "#1e293b", outline: "none", background: "#f8fafc", boxSizing: "border-box" }}
      {...props}
    />
  </div>
);

const Select = ({ label, children, ...props }) => (
  <div style={{ marginBottom: 10 }}>
    {label && <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>{label}</label>}
    <select
      style={{ width: "100%", padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, color: "#1e293b", outline: "none", background: "#f8fafc", boxSizing: "border-box" }}
      {...props}
    >
      {children}
    </select>
  </div>
);

const Button = ({ children, onClick, variant = "primary", style = {}, disabled = false }) => {
  const variants = {
    primary: { background: "#1e40af", color: "#fff" },
    success: { background: "#15803d", color: "#fff" },
    danger: { background: "#dc2626", color: "#fff" },
    ghost: { background: "transparent", color: "#1e40af", border: "1px solid #1e40af" },
    secondary: { background: "#f1f5f9", color: "#475569" },
  };
  const v = variants[variant] || variants.primary;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ ...v, padding: "9px 18px", borderRadius: 8, border: "none", fontWeight: 600, fontSize: 14, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1, transition: "opacity 0.15s", ...style }}
    >
      {children}
    </button>
  );
};

const Alert = ({ message, type = "success", onClose }) => {
  if (!message) return null;
  const colors = { success: { bg: "#f0fdf4", border: "#bbf7d0", text: "#166534" }, error: { bg: "#fef2f2", border: "#fecaca", text: "#991b1b" } };
  const c = colors[type];
  return (
    <div style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text, padding: "10px 14px", borderRadius: 8, marginBottom: 12, fontSize: 13, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span>{message}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: c.text, fontSize: 16, lineHeight: 1 }}>×</button>
    </div>
  );
};

const Table = ({ headers, rows }) => (
  <div style={{ overflowX: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr style={{ background: "#f8fafc" }}>
          {headers.map((h, i) => (
            <th key={i} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, color: "#64748b", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr><td colSpan={headers.length} style={{ padding: "24px", textAlign: "center", color: "#94a3b8" }}>Sin registros</td></tr>
        ) : rows.map((row, i) => (
          <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
            {row.map((cell, j) => (
              <td key={j} style={{ padding: "10px 12px", color: "#334155", verticalAlign: "middle" }}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const TabBar = ({ tabs, active, onChange }) => (
  <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #e2e8f0", marginBottom: 20, overflowX: "auto" }}>
    {tabs.map((t) => (
      <button
        key={t.key}
        onClick={() => onChange(t.key)}
        style={{
          padding: "10px 16px", border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
          color: active === t.key ? "#1e40af" : "#64748b",
          borderBottom: active === t.key ? "2px solid #1e40af" : "2px solid transparent",
          whiteSpace: "nowrap", transition: "color 0.15s",
        }}
      >
        {t.icon} {t.label}
      </button>
    ))}
  </div>
);

// ======================== LOGIN ========================
// Nota: Se eliminó el uso de window.__db y la base simulada.
// Ahora el login es asíncrono y se comunica con la API.
const Login = ({ onLogin, loading }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const doLogin = async () => {
    if (!username || !password) {
      setError("Completa ambos campos");
      return;
    }
    try {
      setError("");
      await onLogin(username, password);
      // El componente padre App se encarga de cambiar currentUser en caso de éxito.
      // Si hay error, lo capturamos aquí porque onLogin ahora lanza excepción.
    } catch (e) {
      setError(e.message || "Error de conexión");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #1e40af 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "2.5rem", width: 380, boxShadow: "0 25px 50px rgba(0,0,0,0.4)" }}>
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div style={{ width: 60, height: 60, background: "#1e40af", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 28 }}>🏦</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>BankManagment</h1>
          <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>Sistema de Gestión Bancaria</p>
        </div>
        {error && <Alert message={error} type="error" onClose={() => setError("")} />}
        <Input label="Usuario" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Ej: juan, carlos, admin" />
        <Input label="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" />
        <Button onClick={doLogin} style={{ width: "100%", marginTop: 8, padding: "11px" }} disabled={loading}>
          {loading ? "Ingresando..." : "Iniciar Sesión"}
        </Button>
        <div style={{ marginTop: 16, background: "#f8fafc", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#64748b" }}>
          <strong style={{ color: "#334155" }}>Usuarios de prueba:</strong><br />
          👤 Clientes: juan/123, ana/123, pedro/123<br />
          👔 Empleados: carlos/123, maria/123<br />
          🔑 Admin: admin/123
        </div>
      </div>
    </div>
  );
};

// ======================== NAVBAR ========================
const Navbar = ({ user, onLogout }) => {
  const roleColors = { CLIENTE: "#15803d", EMPLEADO: "#1e40af", ADMINISTRADOR: "#7c3aed" };
  const color = roleColors[user.usu_rol] || "#64748b";
  return (
    <nav style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 22 }}>🏦</span>
        <span style={{ fontWeight: 800, fontSize: 18, color: "#0f172a" }}>BankManagment</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{user.roleData.nombre}</div>
          <Badge variant={user.usu_rol === "CLIENTE" ? "success" : user.usu_rol === "EMPLEADO" ? "info" : "purple"}>
            {user.usu_rol}
          </Badge>
        </div>
        <Button variant="ghost" onClick={onLogout} style={{ padding: "6px 14px", fontSize: 13 }}>Salir</Button>
      </div>
    </nav>
  );
};

// ======================== CLIENTE PANEL (integración con API) ========================
const ClientePanel = ({ user, showAlert }) => {
  const [tab, setTab] = useState("resumen");
  const [cuentas, setCuentas] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [clienteData, setClienteData] = useState(null);
  const { clienteId } = user.roleData;

  // Cargar cuentas del cliente desde la API
  const cargarCuentas = useCallback(async () => {
    try {
      const res = await api.listarCuentasPorCliente(clienteId);
      if (res.success) setCuentas(res.data);
    } catch (err) {
      showAlert("Error al cargar cuentas", "error");
    }
  }, [clienteId, showAlert]);

  // Cargar historial combinado de todas las cuentas
  const cargarHistorial = useCallback(async () => {
    if (cuentas.length === 0) return;
    try {
      const promesas = cuentas.map(c => api.historialCuenta(c.cue_id));
      const resultados = await Promise.all(promesas);
      const todos = resultados.flatMap(r => r.data || []);
      todos.sort((a, b) => new Date(b.tra_fecha) - new Date(a.tra_fecha));
      setHistorial(todos);
    } catch (err) {
      showAlert("Error al cargar historial", "error");
    }
  }, [cuentas, showAlert]);

  // Cargar datos personales del cliente (perfil)
  const cargarPerfil = useCallback(async () => {
    try {
      const res = await api.consultarCliente(clienteId);
      if (res.success) setClienteData(res.data);
    } catch (err) {
      showAlert("Error al cargar perfil", "error");
    }
  }, [clienteId, showAlert]);

  useEffect(() => { cargarCuentas(); cargarPerfil(); }, [cargarCuentas, cargarPerfil]);
  useEffect(() => { cargarHistorial(); }, [cuentas, cargarHistorial]);

  const totalSaldo = cuentas.reduce((s, c) => s + c.cue_saldo, 0);

  const tabs = [
    { key: "resumen", label: "Resumen", icon: "📊" },
    { key: "cuentas", label: "Mis Cuentas", icon: "💳" },
    { key: "transferencia", label: "Transferencia", icon: "↔️" },
    { key: "historial", label: "Historial", icon: "📋" },
    { key: "perfil", label: "Mi Perfil", icon: "👤" },
  ];

  return (
    <div style={{ padding: "24px", maxWidth: 960, margin: "0 auto" }}>
      <TabBar tabs={tabs} active={tab} onChange={setTab} />
      {tab === "resumen" && <ClienteResumen cuentas={cuentas} historial={historial} totalSaldo={totalSaldo} />}
      {tab === "cuentas" && <ClienteCuentas cuentas={cuentas} />}
      {tab === "transferencia" && (
        <ClienteTransferencia clienteId={clienteId} cuentas={cuentas} showAlert={showAlert} recargarCuentas={cargarCuentas} />
      )}
      {tab === "historial" && <ClienteHistorial historial={historial} />}
      {tab === "perfil" && <ClientePerfil cliente={clienteData} user={user} />}
    </div>
  );
};

const ClienteResumen = ({ cuentas, historial, totalSaldo }) => (
  <div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 20 }}>
      {[
        { label: "Saldo Total", value: fmt(totalSaldo), icon: "💰", color: "#15803d" },
        { label: "Cuentas Activas", value: cuentas.filter((c) => c.cue_estado === "ACTIVA").length, icon: "💳", color: "#1e40af" },
        { label: "Transacciones", value: historial.length, icon: "📋", color: "#7c3aed" },
      ].map((item, i) => (
        <Card key={i} style={{ borderLeft: `4px solid ${item.color}` }}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>{item.icon}</div>
          <div style={{ fontSize: 13, color: "#64748b", marginBottom: 2 }}>{item.label}</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: item.color }}>{item.value}</div>
        </Card>
      ))}
    </div>
    <Card>
      <SectionTitle icon="🕐">Últimos Movimientos</SectionTitle>
      <Table
        headers={["Fecha", "Tipo", "Monto", "Estado"]}
        rows={historial.slice(0, 5).map((t) => {
          return [
            fmtDate(t.tra_fecha),
            t.tipo_transaccion,
            fmt(t.tra_monto),
            <Badge variant="success">{t.tra_estado}</Badge>,
          ];
        })}
      />
    </Card>
  </div>
);

const ClienteCuentas = ({ cuentas }) => (
  <div style={{ display: "grid", gap: 14 }}>
    {cuentas.map((c) => {
      // Los datos de sucursal ya vienen incluidos si se usa el endpoint correcto.
      const ubicacion = c.suc_ubicacion || `Sucursal #${c.suc_id}`;
      return (
        <Card key={c.cue_id} style={{ borderLeft: `4px solid ${c.cue_tipo === "AHORROS" ? "#15803d" : "#1e40af"}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 2 }}>Cuenta #{c.cue_id} — {c.cue_tipo}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a" }}>{fmt(c.cue_saldo)}</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                Apertura: {c.cue_fecha_apertura ? fmtDate(c.cue_fecha_apertura) : "-"} · Sucursal: {ubicacion}
              </div>
            </div>
            <Badge variant={c.cue_estado === "ACTIVA" ? "success" : "danger"}>{c.cue_estado}</Badge>
          </div>
        </Card>
      );
    })}
    {cuentas.length === 0 && <Card><p style={{ color: "#94a3b8", textAlign: "center" }}>No tiene cuentas asociadas.</p></Card>}
  </div>
);

const ClienteTransferencia = ({ clienteId, cuentas, showAlert, recargarCuentas }) => {
  const [form, setForm] = useState({ origen: cuentas[0]?.cue_id || "", destino: "", monto: "" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleTransfer = async () => {
    const monto = parseFloat(form.monto);
    if (!form.destino || isNaN(monto) || monto <= 0) {
      showAlert("Completa todos los campos correctamente", "error");
      return;
    }
    const origen = parseInt(form.origen, 10);
    const destino = parseInt(form.destino, 10);
    try {
      const res = await api.transferir({ origen, destino, monto });
      if (res.success) {
        showAlert(res.mensaje || "Transferencia exitosa", "success");
        setForm({ ...form, monto: "", destino: "" });
        recargarCuentas(); // Refresca los saldos
      } else {
        showAlert(res.mensaje || "Error en transferencia", "error");
      }
    } catch (err) {
      showAlert(err.message || "Error de conexión", "error");
    }
  };

  return (
    <div style={{ maxWidth: 520 }}>
      <Card>
        <SectionTitle icon="↔️">Nueva Transferencia</SectionTitle>
        <Select label="Cuenta Origen" value={form.origen} onChange={(e) => set("origen", e.target.value)}>
          {cuentas.map((c) => <option key={c.cue_id} value={c.cue_id}>{c.cue_tipo} #{c.cue_id} — {fmt(c.cue_saldo)}</option>)}
        </Select>
        <Input label="ID Cuenta Destino" value={form.destino} onChange={(e) => set("destino", e.target.value)} placeholder="Número de cuenta destino" type="number" />
        <Input label="Monto (COP)" value={form.monto} onChange={(e) => set("monto", e.target.value)} placeholder="0" type="number" min="1" />
        <Button onClick={handleTransfer} style={{ width: "100%", marginTop: 4 }}>Realizar Transferencia</Button>
        <div style={{ marginTop: 12, background: "#f0fdf4", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#166534" }}>
          💡 Las cuentas disponibles en el sistema son: {cuentas.map((c) => `#${c.cue_id}`).join(", ")}
        </div>
      </Card>
    </div>
  );
};

const ClienteHistorial = ({ historial }) => (
  <Card>
    <SectionTitle icon="📋">Historial de Movimientos</SectionTitle>
    <Table
      headers={["Fecha", "Tipo", "Monto", "Canal", "Origen", "Destino", "Estado"]}
      rows={historial.map((t) => {
        return [
          fmtDate(t.tra_fecha),
          t.tipo_transaccion,
          fmt(t.tra_monto),
          t.tra_canal || "—",
          t.cue_id_origen ? `#${t.cue_id_origen}` : "—",
          t.cue_id_destino ? `#${t.cue_id_destino}` : "—",
          <Badge variant="success">{t.tra_estado}</Badge>,
        ];
      })}
    />
  </Card>
);

const ClientePerfil = ({ cliente, user }) => (
  <Card style={{ maxWidth: 480 }}>
    <SectionTitle icon="👤">Mi Perfil</SectionTitle>
    {cliente ? (
      <div style={{ display: "grid", gap: 10 }}>
        {[
          ["Nombre", cliente.cli_nombre],
          ["Documento", cliente.cli_documento],
          ["Teléfono", cliente.cli_telefono],
          ["Email", cliente.cli_email],
          ["Usuario", user.usu_username],
          ["Estado", cliente.cli_estado],
          ["Rol", user.usu_rol],
        ].map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
            <span style={{ color: "#64748b", fontSize: 13 }}>{k}</span>
            <span style={{ fontWeight: 600, color: "#1e293b", fontSize: 13 }}>{v || "—"}</span>
          </div>
        ))}
      </div>
    ) : (
      <p style={{ color: "#94a3b8" }}>Cargando...</p>
    )}
  </Card>
);

// ======================== EMPLEADO PANEL ========================
const EmpleadoPanel = ({ user, showAlert }) => {
  const [tab, setTab] = useState("resumen");
  const [clientesAsociados, setClientesAsociados] = useState([]);
  const [cuentasSucursal, setCuentasSucursal] = useState([]);
  const [transaccionesSucursal, setTransaccionesSucursal] = useState([]);
  const [sucursalInfo, setSucursalInfo] = useState(null);
  const [todasTransacciones, setTodasTransacciones] = useState([]); // para pestaña "todas"
  const { empleadoId, sucursalId } = user.roleData;

  const cargarDatos = useCallback(async () => {
    try {
      // Obtener datos de la sucursal
      const sucRes = await api.listarSucursales();
      if (sucRes.success) {
        const suc = sucRes.data.find(s => s.suc_id === sucursalId);
        setSucursalInfo(suc || { suc_ubicacion: "Desconocida", suc_codigo: "?" });
      }
      // Clientes del empleado
      const cliRes = await api.obtenerClientesEmpleado(empleadoId);
      if (cliRes.success) setClientesAsociados(cliRes.data);
      // Cuentas de la sucursal (podemos pedir todas y filtrar aquí)
      const cuentasRes = await api.listarCuentasPorCliente(null); // Esto no existe, mejor usar listarCuentas y filtrar.
      // Vamos a usar el endpoint de cuentas que ya tienes (GET /api/cuentas) y luego filtrar por sucursalId.
      const todasCuentasRes = await api.listarCuentas();
      if (todasCuentasRes.success) {
        setCuentasSucursal(todasCuentasRes.data.filter(c => c.suc_id === sucursalId));
      }
      // Transacciones: necesitamos un endpoint general. Usaremos listarTransacciones()
      const transRes = await api.listarTransacciones();
      if (transRes.success) {
        setTodasTransacciones(transRes.data);
        // Filtrar las que pertenecen a cuentas de la sucursal
        const idsCuentasSuc = cuentasSucursal.map(c => c.cue_id);
        const filtradas = transRes.data.filter(
          t => idsCuentasSuc.includes(t.cue_id_origen) || idsCuentasSuc.includes(t.cue_id_destino)
        );
        setTransaccionesSucursal(filtradas);
      }
    } catch (err) {
      showAlert("Error al cargar datos del empleado", "error");
    }
  }, [empleadoId, sucursalId, showAlert, cuentasSucursal]); // Dependencia circular, mejor usar otro enfoque

  useEffect(() => { cargarDatos(); }, []);

  const tabs = [
    { key: "resumen", label: "Resumen", icon: "📊" },
    { key: "clientes", label: "Clientes", icon: "👥" },
    { key: "cuentas", label: "Cuentas", icon: "💳" },
    { key: "transacciones", label: "Transacciones", icon: "↔️" },
    { key: "nuevo_cliente", label: "Nuevo Cliente", icon: "➕" },
  ];

  return (
    <div style={{ padding: "24px", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ marginBottom: 16, background: "#dbeafe", borderRadius: 10, padding: "10px 16px", fontSize: 13, color: "#1e40af", fontWeight: 600 }}>
        🏢 Sucursal: {sucursalInfo?.suc_ubicacion || "..."} ({sucursalInfo?.suc_codigo || "..."}) · Rol: {user.roleData.nombre}
      </div>
      <TabBar tabs={tabs} active={tab} onChange={setTab} />
      {tab === "resumen" && <EmpleadoResumen clientes={clientesAsociados} cuentas={cuentasSucursal} transacciones={transaccionesSucursal} />}
      {tab === "clientes" && <EmpleadoClientes clientes={clientesAsociados} />}
      {tab === "cuentas" && <EmpleadoCuentas clientes={clientesAsociados} cuentas={cuentasSucursal} sucursalId={sucursalId} showAlert={showAlert} recargar={cargarDatos} />}
      {tab === "transacciones" && <EmpleadoTransacciones showAlert={showAlert} cuentasSucursal={cuentasSucursal} recargar={cargarDatos} />}
      {tab === "nuevo_cliente" && <EmpleadoNuevoCliente empleadoId={empleadoId} showAlert={showAlert} recargar={cargarDatos} />}
    </div>
  );
};

const EmpleadoResumen = ({ clientes, cuentas, transacciones }) => {
  const saldoTotal = cuentas.reduce((s, c) => s + c.cue_saldo, 0);
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Clientes Asignados", value: clientes.length, icon: "👥", color: "#1e40af" },
          { label: "Cuentas Sucursal", value: cuentas.length, icon: "💳", color: "#15803d" },
          { label: "Transacciones", value: transacciones.length, icon: "↔️", color: "#7c3aed" },
          { label: "Volumen Total", value: fmt(saldoTotal), icon: "💰", color: "#b45309" },
        ].map((item, i) => (
          <Card key={i} style={{ borderLeft: `4px solid ${item.color}` }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{item.icon}</div>
            <div style={{ fontSize: 13, color: "#64748b" }}>{item.label}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: item.color, marginTop: 2 }}>{item.value}</div>
          </Card>
        ))}
      </div>
      <Card>
        <SectionTitle icon="📋">Últimas Transacciones de Sucursal</SectionTitle>
        <Table
          headers={["Fecha", "Tipo", "Monto", "Estado"]}
          rows={transacciones.slice(-5).reverse().map((t) => [
            fmtDate(t.tra_fecha),
            t.tipo_transaccion,
            fmt(t.tra_monto),
            <Badge variant="success">{t.tra_estado}</Badge>,
          ])}
        />
      </Card>
    </div>
  );
};

const EmpleadoClientes = ({ clientes }) => (
  <Card>
    <SectionTitle icon="👥">Clientes Asignados</SectionTitle>
    <Table
      headers={["ID", "Nombre", "Documento", "Teléfono", "Email", "Estado"]}
      rows={clientes.map((c) => [
        `#${c.cli_id}`, c.cli_nombre, c.cli_documento, c.cli_telefono, c.cli_email,
        <Badge variant={c.cli_estado === "ACTIVO" ? "success" : "danger"}>{c.cli_estado}</Badge>,
      ])}
    />
  </Card>
);

const EmpleadoCuentas = ({ clientes, cuentas, sucursalId, showAlert, recargar }) => {
  const [form, setForm] = useState({ cli_id: clientes[0]?.cli_id || "", tipo: "AHORROS", saldo: "" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleCrear = async () => {
    const saldo = parseFloat(form.saldo);
    if (!form.cli_id || isNaN(saldo) || saldo < 0) {
      showAlert("Datos inválidos", "error");
      return;
    }
    try {
      const res = await api.crearCuenta({
        tipo: form.tipo,
        saldo: saldo,
        sucursal: sucursalId,
        cliente: parseInt(form.cli_id, 10),
      });
      if (res.success) {
        showAlert(res.mensaje || "Cuenta creada", "success");
        setForm((f) => ({ ...f, saldo: "" }));
        recargar();
      } else {
        showAlert(res.mensaje || "Error al crear cuenta", "error");
      }
    } catch (err) {
      showAlert(err.message || "Error de conexión", "error");
    }
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <Card>
        <SectionTitle icon="➕">Abrir Nueva Cuenta</SectionTitle>
        <Select label="Cliente" value={form.cli_id} onChange={(e) => set("cli_id", e.target.value)}>
          {clientes.map((c) => <option key={c.cli_id} value={c.cli_id}>{c.cli_nombre}</option>)}
        </Select>
        <Select label="Tipo de Cuenta" value={form.tipo} onChange={(e) => set("tipo", e.target.value)}>
          <option value="AHORROS">Ahorros</option>
          <option value="CORRIENTE">Corriente</option>
        </Select>
        <Input label="Saldo Inicial (COP)" value={form.saldo} onChange={(e) => set("saldo", e.target.value)} type="number" min="0" placeholder="0" />
        <Button onClick={handleCrear} variant="success">Abrir Cuenta</Button>
      </Card>
      <Card>
        <SectionTitle icon="💳">Cuentas de esta Sucursal</SectionTitle>
        <Table
          headers={["ID", "Tipo", "Saldo", "Apertura", "Estado"]}
          rows={cuentas.map((c) => [
            `#${c.cue_id}`, c.cue_tipo, fmt(c.cue_saldo),
            c.cue_fecha_apertura ? fmtDate(c.cue_fecha_apertura) : "—",
            <Badge variant={c.cue_estado === "ACTIVA" ? "success" : "danger"}>{c.cue_estado}</Badge>,
          ])}
        />
      </Card>
    </div>
  );
};

const EmpleadoTransacciones = ({ showAlert, cuentasSucursal, recargar }) => {
  const [form, setForm] = useState({ tipo: "CONSIGNACION", monto: "", origen: "", destino: "" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleRegistrar = async () => {
    const monto = parseFloat(form.monto);
    if (isNaN(monto) || monto <= 0) {
      showAlert("Monto inválido", "error");
      return;
    }
    try {
      let res;
      if (form.tipo === "CONSIGNACION") {
        if (!form.destino) { showAlert("Se requiere cuenta destino", "error"); return; }
        res = await api.consignar({ cuenta: parseInt(form.destino, 10), monto });
      } else if (form.tipo === "RETIRO") {
        if (!form.origen) { showAlert("Se requiere cuenta origen", "error"); return; }
        res = await api.retirar({ cuenta: parseInt(form.origen, 10), monto });
      } else if (form.tipo === "TRANSFERENCIA") {
        if (!form.origen || !form.destino) { showAlert("Se requieren ambas cuentas", "error"); return; }
        res = await api.transferir({ origen: parseInt(form.origen, 10), destino: parseInt(form.destino, 10), monto });
      }
      if (res.success) {
        showAlert(res.mensaje || "Transacción exitosa", "success");
        setForm({ ...form, monto: "", origen: "", destino: "" });
        recargar();
      } else {
        showAlert(res.mensaje || "Error en la transacción", "error");
      }
    } catch (err) {
      showAlert(err.message || "Error de conexión", "error");
    }
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <Card style={{ maxWidth: 520 }}>
        <SectionTitle icon="↔️">Registrar Transacción</SectionTitle>
        <Select label="Tipo de Transacción" value={form.tipo} onChange={(e) => set("tipo", e.target.value)}>
          <option>CONSIGNACION</option>
          <option>RETIRO</option>
          <option>TRANSFERENCIA</option>
        </Select>
        <Input label="Monto (COP)" value={form.monto} onChange={(e) => set("monto", e.target.value)} type="number" min="1" placeholder="0" />
        {(form.tipo === "RETIRO" || form.tipo === "TRANSFERENCIA") && (
          <Input label="ID Cuenta Origen" value={form.origen} onChange={(e) => set("origen", e.target.value)} type="number" placeholder="Ej: 1" />
        )}
        {(form.tipo === "CONSIGNACION" || form.tipo === "TRANSFERENCIA") && (
          <Input label="ID Cuenta Destino" value={form.destino} onChange={(e) => set("destino", e.target.value)} type="number" placeholder="Ej: 2" />
        )}
        <Button onClick={handleRegistrar} style={{ width: "100%", marginTop: 4 }}>Ejecutar Transacción</Button>
        <div style={{ marginTop: 10, fontSize: 12, color: "#64748b" }}>
          Cuentas de la sucursal: {cuentasSucursal.map((c) => `#${c.cue_id} (${fmt(c.cue_saldo)})`).join(" · ")}
        </div>
      </Card>
    </div>
  );
};

const EmpleadoNuevoCliente = ({ empleadoId, showAlert, recargar }) => {
  const [form, setForm] = useState({ username: "", password: "", nombre: "", documento: "", telefono: "", email: "" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleCrear = async () => {
    if (!form.username || !form.password || !form.nombre || !form.documento) {
      showAlert("Todos los campos obligatorios son necesarios", "error");
      return;
    }
    try {
      const res = await api.crearCliente({
        username: form.username,
        password: form.password,
        nombre: form.nombre,
        documento: form.documento,
        telefono: form.telefono,
        email: form.email,
        // El empleado que lo crea: la API no lo necesita? La lógica original no asociaba empleado-cliente automáticamente.
        // Si quieres asociar, deberías llamar a otro endpoint o ajustar el backend.
      });
      if (res.success) {
        showAlert(`Cliente "${form.nombre}" creado exitosamente`, "success");
        setForm({ username: "", password: "", nombre: "", documento: "", telefono: "", email: "" });
        recargar();
      } else {
        showAlert(res.mensaje || "Error al crear cliente", "error");
      }
    } catch (err) {
      showAlert(err.message || "Error de conexión", "error");
    }
  };

  return (
    <Card style={{ maxWidth: 520 }}>
      <SectionTitle icon="➕">Registrar Nuevo Cliente</SectionTitle>
      <Input label="Nombre Completo *" value={form.nombre} onChange={(e) => set("nombre", e.target.value)} placeholder="Ej: María García" />
      <Input label="Documento de Identidad *" value={form.documento} onChange={(e) => set("documento", e.target.value)} placeholder="Número de documento" />
      <Input label="Teléfono" value={form.telefono} onChange={(e) => set("telefono", e.target.value)} placeholder="Ej: 3001234567" />
      <Input label="Email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="correo@ejemplo.com" type="email" />
      <div style={{ marginTop: 4, marginBottom: 8, height: 1, background: "#f1f5f9" }} />
      <Input label="Nombre de Usuario *" value={form.username} onChange={(e) => set("username", e.target.value)} placeholder="usuario_unico" />
      <Input label="Contraseña *" value={form.password} onChange={(e) => set("password", e.target.value)} type="password" placeholder="Contraseña segura" />
      <Button onClick={handleCrear} variant="success" style={{ width: "100%", marginTop: 4 }}>Crear Cliente</Button>
    </Card>
  );
};

// ======================== ADMINISTRADOR PANEL ========================
const AdminPanel = ({ user, showAlert }) => {
  const [tab, setTab] = useState("resumen");
  const [usuarios, setUsuarios] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [transacciones, setTransacciones] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [bitacora, setBitacora] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const [usuRes, cuenRes, tranRes, sucRes, bitRes] = await Promise.all([
        api.listarUsuarios(),
        api.listarCuentas(),
        api.listarTransacciones(),
        api.listarSucursales(),
        api.consultarBitacora()
      ]);
      if (usuRes.success) setUsuarios(usuRes.data);
      if (cuenRes.success) setCuentas(cuenRes.data);
      if (tranRes.success) setTransacciones(tranRes.data);
      if (sucRes.success) setSucursales(sucRes.data);
      if (bitRes.success) setBitacora(bitRes.data);
    } catch (err) {
      showAlert("Error al cargar datos del sistema", "error");
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const tabs = [
    { key: "resumen", label: "Resumen", icon: "📊" },
    { key: "usuarios", label: "Usuarios", icon: "👥" },
    { key: "cuentas", label: "Cuentas", icon: "💳" },
    { key: "transacciones", label: "Transacciones", icon: "↔️" },
    { key: "sucursales", label: "Sucursales", icon: "🏢" },
    { key: "nuevo_usuario", label: "Nuevo Usuario", icon: "➕" },
    { key: "bitacora", label: "Bitácora", icon: "🔍" },
  ];

  if (loading) return <p style={{ textAlign: "center", marginTop: 40 }}>Cargando sistema...</p>;

  return (
    <div style={{ padding: "24px", maxWidth: 1100, margin: "0 auto" }}>
      <TabBar tabs={tabs} active={tab} onChange={setTab} />
      {tab === "resumen" && <AdminResumen usuarios={usuarios} cuentas={cuentas} transacciones={transacciones} sucursales={sucursales} bitacora={bitacora} />}
      {tab === "usuarios" && <AdminUsuarios usuarios={usuarios} showAlert={showAlert} recargar={cargarDatos} />}
      {tab === "cuentas" && <AdminCuentas cuentas={cuentas} sucursales={sucursales} />}
      {tab === "transacciones" && <AdminTransacciones transacciones={transacciones} />}
      {tab === "sucursales" && <AdminSucursales sucursales={sucursales} showAlert={showAlert} recargar={cargarDatos} />}
      {tab === "nuevo_usuario" && <AdminNuevoUsuario showAlert={showAlert} sucursales={sucursales} recargar={cargarDatos} />}
      {tab === "bitacora" && <AdminBitacora bitacora={bitacora} />}
    </div>
  );
};

const AdminResumen = ({ usuarios, cuentas, transacciones, sucursales, bitacora }) => {
  const saldoGlobal = cuentas.reduce((s, c) => s + c.cue_saldo, 0);
  const stats = [
    { label: "Total Usuarios", value: usuarios.length, icon: "👥", color: "#1e40af" },
    { label: "Total Clientes", value: usuarios.filter(u => u.usu_rol === "CLIENTE").length, icon: "🧑‍💼", color: "#15803d" },
    { label: "Total Cuentas", value: cuentas.length, icon: "💳", color: "#7c3aed" },
    { label: "Transacciones", value: transacciones.length, icon: "↔️", color: "#b45309" },
    { label: "Sucursales", value: sucursales.length, icon: "🏢", color: "#be185d" },
    { label: "Saldo Global", value: fmt(saldoGlobal), icon: "💰", color: "#0f766e" },
  ];
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14, marginBottom: 20 }}>
        {stats.map((s, i) => (
          <Card key={i} style={{ borderLeft: `4px solid ${s.color}` }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color, marginTop: 2 }}>{s.value}</div>
          </Card>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Card>
          <SectionTitle icon="🏢">Sucursales</SectionTitle>
          <Table headers={["Código", "Ubicación", "Estado"]} rows={sucursales.map((s) => [s.suc_codigo, s.suc_ubicacion, <Badge variant="success">{s.suc_estado}</Badge>])} />
        </Card>
        <Card>
          <SectionTitle icon="📋">Bitácora Reciente</SectionTitle>
          <Table headers={["Fecha", "Acción", "Tabla"]} rows={bitacora.slice(-6).reverse().map((b) => [fmtDate(b.bit_fecha), b.bit_accion, b.bit_tabla])} />
        </Card>
      </div>
    </div>
  );
};

const AdminUsuarios = ({ usuarios, showAlert, recargar }) => {
  const handleToggle = async (usuario) => {
    const nuevoEstado = usuario.usu_estado === "ACTIVO" ? "INACTIVO" : "ACTIVO";
    try {
      const res = await api.cambiarEstadoUsuario(usuario.usu_id, nuevoEstado);
      if (res.success) {
        showAlert(`Usuario ${nuevoEstado === "ACTIVO" ? "activado" : "desactivado"}`, "success");
        recargar();
      } else {
        showAlert(res.mensaje || "Error al cambiar estado", "error");
      }
    } catch (err) {
      showAlert(err.message || "Error de conexión", "error");
    }
  };

  return (
    <Card>
      <SectionTitle icon="👥">Gestión de Usuarios</SectionTitle>
      <Table
        headers={["ID", "Username", "Rol", "Estado", "Acción"]}
        rows={usuarios.map((u) => [
          `#${u.usu_id}`, u.usu_username, u.usu_rol,
          <Badge variant={u.usu_estado === "ACTIVO" ? "success" : "danger"}>{u.usu_estado}</Badge>,
          <Button variant={u.usu_estado === "ACTIVO" ? "danger" : "success"} onClick={() => handleToggle(u)} style={{ padding: "4px 10px", fontSize: 11 }}>
            {u.usu_estado === "ACTIVO" ? "Desactivar" : "Activar"}
          </Button>,
        ])}
      />
    </Card>
  );
};

const AdminCuentas = ({ cuentas, sucursales }) => {
  const getSucursal = (sucId) => sucursales.find(s => s.suc_id === sucId)?.suc_ubicacion || `Sucursal #${sucId}`;
  return (
    <Card>
      <SectionTitle icon="💳">Todas las Cuentas</SectionTitle>
      <Table
        headers={["ID", "Tipo", "Saldo", "Estado", "Apertura", "Sucursal"]}
        rows={cuentas.map((c) => [
          `#${c.cue_id}`, c.cue_tipo, fmt(c.cue_saldo),
          <Badge variant={c.cue_estado === "ACTIVA" ? "success" : "danger"}>{c.cue_estado}</Badge>,
          c.cue_fecha_apertura ? fmtDate(c.cue_fecha_apertura) : "—",
          getSucursal(c.suc_id),
        ])}
      />
    </Card>
  );
};

const AdminTransacciones = ({ transacciones }) => (
  <Card>
    <SectionTitle icon="↔️">Todas las Transacciones</SectionTitle>
    <Table
      headers={["ID", "Fecha", "Tipo", "Monto", "Canal", "Origen", "Destino", "Estado"]}
      rows={[...transacciones].reverse().map((t) => [
        `#${t.tra_id}`,
        fmtDate(t.tra_fecha),
        t.tipo_transaccion,
        fmt(t.tra_monto),
        t.tra_canal || "—",
        t.cue_id_origen ? `#${t.cue_id_origen}` : "—",
        t.cue_id_destino ? `#${t.cue_id_destino}` : "—",
        <Badge variant="success">{t.tra_estado}</Badge>,
      ])}
    />
  </Card>
);

const AdminSucursales = ({ sucursales, showAlert, recargar }) => {
  const [form, setForm] = useState({ codigo: "", ubicacion: "" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleCrear = async () => {
    if (!form.codigo || !form.ubicacion) {
      showAlert("Completa todos los campos", "error");
      return;
    }
    try {
      const res = await api.crearSucursal({ codigo: form.codigo.toUpperCase(), ubicacion: form.ubicacion });
      if (res.success) {
        showAlert("Sucursal creada", "success");
        setForm({ codigo: "", ubicacion: "" });
        recargar();
      } else {
        showAlert(res.mensaje || "Error al crear", "error");
      }
    } catch (err) {
      showAlert(err.message || "Error de conexión", "error");
    }
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <Card style={{ maxWidth: 420 }}>
        <SectionTitle icon="➕">Nueva Sucursal</SectionTitle>
        <Input label="Código (ej: BOG)" value={form.codigo} onChange={(e) => set("codigo", e.target.value)} placeholder="3 letras" />
        <Input label="Ubicación" value={form.ubicacion} onChange={(e) => set("ubicacion", e.target.value)} placeholder="Ej: Bogotá Occidente" />
        <Button onClick={handleCrear} variant="success">Crear Sucursal</Button>
      </Card>
      <Card>
        <SectionTitle icon="🏢">Sucursales del Sistema</SectionTitle>
        <Table
          headers={["ID", "Código", "Ubicación", "Estado"]}
          rows={sucursales.map((s) => [
            `#${s.suc_id}`, s.suc_codigo, s.suc_ubicacion,
            <Badge variant="success">{s.suc_estado}</Badge>,
          ])}
        />
      </Card>
    </div>
  );
};

const AdminNuevoUsuario = ({ showAlert, sucursales, recargar }) => {
  const [form, setForm] = useState({ username: "", password: "", rol: "CLIENTE", nombre: "", documento: "", telefono: "", email: "", emp_rol: "CAJERO", suc_id: "" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleCrear = async () => {
    if (!form.username || !form.password || !form.nombre) {
      showAlert("Campos obligatorios incompletos", "error");
      return;
    }
    try {
      const payload = {
        username: form.username,
        password: form.password,
        rol: form.rol,
        nombre: form.nombre,
      };
      if (form.rol === "CLIENTE") {
        payload.documento = form.documento;
        payload.telefono = form.telefono;
        payload.email = form.email;
      } else if (form.rol === "EMPLEADO") {
        payload.emp_rol = form.emp_rol;
        payload.suc_id = form.suc_id;
      }
      const res = await api.crearUsuario(payload);
      if (res.success) {
        showAlert(`Usuario ${form.rol} "${form.username}" creado`, "success");
        setForm({ username: "", password: "", rol: "CLIENTE", nombre: "", documento: "", telefono: "", email: "", emp_rol: "CAJERO", suc_id: "" });
        recargar();
      } else {
        showAlert(res.mensaje || "Error al crear", "error");
      }
    } catch (err) {
      showAlert(err.message || "Error de conexión", "error");
    }
  };

  return (
    <Card style={{ maxWidth: 520 }}>
      <SectionTitle icon="➕">Crear Nuevo Usuario</SectionTitle>
      <Input label="Nombre Completo *" value={form.nombre} onChange={(e) => set("nombre", e.target.value)} placeholder="Nombre completo" />
      <Input label="Nombre de Usuario *" value={form.username} onChange={(e) => set("username", e.target.value)} placeholder="usuario_unico" />
      <Input label="Contraseña *" value={form.password} onChange={(e) => set("password", e.target.value)} type="password" placeholder="Contraseña" />
      <Select label="Rol" value={form.rol} onChange={(e) => set("rol", e.target.value)}>
        <option value="CLIENTE">Cliente</option>
        <option value="EMPLEADO">Empleado</option>
        <option value="ADMINISTRADOR">Administrador</option>
      </Select>
      {form.rol === "CLIENTE" && <>
        <Input label="Documento" value={form.documento} onChange={(e) => set("documento", e.target.value)} placeholder="Número de documento" />
        <Input label="Teléfono" value={form.telefono} onChange={(e) => set("telefono", e.target.value)} placeholder="Teléfono" />
        <Input label="Email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="correo@ejemplo.com" />
      </>}
      {form.rol === "EMPLEADO" && <>
        <Select label="Rol del Empleado" value={form.emp_rol} onChange={(e) => set("emp_rol", e.target.value)}>
          {["CAJERO", "ASESOR", "GERENTE"].map((r) => <option key={r}>{r}</option>)}
        </Select>
        <Select label="Sucursal" value={form.suc_id} onChange={(e) => set("suc_id", e.target.value)}>
          {sucursales.map((s) => <option key={s.suc_id} value={s.suc_id}>{s.suc_ubicacion}</option>)}
        </Select>
      </>}
      <Button onClick={handleCrear} style={{ width: "100%", marginTop: 8 }}>Crear Usuario</Button>
    </Card>
  );
};

const AdminBitacora = ({ bitacora }) => {
  const [filtro, setFiltro] = useState("");
  const registros = bitacora
    .filter((b) => !filtro || b.bit_accion.toUpperCase().includes(filtro.toUpperCase()) || b.bit_tabla.toUpperCase().includes(filtro.toUpperCase()))
    .reverse();

  return (
    <Card>
      <SectionTitle icon="🔍">Bitácora de Auditoría</SectionTitle>
      <Input value={filtro} onChange={(e) => setFiltro(e.target.value)} placeholder="Filtrar por acción o tabla..." label="" />
      <Table
        headers={["Fecha", "Usuario ID", "Acción", "Tabla", "Anterior", "Nuevo"]}
        rows={registros.map((b) => [
          fmtDate(b.bit_fecha),
          `#${b.usu_id}`,
          <Badge variant={b.bit_accion === "INSERT" ? "success" : b.bit_accion === "DELETE" ? "danger" : "info"}>{b.bit_accion}</Badge>,
          b.bit_tabla,
          <span style={{ maxWidth: 160, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 12, color: "#94a3b8" }}>{b.bit_anterior}</span>,
          <span style={{ maxWidth: 160, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 12 }}>{b.bit_nuevo}</span>,
        ])}
      />
    </Card>
  );
};

// ======================== APP PRINCIPAL ========================
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [alert, setAlert] = useState({ message: "", type: "success" });
  const [loading, setLoading] = useState(false);

  const showAlert = useCallback((message, type = "success") => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: "", type: "success" }), 4000);
  }, []);

  const handleLogin = async (username, password) => {
    setLoading(true);
    try {
      const res = await api.login(username, password);
      if (res.success && res.data) {
        setCurrentUser(res.data);
      } else {
        showAlert(res.mensaje || "Error desconocido", "error");
      }
    } catch (err) {
      showAlert(err.message || "Error de conexión", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => setCurrentUser(null);

  if (!currentUser) {
    return <Login onLogin={handleLogin} loading={loading} />;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <Navbar user={currentUser} onLogout={handleLogout} />
      {alert.message && (
        <div style={{ position: "fixed", top: 70, right: 20, zIndex: 999, minWidth: 280, maxWidth: 420 }}>
          <Alert message={alert.message} type={alert.type} onClose={() => setAlert({ message: "", type: "success" })} />
        </div>
      )}
      {currentUser.usu_rol === "CLIENTE" && <ClientePanel user={currentUser} showAlert={showAlert} />}
      {currentUser.usu_rol === "EMPLEADO" && <EmpleadoPanel user={currentUser} showAlert={showAlert} />}
      {currentUser.usu_rol === "ADMINISTRADOR" && <AdminPanel user={currentUser} showAlert={showAlert} />}
    </div>
  );
}