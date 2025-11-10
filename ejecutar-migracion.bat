@echo off
echo ========================================
echo Ejecutando migracion SQL para docentes
echo ========================================
echo.
echo Conectando a MySQL...
echo Por favor ingresa la contraseña de MySQL (o presiona Enter si no tienes)
echo.

mysql -u root -p infouna < backend\migrations\add_docentes_fields.sql

if %errorlevel% == 0 (
    echo.
    echo ========================================
    echo Migracion ejecutada exitosamente!
    echo ========================================
) else (
    echo.
    echo ========================================
    echo ERROR: No se pudo ejecutar la migracion
    echo ========================================
    echo.
    echo Posibles causas:
    echo 1. MySQL no esta en el PATH
    echo 2. La base de datos 'infouna' no existe
    echo 3. Los campos ya existen en la tabla
    echo.
    echo Por favor ejecuta manualmente usando phpMyAdmin o MySQL Workbench
)

pause

