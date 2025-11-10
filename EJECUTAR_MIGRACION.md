# Cómo Ejecutar Migraciones SQL (Docentes y Cursos)

## Opción 1: Usando MySQL desde la Terminal (Recomendado)

### Si usas Laragon:
1. Abre la terminal de Laragon o PowerShell
2. Navega a la carpeta del proyecto:
   ```powershell
   cd F:\NEW_PROJECTS\SISTEMAINFO-main\SISTEMAINFO-main
   ```
3. Ejecuta MySQL y conecta a la base de datos:
   ```powershell
   mysql -u root -p infouna
   ```
   (Si no tienes contraseña, presiona Enter)

4. Una vez conectado, ejecuta el script de docentes:
   ```sql
   source backend/migrations/add_docentes_fields.sql
   ```
   
   O copia y pega directamente el contenido del archivo:
   ```sql
   ALTER TABLE docentes 
   ADD COLUMN apellido VARCHAR(100) AFTER nombre;

   ALTER TABLE docentes 
   ADD COLUMN grado_academico VARCHAR(100) AFTER especialidad;

   ALTER TABLE docentes 
   ADD COLUMN estado ENUM('activo', 'inactivo') DEFAULT 'activo' AFTER experiencia;
  ```

5. Verifica que los campos se agregaron:
   ```sql
   DESCRIBE docentes;
   ```

6. Sal de MySQL:
   ```sql
   exit;
   ```

---

## Opción 2: Usando phpMyAdmin (Laragon)

1. Abre Laragon y asegúrate de que MySQL esté corriendo
2. Haz clic en "Database" en Laragon o abre http://localhost/phpmyadmin
3. Selecciona la base de datos `infouna` en el panel izquierdo
4. Ve a la pestaña "SQL"
5. Copia y pega el siguiente código SQL:

```sql
ALTER TABLE docentes 
ADD COLUMN apellido VARCHAR(100) AFTER nombre;

ALTER TABLE docentes 
ADD COLUMN grado_academico VARCHAR(100) AFTER especialidad;

ALTER TABLE docentes 
ADD COLUMN estado ENUM('activo', 'inactivo') DEFAULT 'activo' AFTER experiencia;
```

6. Haz clic en "Continuar" o "Go"
7. Verifica que los campos se agregaron correctamente

---

## Opción 3: Desde un archivo SQL directamente

Si prefieres ejecutar el archivo completo:

```powershell
# Desde PowerShell, en la carpeta del proyecto:
mysql -u root -p infouna < backend/migrations/add_docentes_fields.sql
```

---

## Migración para cursos: agregar imagen opcional y relación con módulo

Para habilitar imágenes opcionales en cursos y la relación con módulos, ejecuta esta migración segura:

### Terminal MySQL (recomendado)
```powershell
mysql -u root -p infouna < backend/migrations/2025-11-09-add-cursos-imagen-modulo.sql
```

### phpMyAdmin
1. Abre `backend/migrations/2025-11-09-add-cursos-imagen-modulo.sql`
2. Copia su contenido en la pestaña SQL de phpMyAdmin para la BD `infouna`
3. Ejecuta y verifica que las columnas existan

### Verificación
```sql
DESCRIBE cursos;
```
Debes ver:
- `modulo_id` (INT, NULL)
- `imagen` (VARCHAR(255), NULL)

Si ya existían, la migración no hará cambios (es idempotente).

---

## Verificar que Funcionó

Después de ejecutar la migración, puedes verificar que los campos se agregaron correctamente:

```sql
DESCRIBE docentes;
```

Deberías ver los campos:
- `apellido`
- `grado_academico`
- `estado`

Y en `cursos`:
- `modulo_id`
- `imagen`

---

## ⚠️ Nota Importante

Si obtienes un error que dice que el campo ya existe, significa que la tabla ya tiene esos campos. En ese caso, simplemente ignora el error y continúa. Los campos ya están listos para usar.

---

## Si tienes problemas

Si encuentras algún error, puedes verificar primero qué campos tiene la tabla:

```sql
SHOW COLUMNS FROM docentes;
```

Esto te mostrará todos los campos actuales de la tabla `docentes`.

