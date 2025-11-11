-- Agrega columna para múltiples imágenes adicionales en el modal promocional
-- Usa TEXT para almacenar un JSON con rutas relativas (p.ej. /uploads/modal/archivo.png)

ALTER TABLE modal_promocional
  ADD COLUMN imagenes_extra TEXT NULL AFTER imagen;

-- Ejemplo de contenido: '["/uploads/modal/img1.jpg","/uploads/modal/img2.png"]'

