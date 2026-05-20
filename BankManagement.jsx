import { useState, useEffect, useCallback } from "react";

// ========================
// BASE DE DATOS SIMULADA
// ========================
const initDB = () => ({
  usuarios: [
    { usu_id: 1, usu_username: "juan", usu_password: "123", usu_rol: "CLIENTE", usu_estado: "ACTIVO" },
    { usu_id: 2, usu_username: "ana", usu_password: "123", usu_rol: "CLIENTE", usu_estado: "ACTIVO" },
    { usu_id: 3, usu_username: "pedro", usu_password: "123", usu_rol: "CLIENTE", usu_estado: "ACTIVO" },
    { usu_id: 4, usu_username: "laura", usu_password: "123", usu_rol: "CLIENTE", usu_estado: "ACTIVO" },
    { usu_id: 5, usu_username: "carlos", usu_password: "123", usu_rol: "EMPLEADO", usu_estado: "ACTIVO" },
    { usu_id: 6, usu_username: "maria", usu_password: "123", usu_rol: "EMPLEADO", usu_estado: "ACTIVO" },
    { usu_id: 7, usu_username: "andres", usu_password: "123", usu_rol: "EMPLEADO", usu_estado: "ACTIVO" },
    { usu_id: 8, usu_username: "sofia", usu_password: "123", usu_rol: "EMPLEADO", usu_estado: "ACTIVO" },
    { usu_id: 9, usu_username: "admin", usu_password: "123", usu_rol: "ADMINISTRADOR", usu_estado: "ACTIVO" },
  ],
  clientes: [
    { cli_id: 1, usu_id: 1, cli_nombre: "Juan Pérez", cli_documento: "1001001", cli_telefono: "3001234567", cli_email: "juan@mail.com", cli_estado: "ACTIVO" },
    { cli_id: 2, usu_id: 2, cli_nombre: "Ana Ruiz", cli_documento: "1002002", cli_telefono: "3002345678", cli_email: "ana@mail.com", cli_estado: "ACTIVO" },
    { cli_id: 3, usu_id: 3, cli_nombre: "Pedro Gómez", cli_documento: "1003003", cli_telefono: "3003456789", cli_email: "pedro@mail.com", cli_estado: "ACTIVO" },
    { cli_id: 4, usu_id: 4, cli_nombre: "Laura Díaz", cli_documento: "1004004", cli_telefono: "3004567890", cli_email: "laura@mail.com", cli_estado: "ACTIVO" },
  ],
  empleados: [
    { emp_id: 1, usu_id: 5, emp_nombre: "Carlos López", emp_rol: "CAJERO", suc_id: 1 },
    { emp_id: 2, usu_id: 6, emp_nombre: "María Torres", emp_rol: "ASESOR", suc_id: 2 },
    { emp_id: 3, usu_id: 7, emp_nombre: "Andrés Díaz", emp_rol: "CAJERO", suc_id: 3 },
    { emp_id: 4, usu_id: 8, emp_nombre: "Sofía Pérez", emp_rol: "GERENTE", suc_id: 4 },
  ],
  administradores: [
    { adm_id: 1, usu_id: 9, adm_nombre: "Admin General" },
  ],
  sucursales: [
    { suc_id: 1, suc_codigo: "CEN", suc_ubicacion: "Bogotá Centro", suc_estado: "ACTIVA" },
    { suc_id: 2, suc_codigo: "NOR", suc_ubicacion: "Bogotá Norte", suc_estado: "ACTIVA" },
    { suc_id: 3, suc_codigo: "SUR", suc_ubicacion: "Cali Sur", suc_estado: "ACTIVA" },
    { suc_id: 4, suc_codigo: "MED", suc_ubicacion: "Medellín", suc_estado: "ACTIVA" },
  ],
  cuentas: [
    { cue_id: 1, cue_tipo: "AHORROS", cue_saldo: 500000, cue_estado: "ACTIVA", cue_fecha_apertura: "2024-01-15", suc_id: 1 },
    { cue_id: 2, cue_tipo: "CORRIENTE", cue_saldo: 300000, cue_estado: "ACTIVA", cue_fecha_apertura: "2024-03-15", suc_id: 2 },
    { cue_id: 3, cue_tipo: "AHORROS", cue_saldo: 700000, cue_estado: "ACTIVA", cue_fecha_apertura: "2024-06-20", suc_id: 3 },
    { cue_id: 4, cue_tipo: "CORRIENTE", cue_saldo: 900000, cue_estado: "ACTIVA", cue_fecha_apertura: "2025-01-05", suc_id: 4 },
  ],
  tipoTransaccion: [
    { trr_id: 1, trr_nombre: "RETIRO" },
    { trr_id: 2, trr_nombre: "CONSIGNACION" },
    { trr_id: 3, trr_nombre: "TRANSFERENCIA" },
  ],
  transacciones: [
    { tra_id: 1, trr_id: 1, tra_monto: 50000, tra_fecha: new Date(Date.now() - 86400000).toISOString(), tra_estado: "EXITOSA", tra_canal: "CAJERO", cue_id_origen: 1, cue_id_destino: null },
    { tra_id: 2, trr_id: 2, tra_monto: 100000, tra_fecha: new Date(Date.now() - 172800000).toISOString(), tra_estado: "EXITOSA", tra_canal: "APP", cue_id_origen: null, cue_id_destino: 2 },
    { tra_id: 3, trr_id: 3, tra_monto: 70000, tra_fecha: new Date(Date.now() - 259200000).toISOString(), tra_estado: "EXITOSA", tra_canal: "WEB", cue_id_origen: 3, cue_id_destino: 4 },
  ],
  bitacora: [
    { bit_id: 1, usu_id: 9, bit_accion: "INSERT", bit_tabla: "CUENTA", bit_anterior: "-", bit_nuevo: "Cuenta inicial creada", bit_fecha: new Date().toISOString() },
  ],
  cliente_cuenta: [
    { cli_id: 1, cue_id: 1 },
    { cli_id: 2, cue_id: 2 },
    { cli_id: 3, cue_id: 3 },
    { cli_id: 4, cue_id: 4 },
  ],
  empleado_cliente: [
    { emp_id: 1, cli_id: 1 },
    { emp_id: 2, cli_id: 2 },
    { emp_id: 3, cli_id: 3 },
    { emp_id: 4, cli_id: 4 },
  ],
  empleado_sucursal: [
    { emp_id: 1, suc_id: 1 },
    { emp_id: 2, suc_id: 2 },
    { emp_id: 3, suc_id: 3 },
    { emp_id: 4, suc_id: 4 },
  ],
});

// ========================
// UTILITIES
// ========================
const fmt = (n) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);
const fmtDate = (d) => new Date(d).toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" });

const nextId = (arr, key) => arr.length === 0 ? 1 : Math.max(...arr.map((i) => i[key])) + 1;

// ========================
// COMPONENTS
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

// ========================
// LOGIN
// ========================
const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (db) => {
    const user = db.usuarios.find((u) => u.usu_username === username && u.usu_password === password && u.usu_estado === "ACTIVO");
    if (!user) { setError("Credenciales inválidas o usuario inactivo"); return; }
    let roleData = {};
    if (user.usu_rol === "CLIENTE") {
      const c = db.clientes.find((c) => c.usu_id === user.usu_id);
      roleData = { clienteId: c.cli_id, nombre: c.cli_nombre };
    } else if (user.usu_rol === "EMPLEADO") {
      const e = db.empleados.find((e) => e.usu_id === user.usu_id);
      roleData = { empleadoId: e.emp_id, nombre: e.emp_nombre, sucursalId: e.suc_id };
    } else {
      const a = db.administradores.find((a) => a.usu_id === user.usu_id);
      roleData = { adminId: a.adm_id, nombre: a.adm_nombre };
    }
    onLogin({ ...user, roleData });
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #1e40af 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "2.5rem", width: 380, boxShadow: "0 25px 50px rgba(0,0,0,0.4)" }}>
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div style={{ width: 60, height: 60, background: "#1e40af", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 28 }}>🏦</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>BankSystem</h1>
          <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>Sistema de Gestión Bancaria</p>
        </div>
        {error && <Alert message={error} type="error" onClose={() => setError("")} />}
        <Input label="Usuario" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Ej: juan, carlos, admin" />
        <Input label="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" />
        <Button onClick={() => handleLogin(window.__db)} style={{ width: "100%", marginTop: 8, padding: "11px" }}>
          Iniciar Sesión
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

// ========================
// NAVBAR
// ========================
const Navbar = ({ user, onLogout }) => {
  const roleColors = { CLIENTE: "#15803d", EMPLEADO: "#1e40af", ADMINISTRADOR: "#7c3aed" };
  const color = roleColors[user.usu_rol] || "#64748b";
  return (
    <nav style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 22 }}>🏦</span>
        <span style={{ fontWeight: 800, fontSize: 18, color: "#0f172a" }}>BankSystem</span>
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

// ========================
// CLIENTE PANEL
// ========================
const ClientePanel = ({ user, db, setDb, showAlert }) => {
  const [tab, setTab] = useState("resumen");
  const { clienteId } = user.roleData;

  const myCuentas = db.cliente_cuenta.filter((cc) => cc.cli_id === clienteId).map((cc) => db.cuentas.find((c) => c.cue_id === cc.cue_id)).filter(Boolean);
  const myIds = myCuentas.map((c) => c.cue_id);
  const myTrans = db.transacciones
    .filter((t) => myIds.includes(t.cue_id_origen) || myIds.includes(t.cue_id_destino))
    .sort((a, b) => new Date(b.tra_fecha) - new Date(a.tra_fecha));

  const totalSaldo = myCuentas.reduce((s, c) => s + c.cue_saldo, 0);

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
      {tab === "resumen" && <ClienteResumen cuentas={myCuentas} transacciones={myTrans} totalSaldo={totalSaldo} db={db} />}
      {tab === "cuentas" && <ClienteCuentas cuentas={myCuentas} db={db} />}
      {tab === "transferencia" && <ClienteTransferencia clienteId={clienteId} user={user} cuentas={myCuentas} db={db} setDb={setDb} showAlert={showAlert} />}
      {tab === "historial" && <ClienteHistorial transacciones={myTrans} db={db} />}
      {tab === "perfil" && <ClientePerfil cliente={db.clientes.find((c) => c.cli_id === clienteId)} user={user} />}
    </div>
  );
};

const ClienteResumen = ({ cuentas, transacciones, totalSaldo, db }) => (
  <div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 20 }}>
      {[
        { label: "Saldo Total", value: fmt(totalSaldo), icon: "💰", color: "#15803d" },
        { label: "Cuentas Activas", value: cuentas.filter((c) => c.cue_estado === "ACTIVA").length, icon: "💳", color: "#1e40af" },
        { label: "Transacciones", value: transacciones.length, icon: "📋", color: "#7c3aed" },
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
        rows={transacciones.slice(0, 5).map((t) => {
          const tipo = db.tipoTransaccion.find((tt) => tt.trr_id === t.trr_id);
          return [fmtDate(t.tra_fecha), tipo?.trr_nombre, fmt(t.tra_monto), <Badge variant="success">{t.tra_estado}</Badge>];
        })}
      />
    </Card>
  </div>
);

const ClienteCuentas = ({ cuentas, db }) => (
  <div style={{ display: "grid", gap: 14 }}>
    {cuentas.map((c) => {
      const suc = db.sucursales.find((s) => s.suc_id === c.suc_id);
      return (
        <Card key={c.cue_id} style={{ borderLeft: `4px solid ${c.cue_tipo === "AHORROS" ? "#15803d" : "#1e40af"}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 2 }}>Cuenta #{c.cue_id} — {c.cue_tipo}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a" }}>{fmt(c.cue_saldo)}</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                Apertura: {c.cue_fecha_apertura} · Sucursal: {suc?.suc_ubicacion || "-"}
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

const ClienteTransferencia = ({ clienteId, user, cuentas, db, setDb, showAlert }) => {
  const [form, setForm] = useState({ origen: cuentas[0]?.cue_id || "", destino: "", monto: "", canal: "WEB" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleTransfer = () => {
    const monto = parseFloat(form.monto);
    if (!form.destino || isNaN(monto) || monto <= 0) { showAlert("Completa todos los campos correctamente", "error"); return; }
    const origen = db.cuentas.find((c) => c.cue_id === parseInt(form.origen));
    const destino = db.cuentas.find((c) => c.cue_id === parseInt(form.destino));
    if (!destino) { showAlert("La cuenta destino no existe", "error"); return; }
    if (origen.cue_id === destino.cue_id) { showAlert("Origen y destino no pueden ser iguales", "error"); return; }
    if (origen.cue_saldo < monto) { showAlert("Saldo insuficiente en cuenta origen", "error"); return; }
    const pertenece = db.cliente_cuenta.some((cc) => cc.cli_id === clienteId && cc.cue_id === origen.cue_id);
    if (!pertenece) { showAlert("La cuenta origen no le pertenece", "error"); return; }

    setDb((prev) => {
      const newDB = { ...prev, cuentas: prev.cuentas.map((c) => c.cue_id === origen.cue_id ? { ...c, cue_saldo: c.cue_saldo - monto } : c.cue_id === destino.cue_id ? { ...c, cue_saldo: c.cue_saldo + monto } : c) };
      const tra = { tra_id: nextId(newDB.transacciones, "tra_id"), trr_id: 3, tra_monto: monto, tra_fecha: new Date().toISOString(), tra_estado: "EXITOSA", tra_canal: form.canal, cue_id_origen: origen.cue_id, cue_id_destino: destino.cue_id };
      const bit = { bit_id: nextId(newDB.bitacora, "bit_id"), usu_id: user.usu_id, bit_accion: "TRANSFERENCIA", bit_tabla: "TRANSACCION", bit_anterior: `Saldo origen: ${origen.cue_saldo}`, bit_nuevo: `Saldo nuevo: ${origen.cue_saldo - monto}`, bit_fecha: new Date().toISOString() };
      return { ...newDB, transacciones: [...newDB.transacciones, tra], bitacora: [...newDB.bitacora, bit] };
    });
    showAlert(`Transferencia de ${fmt(monto)} realizada con éxito`, "success");
    setForm((f) => ({ ...f, monto: "", destino: "" }));
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
        <Select label="Canal" value={form.canal} onChange={(e) => set("canal", e.target.value)}>
          {["WEB", "APP", "CAJERO"].map((c) => <option key={c}>{c}</option>)}
        </Select>
        <Button onClick={handleTransfer} style={{ width: "100%", marginTop: 4 }}>Realizar Transferencia</Button>
        <div style={{ marginTop: 12, background: "#f0fdf4", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#166534" }}>
          💡 Las cuentas disponibles en el sistema son: {db.cuentas.map((c) => `#${c.cue_id}`).join(", ")}
        </div>
      </Card>
    </div>
  );
};

const ClienteHistorial = ({ transacciones, db }) => (
  <Card>
    <SectionTitle icon="📋">Historial de Movimientos</SectionTitle>
    <Table
      headers={["Fecha", "Tipo", "Monto", "Canal", "Origen", "Destino", "Estado"]}
      rows={transacciones.map((t) => {
        const tipo = db.tipoTransaccion.find((tt) => tt.trr_id === t.trr_id);
        return [
          fmtDate(t.tra_fecha),
          tipo?.trr_nombre,
          fmt(t.tra_monto),
          t.tra_canal,
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
    <div style={{ display: "grid", gap: 10 }}>
      {[
        ["Nombre", cliente?.cli_nombre],
        ["Documento", cliente?.cli_documento],
        ["Teléfono", cliente?.cli_telefono],
        ["Email", cliente?.cli_email],
        ["Usuario", user.usu_username],
        ["Estado", cliente?.cli_estado],
        ["Rol", user.usu_rol],
      ].map(([k, v]) => (
        <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
          <span style={{ color: "#64748b", fontSize: 13 }}>{k}</span>
          <span style={{ fontWeight: 600, color: "#1e293b", fontSize: 13 }}>{v || "—"}</span>
        </div>
      ))}
    </div>
  </Card>
);

// ========================
// EMPLEADO PANEL
// ========================
const EmpleadoPanel = ({ user, db, setDb, showAlert }) => {
  const [tab, setTab] = useState("resumen");
  const { empleadoId, sucursalId } = user.roleData;
  const clientesAsociados = db.empleado_cliente.filter((ec) => ec.emp_id === empleadoId).map((ec) => db.clientes.find((c) => c.cli_id === ec.cli_id)).filter(Boolean);
  const sucursal = db.sucursales.find((s) => s.suc_id === sucursalId);

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
        🏢 Sucursal: {sucursal?.suc_ubicacion} ({sucursal?.suc_codigo}) · Rol: {user.roleData.nombre} ({db.empleados.find(e=>e.emp_id===empleadoId)?.emp_rol})
      </div>
      <TabBar tabs={tabs} active={tab} onChange={setTab} />
      {tab === "resumen" && <EmpleadoResumen clientesAsociados={clientesAsociados} db={db} sucursalId={sucursalId} />}
      {tab === "clientes" && <EmpleadoClientes clientesAsociados={clientesAsociados} db={db} />}
      {tab === "cuentas" && <EmpleadoCuentas clientesAsociados={clientesAsociados} db={db} sucursalId={sucursalId} user={user} setDb={setDb} showAlert={showAlert} />}
      {tab === "transacciones" && <EmpleadoTransacciones user={user} db={db} setDb={setDb} showAlert={showAlert} />}
      {tab === "nuevo_cliente" && <EmpleadoNuevoCliente empleadoId={empleadoId} user={user} db={db} setDb={setDb} showAlert={showAlert} />}
    </div>
  );
};

const EmpleadoResumen = ({ clientesAsociados, db, sucursalId }) => {
  const cuentasSuc = db.cuentas.filter((c) => c.suc_id === sucursalId);
  const transSuc = db.transacciones.filter((t) => cuentasSuc.map((c) => c.cue_id).includes(t.cue_id_origen) || cuentasSuc.map((c) => c.cue_id).includes(t.cue_id_destino));
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Clientes Asignados", value: clientesAsociados.length, icon: "👥", color: "#1e40af" },
          { label: "Cuentas Sucursal", value: cuentasSuc.length, icon: "💳", color: "#15803d" },
          { label: "Transacciones", value: transSuc.length, icon: "↔️", color: "#7c3aed" },
          { label: "Volumen Total", value: fmt(cuentasSuc.reduce((s, c) => s + c.cue_saldo, 0)), icon: "💰", color: "#b45309" },
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
          rows={transSuc.slice(-5).reverse().map((t) => {
            const tipo = db.tipoTransaccion.find((tt) => tt.trr_id === t.trr_id);
            return [fmtDate(t.tra_fecha), tipo?.trr_nombre, fmt(t.tra_monto), <Badge variant="success">{t.tra_estado}</Badge>];
          })}
        />
      </Card>
    </div>
  );
};

const EmpleadoClientes = ({ clientesAsociados, db }) => (
  <Card>
    <SectionTitle icon="👥">Clientes Asignados</SectionTitle>
    <Table
      headers={["ID", "Nombre", "Documento", "Teléfono", "Email", "Estado", "Cuentas"]}
      rows={clientesAsociados.map((c) => {
        const cuentasCount = db.cliente_cuenta.filter((cc) => cc.cli_id === c.cli_id).length;
        return [
          `#${c.cli_id}`, c.cli_nombre, c.cli_documento, c.cli_telefono, c.cli_email,
          <Badge variant={c.cli_estado === "ACTIVO" ? "success" : "danger"}>{c.cli_estado}</Badge>,
          cuentasCount,
        ];
      })}
    />
  </Card>
);

const EmpleadoCuentas = ({ clientesAsociados, db, sucursalId, user, setDb, showAlert }) => {
  const [form, setForm] = useState({ cli_id: clientesAsociados[0]?.cli_id || "", tipo: "AHORROS", saldo: "" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleCrear = () => {
    const saldo = parseFloat(form.saldo);
    if (!form.cli_id || isNaN(saldo) || saldo < 0) { showAlert("Datos inválidos", "error"); return; }
    setDb((prev) => {
      const newCuenta = { cue_id: nextId(prev.cuentas, "cue_id"), cue_tipo: form.tipo, cue_saldo: saldo, cue_estado: "ACTIVA", cue_fecha_apertura: new Date().toISOString().split("T")[0], suc_id: sucursalId };
      const newCC = { cli_id: parseInt(form.cli_id), cue_id: newCuenta.cue_id };
      const bit = { bit_id: nextId(prev.bitacora, "bit_id"), usu_id: user.usu_id, bit_accion: "INSERT", bit_tabla: "CUENTA", bit_anterior: "-", bit_nuevo: JSON.stringify(newCuenta), bit_fecha: new Date().toISOString() };
      return { ...prev, cuentas: [...prev.cuentas, newCuenta], cliente_cuenta: [...prev.cliente_cuenta, newCC], bitacora: [...prev.bitacora, bit] };
    });
    showAlert("Cuenta creada exitosamente", "success");
    setForm((f) => ({ ...f, saldo: "" }));
  };

  const cuentasSuc = db.cuentas.filter((c) => c.suc_id === sucursalId);

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <Card>
        <SectionTitle icon="➕">Abrir Nueva Cuenta</SectionTitle>
        <Select label="Cliente" value={form.cli_id} onChange={(e) => set("cli_id", e.target.value)}>
          {clientesAsociados.map((c) => <option key={c.cli_id} value={c.cli_id}>{c.cli_nombre}</option>)}
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
          rows={cuentasSuc.map((c) => [
            `#${c.cue_id}`, c.cue_tipo, fmt(c.cue_saldo), c.cue_fecha_apertura,
            <Badge variant={c.cue_estado === "ACTIVA" ? "success" : "danger"}>{c.cue_estado}</Badge>,
          ])}
        />
      </Card>
    </div>
  );
};

const EmpleadoTransacciones = ({ user, db, setDb, showAlert }) => {
  const [form, setForm] = useState({ tipo: "CONSIGNACION", monto: "", origen: "", destino: "", canal: "VENTANILLA" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleRegistrar = () => {
    const monto = parseFloat(form.monto);
    if (isNaN(monto) || monto <= 0) { showAlert("Monto inválido", "error"); return; }
    const origen = form.origen ? db.cuentas.find((c) => c.cue_id === parseInt(form.origen)) : null;
    const destino = form.destino ? db.cuentas.find((c) => c.cue_id === parseInt(form.destino)) : null;

    if (form.tipo === "RETIRO" && (!origen || origen.cue_saldo < monto)) { showAlert("Cuenta origen inválida o saldo insuficiente", "error"); return; }
    if (form.tipo === "CONSIGNACION" && !destino) { showAlert("Se requiere cuenta destino", "error"); return; }
    if (form.tipo === "TRANSFERENCIA" && (!origen || !destino || origen.cue_saldo < monto)) { showAlert("Datos de transferencia inválidos", "error"); return; }

    const trr_id = form.tipo === "RETIRO" ? 1 : form.tipo === "CONSIGNACION" ? 2 : 3;
    setDb((prev) => {
      const newCuentas = prev.cuentas.map((c) => {
        if (origen && c.cue_id === origen.cue_id && (form.tipo === "RETIRO" || form.tipo === "TRANSFERENCIA")) return { ...c, cue_saldo: c.cue_saldo - monto };
        if (destino && c.cue_id === destino.cue_id && (form.tipo === "CONSIGNACION" || form.tipo === "TRANSFERENCIA")) return { ...c, cue_saldo: c.cue_saldo + monto };
        return c;
      });
      const tra = { tra_id: nextId(prev.transacciones, "tra_id"), trr_id, tra_monto: monto, tra_fecha: new Date().toISOString(), tra_estado: "EXITOSA", tra_canal: form.canal, cue_id_origen: origen?.cue_id || null, cue_id_destino: destino?.cue_id || null };
      const bit = { bit_id: nextId(prev.bitacora, "bit_id"), usu_id: user.usu_id, bit_accion: form.tipo, bit_tabla: "TRANSACCION", bit_anterior: "-", bit_nuevo: JSON.stringify(tra), bit_fecha: new Date().toISOString() };
      return { ...prev, cuentas: newCuentas, transacciones: [...prev.transacciones, tra], bitacora: [...prev.bitacora, bit] };
    });
    showAlert(`${form.tipo} de ${fmt(monto)} registrada exitosamente`, "success");
    setForm((f) => ({ ...f, monto: "", origen: "", destino: "" }));
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
        <Select label="Canal" value={form.canal} onChange={(e) => set("canal", e.target.value)}>
          {["VENTANILLA", "APP", "WEB", "CAJERO"].map((c) => <option key={c}>{c}</option>)}
        </Select>
        <Button onClick={handleRegistrar} style={{ width: "100%", marginTop: 4 }}>Ejecutar Transacción</Button>
        <div style={{ marginTop: 10, fontSize: 12, color: "#64748b" }}>
          Cuentas del sistema: {db.cuentas.map((c) => `#${c.cue_id} (${fmt(c.cue_saldo)})`).join(" · ")}
        </div>
      </Card>
      <Card>
        <SectionTitle icon="📋">Todas las Transacciones</SectionTitle>
        <Table
          headers={["Fecha", "Tipo", "Monto", "Canal", "Origen", "Destino", "Estado"]}
          rows={[...db.transacciones].reverse().map((t) => {
            const tipo = db.tipoTransaccion.find((tt) => tt.trr_id === t.trr_id);
            return [fmtDate(t.tra_fecha), tipo?.trr_nombre, fmt(t.tra_monto), t.tra_canal, t.cue_id_origen ? `#${t.cue_id_origen}` : "—", t.cue_id_destino ? `#${t.cue_id_destino}` : "—", <Badge variant="success">{t.tra_estado}</Badge>];
          })}
        />
      </Card>
    </div>
  );
};

const EmpleadoNuevoCliente = ({ empleadoId, user, db, setDb, showAlert }) => {
  const [form, setForm] = useState({ username: "", password: "", nombre: "", documento: "", telefono: "", email: "" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleCrear = () => {
    if (!form.username || !form.password || !form.nombre || !form.documento) { showAlert("Todos los campos obligatorios son necesarios", "error"); return; }
    if (db.usuarios.some((u) => u.usu_username === form.username)) { showAlert("El nombre de usuario ya existe", "error"); return; }
    setDb((prev) => {
      const nuevoUsuId = nextId(prev.usuarios, "usu_id");
      const nuevoUsu = { usu_id: nuevoUsuId, usu_username: form.username, usu_password: form.password, usu_rol: "CLIENTE", usu_estado: "ACTIVO" };
      const nuevoCliId = nextId(prev.clientes, "cli_id");
      const nuevoCli = { cli_id: nuevoCliId, usu_id: nuevoUsuId, cli_nombre: form.nombre, cli_documento: form.documento, cli_telefono: form.telefono, cli_email: form.email, cli_estado: "ACTIVO" };
      const bit = { bit_id: nextId(prev.bitacora, "bit_id"), usu_id: user.usu_id, bit_accion: "INSERT", bit_tabla: "CLIENTE", bit_anterior: "-", bit_nuevo: JSON.stringify(nuevoCli), bit_fecha: new Date().toISOString() };
      return { ...prev, usuarios: [...prev.usuarios, nuevoUsu], clientes: [...prev.clientes, nuevoCli], empleado_cliente: [...prev.empleado_cliente, { emp_id: empleadoId, cli_id: nuevoCliId }], bitacora: [...prev.bitacora, bit] };
    });
    showAlert(`Cliente "${form.nombre}" creado exitosamente`, "success");
    setForm({ username: "", password: "", nombre: "", documento: "", telefono: "", email: "" });
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

// ========================
// ADMINISTRADOR PANEL
// ========================
const AdminPanel = ({ user, db, setDb, showAlert }) => {
  const [tab, setTab] = useState("resumen");
  const tabs = [
    { key: "resumen", label: "Resumen", icon: "📊" },
    { key: "usuarios", label: "Usuarios", icon: "👥" },
    { key: "cuentas", label: "Cuentas", icon: "💳" },
    { key: "transacciones", label: "Transacciones", icon: "↔️" },
    { key: "sucursales", label: "Sucursales", icon: "🏢" },
    { key: "nuevo_usuario", label: "Nuevo Usuario", icon: "➕" },
    { key: "bitacora", label: "Bitácora", icon: "🔍" },
  ];

  return (
    <div style={{ padding: "24px", maxWidth: 1100, margin: "0 auto" }}>
      <TabBar tabs={tabs} active={tab} onChange={setTab} />
      {tab === "resumen" && <AdminResumen db={db} />}
      {tab === "usuarios" && <AdminUsuarios db={db} setDb={setDb} user={user} showAlert={showAlert} />}
      {tab === "cuentas" && <AdminCuentas db={db} />}
      {tab === "transacciones" && <AdminTransacciones db={db} />}
      {tab === "sucursales" && <AdminSucursales db={db} setDb={setDb} user={user} showAlert={showAlert} />}
      {tab === "nuevo_usuario" && <AdminNuevoUsuario user={user} db={db} setDb={setDb} showAlert={showAlert} />}
      {tab === "bitacora" && <AdminBitacora db={db} />}
    </div>
  );
};

const AdminResumen = ({ db }) => {
  const stats = [
    { label: "Total Usuarios", value: db.usuarios.length, icon: "👥", color: "#1e40af" },
    { label: "Total Clientes", value: db.clientes.length, icon: "🧑‍💼", color: "#15803d" },
    { label: "Total Cuentas", value: db.cuentas.length, icon: "💳", color: "#7c3aed" },
    { label: "Transacciones", value: db.transacciones.length, icon: "↔️", color: "#b45309" },
    { label: "Sucursales", value: db.sucursales.length, icon: "🏢", color: "#be185d" },
    { label: "Saldo Global", value: fmt(db.cuentas.reduce((s, c) => s + c.cue_saldo, 0)), icon: "💰", color: "#0f766e" },
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
          <Table headers={["Código", "Ubicación", "Estado"]} rows={db.sucursales.map((s) => [s.suc_codigo, s.suc_ubicacion, <Badge variant="success">{s.suc_estado}</Badge>])} />
        </Card>
        <Card>
          <SectionTitle icon="📋">Bitácora Reciente</SectionTitle>
          <Table headers={["Fecha", "Acción", "Tabla"]} rows={[...db.bitacora].reverse().slice(0, 6).map((b) => [fmtDate(b.bit_fecha), b.bit_accion, b.bit_tabla])} />
        </Card>
      </div>
    </div>
  );
};

const AdminUsuarios = ({ db, setDb, user, showAlert }) => {
  const rows = db.usuarios.map((u) => {
    const handleToggle = () => {
      setDb((prev) => ({
        ...prev,
        usuarios: prev.usuarios.map((uu) => uu.usu_id === u.usu_id ? { ...uu, usu_estado: uu.usu_estado === "ACTIVO" ? "INACTIVO" : "ACTIVO" } : uu),
        bitacora: [...prev.bitacora, { bit_id: nextId(prev.bitacora, "bit_id"), usu_id: user.usu_id, bit_accion: "UPDATE", bit_tabla: "USUARIO", bit_anterior: u.usu_estado, bit_nuevo: u.usu_estado === "ACTIVO" ? "INACTIVO" : "ACTIVO", bit_fecha: new Date().toISOString() }],
      }));
    };
    return [
      `#${u.usu_id}`, u.usu_username, u.usu_rol,
      <Badge variant={u.usu_estado === "ACTIVO" ? "success" : "danger"}>{u.usu_estado}</Badge>,
      <Button variant={u.usu_estado === "ACTIVO" ? "danger" : "success"} onClick={handleToggle} style={{ padding: "4px 10px", fontSize: 11 }}>
        {u.usu_estado === "ACTIVO" ? "Desactivar" : "Activar"}
      </Button>,
    ];
  });
  return (
    <Card>
      <SectionTitle icon="👥">Gestión de Usuarios</SectionTitle>
      <Table headers={["ID", "Username", "Rol", "Estado", "Acción"]} rows={rows} />
    </Card>
  );
};

const AdminCuentas = ({ db }) => (
  <Card>
    <SectionTitle icon="💳">Todas las Cuentas</SectionTitle>
    <Table
      headers={["ID", "Tipo", "Saldo", "Estado", "Apertura", "Sucursal", "Cliente"]}
      rows={db.cuentas.map((c) => {
        const suc = db.sucursales.find((s) => s.suc_id === c.suc_id);
        const cc = db.cliente_cuenta.find((r) => r.cue_id === c.cue_id);
        const cli = cc ? db.clientes.find((cl) => cl.cli_id === cc.cli_id) : null;
        return [
          `#${c.cue_id}`, c.cue_tipo, fmt(c.cue_saldo),
          <Badge variant={c.cue_estado === "ACTIVA" ? "success" : "danger"}>{c.cue_estado}</Badge>,
          c.cue_fecha_apertura, suc?.suc_ubicacion || "—", cli?.cli_nombre || "—",
        ];
      })}
    />
  </Card>
);

const AdminTransacciones = ({ db }) => (
  <Card>
    <SectionTitle icon="↔️">Todas las Transacciones</SectionTitle>
    <Table
      headers={["ID", "Fecha", "Tipo", "Monto", "Canal", "Origen", "Destino", "Estado"]}
      rows={[...db.transacciones].reverse().map((t) => {
        const tipo = db.tipoTransaccion.find((tt) => tt.trr_id === t.trr_id);
        return [
          `#${t.tra_id}`, fmtDate(t.tra_fecha), tipo?.trr_nombre, fmt(t.tra_monto), t.tra_canal,
          t.cue_id_origen ? `#${t.cue_id_origen}` : "—",
          t.cue_id_destino ? `#${t.cue_id_destino}` : "—",
          <Badge variant="success">{t.tra_estado}</Badge>,
        ];
      })}
    />
  </Card>
);

const AdminSucursales = ({ db, setDb, user, showAlert }) => {
  const [form, setForm] = useState({ codigo: "", ubicacion: "" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const handleCrear = () => {
    if (!form.codigo || !form.ubicacion) { showAlert("Completa todos los campos", "error"); return; }
    setDb((prev) => {
      const nueva = { suc_id: nextId(prev.sucursales, "suc_id"), suc_codigo: form.codigo.toUpperCase(), suc_ubicacion: form.ubicacion, suc_estado: "ACTIVA" };
      const bit = { bit_id: nextId(prev.bitacora, "bit_id"), usu_id: user.usu_id, bit_accion: "INSERT", bit_tabla: "SUCURSAL", bit_anterior: "-", bit_nuevo: JSON.stringify(nueva), bit_fecha: new Date().toISOString() };
      return { ...prev, sucursales: [...prev.sucursales, nueva], bitacora: [...prev.bitacora, bit] };
    });
    showAlert("Sucursal creada", "success");
    setForm({ codigo: "", ubicacion: "" });
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
          headers={["ID", "Código", "Ubicación", "Estado", "Empleados", "Cuentas"]}
          rows={db.sucursales.map((s) => [
            `#${s.suc_id}`, s.suc_codigo, s.suc_ubicacion,
            <Badge variant="success">{s.suc_estado}</Badge>,
            db.empleados.filter((e) => e.suc_id === s.suc_id).length,
            db.cuentas.filter((c) => c.suc_id === s.suc_id).length,
          ])}
        />
      </Card>
    </div>
  );
};

const AdminNuevoUsuario = ({ user, db, setDb, showAlert }) => {
  const [form, setForm] = useState({ username: "", password: "", rol: "CLIENTE", nombre: "", documento: "", telefono: "", email: "", emp_rol: "CAJERO", suc_id: "" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleCrear = () => {
    if (!form.username || !form.password || !form.nombre) { showAlert("Campos obligatorios incompletos", "error"); return; }
    if (db.usuarios.some((u) => u.usu_username === form.username)) { showAlert("El usuario ya existe", "error"); return; }
    setDb((prev) => {
      const nuevoUsuId = nextId(prev.usuarios, "usu_id");
      const nuevoUsu = { usu_id: nuevoUsuId, usu_username: form.username, usu_password: form.password, usu_rol: form.rol, usu_estado: "ACTIVO" };
      let newState = { ...prev, usuarios: [...prev.usuarios, nuevoUsu] };
      if (form.rol === "CLIENTE") {
        const id = nextId(prev.clientes, "cli_id");
        newState = { ...newState, clientes: [...newState.clientes, { cli_id: id, usu_id: nuevoUsuId, cli_nombre: form.nombre, cli_documento: form.documento, cli_telefono: form.telefono, cli_email: form.email, cli_estado: "ACTIVO" }] };
      } else if (form.rol === "EMPLEADO") {
        const id = nextId(prev.empleados, "emp_id");
        const sucId = parseInt(form.suc_id) || prev.sucursales[0]?.suc_id;
        newState = { ...newState, empleados: [...newState.empleados, { emp_id: id, usu_id: nuevoUsuId, emp_nombre: form.nombre, emp_rol: form.emp_rol, suc_id: sucId }], empleado_sucursal: [...newState.empleado_sucursal, { emp_id: id, suc_id: sucId }] };
      } else {
        const id = nextId(prev.administradores, "adm_id");
        newState = { ...newState, administradores: [...newState.administradores, { adm_id: id, usu_id: nuevoUsuId, adm_nombre: form.nombre }] };
      }
      const bit = { bit_id: nextId(prev.bitacora, "bit_id"), usu_id: user.usu_id, bit_accion: "INSERT", bit_tabla: "USUARIO", bit_anterior: "-", bit_nuevo: form.username, bit_fecha: new Date().toISOString() };
      return { ...newState, bitacora: [...newState.bitacora, bit] };
    });
    showAlert(`Usuario ${form.rol} "${form.username}" creado`, "success");
    setForm({ username: "", password: "", rol: "CLIENTE", nombre: "", documento: "", telefono: "", email: "", emp_rol: "CAJERO", suc_id: "" });
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
          {db.sucursales.map((s) => <option key={s.suc_id} value={s.suc_id}>{s.suc_ubicacion}</option>)}
        </Select>
      </>}
      <Button onClick={handleCrear} style={{ width: "100%", marginTop: 8 }}>Crear Usuario</Button>
    </Card>
  );
};

const AdminBitacora = ({ db }) => {
  const [filtro, setFiltro] = useState("");
  const registros = [...db.bitacora].reverse().filter((b) =>
    !filtro || b.bit_accion.includes(filtro.toUpperCase()) || b.bit_tabla.includes(filtro.toUpperCase())
  );
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

// ========================
// APP ROOT
// ========================
export default function App() {
  const [db, setDb] = useState(initDB);
  const [currentUser, setCurrentUser] = useState(null);
  const [alert, setAlert] = useState({ message: "", type: "success" });

  window.__db = db;

  const showAlert = useCallback((message, type = "success") => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: "", type: "success" }), 4000);
  }, []);

  const handleLogin = (user) => setCurrentUser(user);
  const handleLogout = () => setCurrentUser(null);

  if (!currentUser) return <Login onLogin={handleLogin} />;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <Navbar user={currentUser} onLogout={handleLogout} />
      {alert.message && (
        <div style={{ position: "fixed", top: 70, right: 20, zIndex: 999, minWidth: 280, maxWidth: 420 }}>
          <Alert message={alert.message} type={alert.type} onClose={() => setAlert({ message: "", type: "success" })} />
        </div>
      )}
      {currentUser.usu_rol === "CLIENTE" && <ClientePanel user={currentUser} db={db} setDb={setDb} showAlert={showAlert} />}
      {currentUser.usu_rol === "EMPLEADO" && <EmpleadoPanel user={currentUser} db={db} setDb={setDb} showAlert={showAlert} />}
      {currentUser.usu_rol === "ADMINISTRADOR" && <AdminPanel user={currentUser} db={db} setDb={setDb} showAlert={showAlert} />}
    </div>
  );
}
