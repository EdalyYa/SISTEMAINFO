import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Select, Slider, Switch, Alert, AlertDescription } from '@/components/ui';
import { 
  Type, 
  Download, 
  Save, 
  Trash2, 
  Move, 
  RotateCw,
  Square,
  Image as IconImage,
  QrCode,
  Calendar,
  Hash,
  User,
  FileText,
  Palette,
  Settings,
  Eye,
  EyeOff,
  Upload
} from 'lucide-react';

const CertificateDesigner = ({ onSave, onClose, initialTemplate }) => {
  const canvasRef = useRef(null);
  const [template, setTemplate] = useState({
    nombre: initialTemplate?.nombre || 'Nueva Plantilla',
    fondo: initialTemplate?.fondo || '/templates/default-bg.jpg',
    configuracion: {
      titulo: { 
        texto: 'CERTIFICADO', 
        x: 400, y: 150, 
        fontSize: 32, 
        color: '#000000', 
        fontWeight: 'bold',
        visible: true 
      },
      nombre: { 
        x: 400, y: 280, 
        fontSize: 24, 
        color: '#000000', 
        fontWeight: 'bold',
        visible: true 
      },
      rol: {
        texto: 'Asistente',
        x: 400, y: 310,
        fontSize: 14,
        color: '#000000',
        fontWeight: 'bold',
        visible: true,
      },
      descripcion: { 
        texto: 'Por haber participado en:', 
        x: 400, y: 320, 
        fontSize: 14, 
        color: '#000000',
        visible: true 
      },
      evento: { 
        x: 400, y: 350, 
        fontSize: 16, 
        color: '#000000', 
        fontWeight: 'bold',
        visible: true 
      },
      fecha: { 
        x: 400, y: 450, 
        fontSize: 14, 
        color: '#000000',
        visible: true 
      },
      codigo: { 
        x: 400, y: 500, 
        fontSize: 12, 
        color: '#666666',
        visible: true 
      },
      qr: { 
        x: 650, y: 450, 
        width: 80, 
        visible: true 
      },
      logo: { 
        x: 50, y: 50, 
        width: 100, 
        height: 100,
        visible: true 
      }
    }
  });

  const [selectedElement, setSelectedElement] = useState('titulo');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [previewMode, setPreviewMode] = useState(false);

  const elementos = [
    { id: 'titulo', label: 'Título', icon: Type },
    { id: 'nombre', label: 'Nombre Participante', icon: User },
    { id: 'rol', label: 'Rol', icon: Type },
    { id: 'descripcion', label: 'Descripción', icon: FileText },
    { id: 'evento', label: 'Nombre Evento', icon: Calendar },
    { id: 'fecha', label: 'Fecha', icon: Calendar },
    { id: 'codigo', label: 'Código', icon: Hash },
    { id: 'qr', label: 'Código QR', icon: QrCode },
    { id: 'logo', label: 'Logo', icon: IconImage }
  ];

  useEffect(() => {
    dibujarCanvas();
  }, [template, previewMode]);

  const dibujarCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar fondo
    const img = new window.Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      dibujarElementos(ctx);
    };
    img.onerror = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      dibujarElementos(ctx);
    };
    img.src = template.fondo;
  };

  const dibujarElementos = (ctx) => {
    const configuracion = template.configuracion;

    elementos.forEach(elemento => {
      const config = configuracion[elemento.id];
      if (!config || !config.visible) return;

      ctx.save();
      
      if (elemento.id === 'qr') {
        // Dibujar QR simulado
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(config.x, config.y, config.width, config.width);
        ctx.strokeStyle = '#000000';
        ctx.strokeRect(config.x, config.y, config.width, config.width);
        
        // Dibujar patrones del QR
        ctx.fillStyle = '#000000';
        const cellSize = config.width / 25;
        for (let i = 0; i < 25; i++) {
          for (let j = 0; j < 25; j++) {
            if (Math.random() > 0.7) {
              ctx.fillRect(config.x + i * cellSize, config.y + j * cellSize, cellSize, cellSize);
            }
          }
        }
        
        // Texto VERIFICAR
        ctx.font = 'bold 7px Arial';
        ctx.fillStyle = '#1e40af';
        ctx.textAlign = 'center';
        ctx.fillText('VERIFICAR CERTIFICADO', config.x + config.width / 2, config.y + config.width + 15);
      } else if (elemento.id === 'logo') {
        // Dibujar logo simulado
        ctx.fillStyle = '#e5e7eb';
        ctx.fillRect(config.x, config.y, config.width, config.height);
        ctx.strokeStyle = '#9ca3af';
        ctx.strokeRect(config.x, config.y, config.width, config.height);
        
        ctx.fillStyle = '#6b7280';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('LOGO', config.x + config.width / 2, config.y + config.height / 2 + 4);
      } else {
        // Dibujar texto
        ctx.font = `${config.fontWeight === 'bold' ? 'bold' : 'normal'} ${config.fontSize}px Arial`;
        ctx.fillStyle = config.color;
        ctx.textAlign = 'center';
        
        let texto = config.texto || '';
        if (elemento.id === 'nombre') texto = 'Nombre del Participante';
        else if (elemento.id === 'rol') texto = 'Rol del Participante';
        else if (elemento.id === 'evento') texto = 'Nombre del Evento o Curso';
        else if (elemento.id === 'fecha') texto = 'Puno, 15 de Enero de 2024';
        else if (elemento.id === 'codigo') texto = 'Código: ABC123XYZ';
        
        ctx.fillText(texto, config.x + 200, config.y + config.fontSize);
      }
      
      // Dibujar borde de selección si es el elemento seleccionado
      if (elemento.id === selectedElement && !previewMode) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        
        if (elemento.id === 'qr' || elemento.id === 'logo') {
          ctx.strokeRect(config.x, config.y, config.width, elemento.id === 'qr' ? config.width : config.height);
        } else {
          const metrics = ctx.measureText(config.texto || 'Texto');
          ctx.strokeRect(config.x, config.y, 400, config.fontSize + 10);
        }
        ctx.setLineDash([]);
      }
      
      ctx.restore();
    });
  };

  const handleElementSelect = (elementId) => {
    setSelectedElement(elementId);
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Detectar qué elemento fue clickeado
    elementos.forEach(elemento => {
      const config = template.configuracion[elemento.id];
      if (!config || !config.visible) return;

      let hit = false;
      if (elemento.id === 'qr' || elemento.id === 'logo') {
        hit = x >= config.x && x <= config.x + config.width && 
              y >= config.y && y <= config.y + (elemento.id === 'qr' ? config.width : config.height);
      } else {
        hit = x >= config.x && x <= config.x + 400 && 
              y >= config.y && y <= config.y + (config.fontSize || 14) + 10;
      }

      if (hit) {
        setSelectedElement(elemento.id);
      }
    });
  };

  const handleMouseDown = (e) => {
    if (previewMode) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const config = template.configuracion[selectedElement];
    if (!config) return;

    let hit = false;
    if (selectedElement === 'qr' || selectedElement === 'logo') {
      hit = x >= config.x && x <= config.x + config.width && 
            y >= config.y && y <= config.y + (selectedElement === 'qr' ? config.width : config.height);
    } else {
      hit = x >= config.x && x <= config.x + 400 && 
            y >= config.y && y <= config.y + (config.fontSize || 14) + 10;
    }

    if (hit) {
      setIsDragging(true);
      setDragStart({ x: x - config.x, y: y - config.y });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || previewMode) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setTemplate(prev => ({
      ...prev,
      configuracion: {
        ...prev.configuracion,
        [selectedElement]: {
          ...prev.configuracion[selectedElement],
          x: x - dragStart.x,
          y: y - dragStart.y
        }
      }
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updateElementConfig = (property, value) => {
    setTemplate(prev => ({
      ...prev,
      configuracion: {
        ...prev.configuracion,
        [selectedElement]: {
          ...prev.configuracion[selectedElement],
          [property]: value
        }
      }
    }));
  };

  const updateElementConfigFor = (elementId, property, value) => {
    setTemplate(prev => ({
      ...prev,
      configuracion: {
        ...prev.configuracion,
        [elementId]: {
          ...prev.configuracion[elementId],
          [property]: value
        }
      }
    }));
  };

  const handleSave = async () => {
    try {
      onSave({ nombre: template.nombre, fondo: template.fondo, configuracion: template.configuracion });
    } catch (error) {
      console.error('Error guardando plantilla:', error);
      alert('Error al guardar la plantilla');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Diseñador de Certificados</h2>
            <p className="text-gray-600">Diseña la plantilla de certificados con drag & drop</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant={previewMode ? "secondary" : "outline"}
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center"
            >
              {previewMode ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {previewMode ? 'Salir Vista Previa' : 'Vista Previa'}
            </Button>
            <Button onClick={handleSave} className="flex items-center">
              <Save className="w-4 h-4 mr-2" />
              Guardar Plantilla
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Panel Izquierdo - Controles */}
          <div className="w-80 bg-gray-50 border-r p-4 overflow-y-auto">
            {/* Nombre de Plantilla */}
            <div className="mb-6">
              <Label htmlFor="templateName">Nombre de Plantilla</Label>
              <Input
                id="templateName"
                value={template.nombre}
                onChange={(e) => setTemplate(prev => ({ ...prev, nombre: e.target.value }))}
                className="mt-1"
              />
            </div>

            {/* Cargar Fondo */}
            <div className="mb-6">
              <Label>Imagen de Fondo</Label>
              <div className="mt-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        setTemplate(prev => ({ ...prev, fondo: e.target.result }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="text-sm"
                />
              </div>
            </div>

            {/* Lista de Elementos */}
            <div className="mb-6">
              <Label>Elementos del Certificado</Label>
              <div className="mt-2 space-y-2">
                {elementos.map(elemento => (
                  <div
                    key={elemento.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedElement === elemento.id 
                        ? 'bg-blue-100 border-blue-300' 
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => handleElementSelect(elemento.id)}
                  >
                    <div className="flex items-center">
                      <elemento.icon className="w-4 h-4 mr-3 text-gray-600" />
                      <span className="font-medium">{elemento.label}</span>
                      <Switch
                        checked={!!template.configuracion[elemento.id]?.visible}
                        onChange={(checked) => updateElementConfigFor(elemento.id, 'visible', checked)}
                        className="ml-auto"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Propiedades del Elemento Seleccionado */}
            {selectedElement && template.configuracion[selectedElement] && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">Propiedades</h3>
                
                {selectedElement !== 'qr' && selectedElement !== 'logo' && (
                  <>
                    <div>
                      <Label>Texto (opcional)</Label>
                      <Input
                        value={template.configuracion[selectedElement].texto || ''}
                        onChange={(e) => updateElementConfig('texto', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Tamaño de Fuente</Label>
                      <Slider
                        value={[template.configuracion[selectedElement].fontSize || 14]}
                        onValueChange={(value) => updateElementConfig('fontSize', value[0])}
                        min={8}
                        max={48}
                        step={1}
                        className="mt-2"
                      />
                      <span className="text-sm text-gray-500">{template.configuracion[selectedElement].fontSize || 14}px</span>
                    </div>
                    <div>
                      <Label>Color</Label>
                      <div className="flex items-center mt-1">
                        <Input
                          type="color"
                          value={template.configuracion[selectedElement].color || '#000000'}
                          onChange={(e) => updateElementConfig('color', e.target.value)}
                          className="w-12 h-8 p-1"
                        />
                        <Input
                          value={template.configuracion[selectedElement].color || '#000000'}
                          onChange={(e) => updateElementConfig('color', e.target.value)}
                          className="ml-2 flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Peso de Fuente</Label>
                      <Select
                        options={[
                          { label: 'Normal', value: 'normal' },
                          { label: 'Negrita', value: 'bold' },
                        ]}
                        value={template.configuracion[selectedElement].fontWeight || 'normal'}
                        onChange={(value) => updateElementConfig('fontWeight', value)}
                      />
                    </div>
                  </>
                )}

                {(selectedElement === 'qr' || selectedElement === 'logo') && (
                  <div>
                    <Label>Tamaño</Label>
                    <Slider
                      value={[template.configuracion[selectedElement].width || 80]}
                      onValueChange={(value) => {
                        updateElementConfig('width', value[0]);
                        if (selectedElement === 'logo') {
                          updateElementConfig('height', value[0]);
                        }
                      }}
                      min={20}
                      max={200}
                      step={10}
                      className="mt-2"
                    />
                    <span className="text-sm text-gray-500">{template.configuracion[selectedElement].width || 80}px</span>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-2">Posición actual:</p>
                  <p className="text-sm font-mono">
                    X: {Math.round(template.configuracion[selectedElement].x || 0)}px, 
                    Y: {Math.round(template.configuracion[selectedElement].y || 0)}px
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Área de Diseño - Canvas */}
          <div className="flex-1 bg-white p-4 overflow-auto">
            <div className="border rounded-lg bg-gray-100 p-4 min-h-full">
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="border bg-white cursor-pointer shadow-lg"
                onClick={handleCanvasClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateDesigner;
