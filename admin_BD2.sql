CREATE TABLE Usuario (
    usu_id NUMBER PRIMARY KEY,
    usu_username VARCHAR2(50) UNIQUE NOT NULL,
    usu_password VARCHAR2(100) NOT NULL,
    usu_rol VARCHAR2(20) NOT NULL,
    usu_estado VARCHAR2(20) DEFAULT 'ACTIVO'
);

CREATE TABLE Cliente (
    cli_id NUMBER PRIMARY KEY,
    usu_id NUMBER UNIQUE,
    cli_nombre VARCHAR2(100),
    cli_documento VARCHAR2(30),
    cli_telefono VARCHAR2(30),
    cli_email VARCHAR2(100),
    cli_estado VARCHAR2(20),
    CONSTRAINT fk_cli_usuario
    FOREIGN KEY (usu_id) REFERENCES Usuario(usu_id)
);

CREATE TABLE Empleado (
    emp_id NUMBER PRIMARY KEY,
    usu_id NUMBER UNIQUE,
    emp_nombre VARCHAR2(100),
    emp_rol VARCHAR2(30),
    suc_id NUMBER,
    CONSTRAINT fk_emp_usuario
    FOREIGN KEY (usu_id) REFERENCES Usuario(usu_id)
);

CREATE TABLE Administrador (
    adm_id NUMBER PRIMARY KEY,
    usu_id NUMBER UNIQUE,
    adm_nombre VARCHAR2(100),
    CONSTRAINT fk_adm_usuario
    FOREIGN KEY (usu_id) REFERENCES Usuario(usu_id)
);

CREATE TABLE Sucursal (
    suc_id NUMBER PRIMARY KEY,
    suc_codigo VARCHAR2(20),
    suc_ubicacion VARCHAR2(100),
    suc_estado VARCHAR2(20)
);

CREATE TABLE Cuenta (
    cue_id NUMBER PRIMARY KEY,
    cue_tipo VARCHAR2(30),
    cue_saldo NUMBER(15,2),
    cue_estado VARCHAR2(20),
    cue_fecha_apertura DATE,
    suc_id NUMBER,
    CONSTRAINT fk_cue_sucursal
    FOREIGN KEY (suc_id) REFERENCES Sucursal(suc_id)
);

CREATE TABLE TipoTransaccion (
    ttr_id NUMBER PRIMARY KEY,
    ttr_nombre VARCHAR2(50)
);

CREATE TABLE Transaccion (
    tra_id NUMBER PRIMARY KEY,
    ttr_id NUMBER,
    tra_monto NUMBER(15,2),
    tra_fecha DATE,
    tra_estado VARCHAR2(20),
    tra_canal VARCHAR2(20),
    cue_id_origen NUMBER,
    cue_id_destino NUMBER,
    CONSTRAINT fk_tra_tipo FOREIGN KEY (ttr_id) REFERENCES TipoTransaccion(ttr_id),
    CONSTRAINT fk_tra_origen FOREIGN KEY (cue_id_origen) REFERENCES Cuenta(cue_id),
    CONSTRAINT fk_tra_destino FOREIGN KEY (cue_id_destino) REFERENCES Cuenta(cue_id)
);

CREATE TABLE Bitacora (
    bit_id NUMBER PRIMARY KEY,
    usu_id NUMBER,
    bit_accion VARCHAR2(50),
    bit_tabla VARCHAR2(50),
    bit_anterior VARCHAR2(200),
    bit_nuevo VARCHAR2(200),
    bit_fecha DATE,
    CONSTRAINT fk_bit_usuario FOREIGN KEY (usu_id) REFERENCES Usuario(usu_id)
);

CREATE TABLE Cliente_Cuenta (
    cli_id NUMBER,
    cue_id NUMBER,
    PRIMARY KEY (cli_id, cue_id),
    CONSTRAINT fk_cc_cliente FOREIGN KEY (cli_id) REFERENCES Cliente(cli_id),
    CONSTRAINT fk_cc_cuenta FOREIGN KEY (cue_id) REFERENCES Cuenta(cue_id)
);

CREATE TABLE Empleado_Cliente (
    emp_id NUMBER,
    cli_id NUMBER,
    PRIMARY KEY (emp_id, cli_id),
    CONSTRAINT fk_ec_emp FOREIGN KEY (emp_id) REFERENCES Empleado(emp_id),
    CONSTRAINT fk_ec_cli FOREIGN KEY (cli_id) REFERENCES Cliente(cli_id)
);

CREATE TABLE Empleado_Sucursal (
    emp_id NUMBER,
    suc_id NUMBER,
    PRIMARY KEY (emp_id, suc_id),
    CONSTRAINT fk_es_emp FOREIGN KEY (emp_id) REFERENCES Empleado(emp_id),
    CONSTRAINT fk_es_suc FOREIGN KEY (suc_id) REFERENCES Sucursal(suc_id)
);

CREATE SEQUENCE seq_usuario
START WITH 10
INCREMENT BY 1;

CREATE SEQUENCE seq_cliente
START WITH 10
INCREMENT BY 1;

CREATE SEQUENCE seq_empleado
START WITH 10
INCREMENT BY 1;

CREATE SEQUENCE seq_administrador
START WITH 10
INCREMENT BY 1;

CREATE SEQUENCE seq_sucursal
START WITH 10
INCREMENT BY 1;

CREATE SEQUENCE seq_cuenta
START WITH 10
INCREMENT BY 1;

CREATE SEQUENCE seq_transaccion
START WITH 10
INCREMENT BY 1;

CREATE SEQUENCE seq_bitacora
START WITH 10
INCREMENT BY 1;

CREATE OR REPLACE TRIGGER trigger_usuario
BEFORE INSERT ON Usuario
FOR EACH ROW
BEGIN
   IF :NEW.usu_id IS NULL THEN
       SELECT seq_usuario.NEXTVAL
       INTO :NEW.usu_id
       FROM dual;
   END IF;
END;

CREATE OR REPLACE TRIGGER trigger_cliente
BEFORE INSERT ON Cliente
FOR EACH ROW
BEGIN
    IF :NEW.cli_id IS NULL THEN
        SELECT seq_cliente.NEXTVAL
        INTO :NEW.cli_id
        FROM dual;
    END IF;
END;

CREATE OR REPLACE TRIGGER trigger_cuenta
BEFORE INSERT ON Cuenta
FOR EACH ROW
BEGIN
    IF :NEW.cue_id IS NULL THEN
        SELECT seq_cuenta.NEXTVAL
        INTO :NEW.cue_id
        FROM dual;
    END IF;
END;

CREATE OR REPLACE TRIGGER trigger_transaccion
BEFORE INSERT ON Transaccion
FOR EACH ROW
BEGIN
    IF :NEW.tra_id IS NULL THEN
        SELECT seq_transaccion.NEXTVAL
        INTO :NEW.tra_id
        FROM dual;
    END IF;
END;

CREATE OR REPLACE TRIGGER trigger_bitacora
AFTER UPDATE ON Cuenta
FOR EACH ROW
BEGIN

    INSERT INTO Bitacora(
        bit_id,
        usu_id,
        bit_accion,
        bit_tabla,
        bit_anterior,
        bit_nuevo,
        bit_fecha
    )
    VALUES(
        seq_bitacora.NEXTVAL,
        9,
        'UPDATE',
        'CUENTA',
        'Saldo anterior: ' || :OLD.cue_saldo,
        'Saldo nuevo: ' || :NEW.cue_saldo,
        SYSDATE
    );
END;

INSERT INTO Usuario VALUES (1,'juan','123','CLIENTE','ACTIVO');
INSERT INTO Usuario VALUES (2,'ana','123','CLIENTE','ACTIVO');
INSERT INTO Usuario VALUES (3,'pedro','123','CLIENTE','ACTIVO');
INSERT INTO Usuario VALUES (4,'laura','123','CLIENTE','ACTIVO');
INSERT INTO Usuario VALUES (5,'carlos','123','EMPLEADO','ACTIVO');
INSERT INTO Usuario VALUES (6,'maria','123','EMPLEADO','ACTIVO');
INSERT INTO Usuario VALUES (7,'andres','123','EMPLEADO','ACTIVO');
INSERT INTO Usuario VALUES (8,'sofia','123','EMPLEADO','ACTIVO');
INSERT INTO Usuario VALUES (9,'admin','123','ADMINISTRADOR','ACTIVO');

INSERT INTO Sucursal VALUES (1,'CEN','Bogota','ACTIVA');
INSERT INTO Sucursal VALUES (2,'NOR','Bogota','ACTIVA');
INSERT INTO Sucursal VALUES (3,'SUR','Cali','ACTIVA');
INSERT INTO Sucursal VALUES (4,'MED','Medellin','ACTIVA');

INSERT INTO Cliente VALUES (1,1,'Juan Perez','1001','3001','juan@mail.com','ACTIVO');
INSERT INTO Cliente VALUES (2,2,'Ana Ruiz','1002','3002','ana@mail.com','ACTIVO');
INSERT INTO Cliente VALUES (3,3,'Pedro Gomez','1003','3003','pedro@mail.com','ACTIVO');
INSERT INTO Cliente VALUES (4,4,'Laura Diaz','1004','3004','laura@mail.com','ACTIVO');

INSERT INTO Empleado VALUES (1,5,'Carlos Lopez','CAJERO',1);
INSERT INTO Empleado VALUES (2,6,'Maria Torres','ASESOR',2);
INSERT INTO Empleado VALUES (3,7,'Andres Diaz','CAJERO',3);
INSERT INTO Empleado VALUES (4,8,'Sofia Perez','GERENTE',4);

INSERT INTO Administrador VALUES (1,9,'Admin General');

INSERT INTO Cuenta VALUES (1,'AHORROS',500000,'ACTIVA',SYSDATE,1);
INSERT INTO Cuenta VALUES (2,'CORRIENTE',300000,'ACTIVA',TO_DATE('2024-03-15','YYYY-MM-DD'),2);
INSERT INTO Cuenta VALUES (3,'AHORROS',700000,'ACTIVA',TO_DATE('2024-06-20','YYYY-MM-DD'),3);
INSERT INTO Cuenta VALUES (4,'CORRIENTE',900000,'ACTIVA',TO_DATE('2025-01-05','YYYY-MM-DD'),4);

INSERT INTO TipoTransaccion VALUES (1,'RETIRO');
INSERT INTO TipoTransaccion VALUES (2,'CONSIGNACION');
INSERT INTO TipoTransaccion VALUES (3,'TRANSFERENCIA');

INSERT INTO Cliente_Cuenta VALUES (1,1);
INSERT INTO Cliente_Cuenta VALUES (2,2);
INSERT INTO Cliente_Cuenta VALUES (3,3);
INSERT INTO Cliente_Cuenta VALUES (4,4);

INSERT INTO Empleado_Cliente VALUES (1,1);
INSERT INTO Empleado_Cliente VALUES (2,2);
INSERT INTO Empleado_Cliente VALUES (3,3);
INSERT INTO Empleado_Cliente VALUES (4,4);

INSERT INTO Empleado_Sucursal VALUES (1,1);
INSERT INTO Empleado_Sucursal VALUES (2,2);
INSERT INTO Empleado_Sucursal VALUES (3,3);
INSERT INTO Empleado_Sucursal VALUES (4,4);

INSERT INTO Transaccion VALUES (1,1,50000,SYSDATE,'EXITOSA','CAJERO',1,2);
INSERT INTO Transaccion VALUES (2,2,100000,TO_DATE('2020-11-05','YYYY-MM-DD'),'EXITOSA','APP',2,3);
INSERT INTO Transaccion VALUES (3,3,70000,TO_DATE('2015-05-07','YYYY-MM-DD'),'PENDIENTE','WEB',3,4);


INSERT INTO Bitacora VALUES (1,9,'INSERT','CUENTA','-','creada',SYSDATE);
INSERT INTO Bitacora VALUES (2,9,'UPDATE','CUENTA','500k','600k',SYSDATE);

-- Cabecera
CREATE OR REPLACE PACKAGE pkg_util AS

    -- Inicia una transacción creando un savepoint
    PROCEDURE sp_begin_transaction(p_savepoint_name VARCHAR2);

    -- Confirma la transacción (opcionalmente libera un savepoint)
    PROCEDURE sp_commit_transaction(p_savepoint_name VARCHAR2 DEFAULT NULL);

    -- Revierte la transacción total o a un savepoint específico
    PROCEDURE sp_rollback_transaction(p_savepoint_name VARCHAR2 DEFAULT NULL);

    -- Registra un error en la tabla Bitacora (autónoma)
    PROCEDURE sp_log_error(
        p_usu_id     NUMBER,
        p_accion     VARCHAR2,
        p_tabla      VARCHAR2,
        p_error_msg  VARCHAR2
    );

    -- Convierte un valor booleano a NUMBER (1 = verdadero, 0 = falso)
    FUNCTION fn_bool_to_number(p_bool BOOLEAN) RETURN NUMBER;

END pkg_util;
/

-- Cuerpo
CREATE OR REPLACE PACKAGE BODY pkg_util AS

    PROCEDURE sp_begin_transaction(p_savepoint_name VARCHAR2) IS
    BEGIN
        EXECUTE IMMEDIATE 'SAVEPOINT ' || p_savepoint_name;
    END;

    PROCEDURE sp_commit_transaction(p_savepoint_name VARCHAR2 DEFAULT NULL) IS
    BEGIN
        IF p_savepoint_name IS NULL THEN
            COMMIT;
        ELSE
            -- Simplemente confirma; el savepoint se libera automáticamente
            COMMIT;
        END IF;
    END;

    PROCEDURE sp_rollback_transaction(p_savepoint_name VARCHAR2 DEFAULT NULL) IS
    BEGIN
        IF p_savepoint_name IS NULL THEN
            ROLLBACK;
        ELSE
            EXECUTE IMMEDIATE 'ROLLBACK TO ' || p_savepoint_name;
        END IF;
    END;

    PROCEDURE sp_log_error(
        p_usu_id     NUMBER,
        p_accion     VARCHAR2,
        p_tabla      VARCHAR2,
        p_error_msg  VARCHAR2
    ) IS
        PRAGMA AUTONOMOUS_TRANSACTION;
    BEGIN
        INSERT INTO Bitacora (bit_id, usu_id, bit_accion, bit_tabla, bit_anterior, bit_nuevo, bit_fecha)
        VALUES (seq_bitacora.NEXTVAL, p_usu_id, p_accion, p_tabla, 'ERROR', SUBSTR(p_error_msg, 1, 200), SYSDATE);
        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
    END;

    FUNCTION fn_bool_to_number(p_bool BOOLEAN) RETURN NUMBER IS
    BEGIN
        RETURN CASE WHEN p_bool THEN 1 ELSE 0 END;
    END;

END pkg_util;
/

CREATE OR REPLACE PACKAGE pkg_cliente AS

    PROCEDURE sp_insertar_cliente(
        p_username    VARCHAR2,
        p_password    VARCHAR2,
        p_nombre      VARCHAR2,
        p_documento   VARCHAR2,
        p_telefono    VARCHAR2,
        p_email       VARCHAR2,
        p_out_success OUT NUMBER,
        p_out_message OUT VARCHAR2
    );

    PROCEDURE sp_actualizar_cliente(
        p_cli_id      NUMBER,
        p_telefono    VARCHAR2,
        p_email       VARCHAR2,
        p_out_success OUT NUMBER,
        p_out_message OUT VARCHAR2
    );

    PROCEDURE sp_desactivar_cliente(
        p_cli_id      NUMBER,
        p_out_success OUT NUMBER,
        p_out_message OUT VARCHAR2
    );

    -- Retorna un cursor con los datos completos del cliente
    FUNCTION fn_consultar_cliente(p_cli_id NUMBER) RETURN SYS_REFCURSOR;

    -- Retorna un cursor con todos los clientes activos
    FUNCTION fn_listar_clientes_activos RETURN SYS_REFCURSOR;

END pkg_cliente;
/
CREATE OR REPLACE PACKAGE BODY pkg_cliente AS

    PROCEDURE sp_insertar_cliente(
        p_username    VARCHAR2,
        p_password    VARCHAR2,
        p_nombre      VARCHAR2,
        p_documento   VARCHAR2,
        p_telefono    VARCHAR2,
        p_email       VARCHAR2,
        p_out_success OUT NUMBER,
        p_out_message OUT VARCHAR2
    ) IS
        v_usu_id NUMBER;
        v_savepoint VARCHAR2(30) := 'SP_INS_CLIENTE';
        v_error_msg VARCHAR2(4000);
    BEGIN
        p_out_success := 0;
        pkg_util.sp_begin_transaction(v_savepoint);

        INSERT INTO Usuario (usu_username, usu_password, usu_rol, usu_estado)
        VALUES (p_username, p_password, 'CLIENTE', 'ACTIVO')
        RETURNING usu_id INTO v_usu_id;

        INSERT INTO Cliente (usu_id, cli_nombre, cli_documento, cli_telefono, cli_email, cli_estado)
        VALUES (v_usu_id, p_nombre, p_documento, p_telefono, p_email, 'ACTIVO');

        pkg_util.sp_commit_transaction(v_savepoint);
        p_out_success := 1;
        p_out_message := 'Cliente creado exitosamente.';

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            pkg_util.sp_rollback_transaction(v_savepoint);
            p_out_message := 'Error: Username o documento duplicado.';
            pkg_util.sp_log_error(NULL, 'INSERTAR_CLIENTE', 'CLIENTE', DBMS_UTILITY.FORMAT_ERROR_STACK);
        WHEN OTHERS THEN
            v_error_msg := DBMS_UTILITY.FORMAT_ERROR_STACK;
            pkg_util.sp_rollback_transaction(v_savepoint);
            p_out_message := 'Error inesperado: ' || v_error_msg;
            pkg_util.sp_log_error(NULL, 'INSERTAR_CLIENTE', 'CLIENTE', v_error_msg);
    END;

    PROCEDURE sp_actualizar_cliente(
        p_cli_id      NUMBER,
        p_telefono    VARCHAR2,
        p_email       VARCHAR2,
        p_out_success OUT NUMBER,
        p_out_message OUT VARCHAR2
    ) IS
        v_savepoint VARCHAR2(30) := 'SP_UPD_CLIENTE';
        v_error_msg VARCHAR2(4000);
    BEGIN
        p_out_success := 0;
        pkg_util.sp_begin_transaction(v_savepoint);

        UPDATE Cliente
        SET cli_telefono = p_telefono,
            cli_email = p_email
        WHERE cli_id = p_cli_id;

        IF SQL%ROWCOUNT = 0 THEN
            RAISE NO_DATA_FOUND;
        END IF;

        pkg_util.sp_commit_transaction(v_savepoint);
        p_out_success := 1;
        p_out_message := 'Cliente actualizado correctamente.';

    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            pkg_util.sp_rollback_transaction(v_savepoint);
            p_out_message := 'Cliente no encontrado.';
            pkg_util.sp_log_error(NULL, 'ACTUALIZAR_CLIENTE', 'CLIENTE', DBMS_UTILITY.FORMAT_ERROR_STACK);
        WHEN OTHERS THEN
            v_error_msg := DBMS_UTILITY.FORMAT_ERROR_STACK;
            pkg_util.sp_rollback_transaction(v_savepoint);
            p_out_message := 'Error: ' || v_error_msg;
            pkg_util.sp_log_error(NULL, 'ACTUALIZAR_CLIENTE', 'CLIENTE', v_error_msg);
    END;

    PROCEDURE sp_desactivar_cliente(
        p_cli_id      NUMBER,
        p_out_success OUT NUMBER,
        p_out_message OUT VARCHAR2
    ) IS
        v_savepoint VARCHAR2(30) := 'SP_DES_CLIENTE';
        v_usu_id    NUMBER;
        v_error_msg VARCHAR2(4000);
    BEGIN
        p_out_success := 0;
        pkg_util.sp_begin_transaction(v_savepoint);

        SELECT usu_id INTO v_usu_id FROM Cliente WHERE cli_id = p_cli_id;

        UPDATE Cliente SET cli_estado = 'INACTIVO' WHERE cli_id = p_cli_id;
        UPDATE Usuario SET usu_estado = 'INACTIVO' WHERE usu_id = v_usu_id;

        IF SQL%ROWCOUNT = 0 THEN
            RAISE NO_DATA_FOUND;
        END IF;

        pkg_util.sp_commit_transaction(v_savepoint);
        p_out_success := 1;
        p_out_message := 'Cliente desactivado.';

    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            pkg_util.sp_rollback_transaction(v_savepoint);
            p_out_message := 'Cliente no existe.';
            pkg_util.sp_log_error(NULL, 'DESACTIVAR_CLIENTE', 'CLIENTE', DBMS_UTILITY.FORMAT_ERROR_STACK);
        WHEN OTHERS THEN
            v_error_msg := DBMS_UTILITY.FORMAT_ERROR_STACK;
            pkg_util.sp_rollback_transaction(v_savepoint);
            p_out_message := 'Error: ' || v_error_msg;
            pkg_util.sp_log_error(NULL, 'DESACTIVAR_CLIENTE', 'CLIENTE', v_error_msg);
    END;

    FUNCTION fn_consultar_cliente(p_cli_id NUMBER) RETURN SYS_REFCURSOR IS
        v_cursor SYS_REFCURSOR;
        v_error_msg VARCHAR2(4000);
    BEGIN
        OPEN v_cursor FOR
            SELECT c.cli_id, u.usu_username, c.cli_nombre, c.cli_documento,
                   c.cli_telefono, c.cli_email, c.cli_estado
            FROM Cliente c
            JOIN Usuario u ON c.usu_id = u.usu_id
            WHERE c.cli_id = p_cli_id;
        RETURN v_cursor;
    EXCEPTION
        WHEN OTHERS THEN
            v_error_msg := DBMS_UTILITY.FORMAT_ERROR_STACK;
            OPEN v_cursor FOR SELECT 'Error: ' || v_error_msg AS mensaje FROM DUAL;
            RETURN v_cursor;
    END;

    FUNCTION fn_listar_clientes_activos RETURN SYS_REFCURSOR IS
        v_cursor SYS_REFCURSOR;
        v_error_msg VARCHAR2(4000);
    BEGIN
        OPEN v_cursor FOR
            SELECT cli_id, cli_nombre, cli_documento, cli_telefono, cli_email
            FROM Cliente
            WHERE cli_estado = 'ACTIVO';
        RETURN v_cursor;
    EXCEPTION
        WHEN OTHERS THEN
            v_error_msg := DBMS_UTILITY.FORMAT_ERROR_STACK;
            OPEN v_cursor FOR SELECT 'Error: ' || v_error_msg AS mensaje FROM DUAL;
            RETURN v_cursor;
    END;

END pkg_cliente;
/

-- Cabecera
CREATE OR REPLACE PACKAGE pkg_cuenta AS

    PROCEDURE sp_crear_cuenta(
        p_tipo        VARCHAR2,
        p_saldo       NUMBER,
        p_sucursal    NUMBER,
        p_cliente     NUMBER,
        p_out_success OUT NUMBER,
        p_out_message OUT VARCHAR2
    );

    PROCEDURE sp_bloquear_cuenta(
        p_cue_id      NUMBER,
        p_out_success OUT NUMBER,
        p_out_message OUT VARCHAR2
    );

    -- Retorna cursor con saldo y estado de la cuenta
    FUNCTION fn_consultar_saldo(p_cue_id NUMBER) RETURN SYS_REFCURSOR;

    -- Retorna cursor con el historial de transacciones de la cuenta
    FUNCTION fn_historial_cuenta(p_cue_id NUMBER) RETURN SYS_REFCURSOR;

END pkg_cuenta;
/

-- Cuerpo
CREATE OR REPLACE PACKAGE BODY pkg_cuenta AS

    PROCEDURE sp_crear_cuenta(
        p_tipo        VARCHAR2,
        p_saldo       NUMBER,
        p_sucursal    NUMBER,
        p_cliente     NUMBER,
        p_out_success OUT NUMBER,
        p_out_message OUT VARCHAR2
    ) IS
        v_cue_id NUMBER;
        v_savepoint VARCHAR2(30) := 'SP_CREA_CUENTA';
    BEGIN
        p_out_success := 0;
        pkg_util.sp_begin_transaction(v_savepoint);

        IF p_saldo < 0 THEN
            RAISE_APPLICATION_ERROR(-20001, 'El saldo inicial no puede ser negativo');
        END IF;

        INSERT INTO Cuenta (cue_tipo, cue_saldo, cue_estado, cue_fecha_apertura, suc_id)
        VALUES (p_tipo, p_saldo, 'ACTIVA', SYSDATE, p_sucursal)
        RETURNING cue_id INTO v_cue_id;

        INSERT INTO Cliente_Cuenta (cli_id, cue_id)
        VALUES (p_cliente, v_cue_id);

        pkg_util.sp_commit_transaction(v_savepoint);
        p_out_success := 1;
        p_out_message := 'Cuenta creada exitosamente.';

    EXCEPTION
        WHEN OTHERS THEN
            pkg_util.sp_rollback_transaction(v_savepoint);
            p_out_message := 'Error al crear cuenta: ' || SQLERRM;
            pkg_util.sp_log_error(NULL, 'CREAR_CUENTA', 'CUENTA', SQLERRM);
    END;

    PROCEDURE sp_bloquear_cuenta(
        p_cue_id      NUMBER,
        p_out_success OUT NUMBER,
        p_out_message OUT VARCHAR2
    ) IS
        v_savepoint VARCHAR2(30) := 'SP_BLOQ_CUENTA';
    BEGIN
        p_out_success := 0;
        pkg_util.sp_begin_transaction(v_savepoint);

        UPDATE Cuenta
        SET cue_estado = 'BLOQUEADA'
        WHERE cue_id = p_cue_id;

        IF SQL%ROWCOUNT = 0 THEN
            RAISE NO_DATA_FOUND;
        END IF;

        pkg_util.sp_commit_transaction(v_savepoint);
        p_out_success := 1;
        p_out_message := 'Cuenta bloqueada.';

    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            pkg_util.sp_rollback_transaction(v_savepoint);
            p_out_message := 'Cuenta no encontrada.';
            pkg_util.sp_log_error(NULL, 'BLOQUEAR_CUENTA', 'CUENTA', SQLERRM);
        WHEN OTHERS THEN
            pkg_util.sp_rollback_transaction(v_savepoint);
            p_out_message := 'Error: ' || SQLERRM;
            pkg_util.sp_log_error(NULL, 'BLOQUEAR_CUENTA', 'CUENTA', SQLERRM);
    END;

    FUNCTION fn_consultar_saldo(p_cue_id NUMBER) RETURN SYS_REFCURSOR IS
        v_cursor SYS_REFCURSOR;
    BEGIN
        OPEN v_cursor FOR
            SELECT cue_id, cue_saldo, cue_estado, cue_tipo
            FROM Cuenta
            WHERE cue_id = p_cue_id;
        RETURN v_cursor;
    EXCEPTION
        WHEN OTHERS THEN
            OPEN v_cursor FOR SELECT 'Error: ' || SQLERRM AS mensaje FROM DUAL;
            RETURN v_cursor;
    END;

    FUNCTION fn_historial_cuenta(p_cue_id NUMBER) RETURN SYS_REFCURSOR IS
        v_cursor SYS_REFCURSOR;
    BEGIN
        OPEN v_cursor FOR
            SELECT t.tra_id, t.tra_monto, t.tra_fecha, t.tra_estado, t.tra_canal,
                   tt.ttr_nombre AS tipo_transaccion,
                   CASE WHEN t.cue_id_origen = p_cue_id THEN 'ORIGEN' ELSE 'DESTINO' END AS flujo
            FROM Transaccion t
            JOIN TipoTransaccion tt ON t.ttr_id = tt.ttr_id
            WHERE t.cue_id_origen = p_cue_id OR t.cue_id_destino = p_cue_id
            ORDER BY t.tra_fecha DESC;
        RETURN v_cursor;
    END;

END pkg_cuenta;
/