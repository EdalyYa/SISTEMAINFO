<?php

namespace App\Http\Controllers;

use App\Models\Certificado;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CertificadoController extends Controller
{
    /**
     * Mostrar el panel de administración de certificados
     */
    public function index()
    {
        $certificados = Certificado::where('activo', true)
                                 ->orderBy('fecha_emision', 'desc')
                                 ->paginate(15);
        
        return view('admin.certificados.index', compact('certificados'));
    }

    /**
     * Mostrar formulario para crear nuevo certificado
     */
    public function create()
    {
        // Obtener plantillas disponibles
        $plantillas = $this->obtenerPlantillasDisponibles();
        
        return view('admin.certificados.create', compact('plantillas'));
    }

    /**
     * Almacenar nuevo certificado
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'dni' => 'required|string|size:8',
            'nombre_completo' => 'required|string|max:255',
            'tipo_certificado' => 'required|string|max:100',
            'nombre_evento' => 'required|string|max:255',
            'descripcion_evento' => 'nullable|string',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'horas_academicas' => 'required|integer|min:1',
            'plantilla_certificado' => 'required|string'
        ], [
            'dni.required' => 'El DNI es obligatorio',
            'dni.size' => 'El DNI debe tener exactamente 8 dígitos',
            'nombre_completo.required' => 'El nombre completo es obligatorio',
            'tipo_certificado.required' => 'El tipo de certificado es obligatorio',
            'nombre_evento.required' => 'El nombre del evento es obligatorio',
            'fecha_inicio.required' => 'La fecha de inicio es obligatoria',
            'fecha_fin.required' => 'La fecha de fin es obligatoria',
            'fecha_fin.after_or_equal' => 'La fecha de fin debe ser posterior o igual a la fecha de inicio',
            'horas_academicas.required' => 'Las horas académicas son obligatorias',
            'horas_academicas.min' => 'Las horas académicas deben ser al menos 1',
            'plantilla_certificado.required' => 'Debe seleccionar una plantilla'
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                           ->withErrors($validator)
                           ->withInput();
        }

        try {
            $certificado = Certificado::create($request->all());
            
            return redirect()->route('admin.certificados.index')
                           ->with('success', 'Certificado creado exitosamente. Código: ' . $certificado->codigo_verificacion);
        } catch (\Exception $e) {
            return redirect()->back()
                           ->with('error', 'Error al crear el certificado: ' . $e->getMessage())
                           ->withInput();
        }
    }

    /**
     * Buscar certificados por DNI
     */
    public function buscarPorDni(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'dni' => 'required|string|size:8'
        ], [
            'dni.required' => 'El DNI es obligatorio',
            'dni.size' => 'El DNI debe tener exactamente 8 dígitos'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ]);
        }

        $certificados = Certificado::buscarPorDni($request->dni);
        
        return response()->json([
            'success' => true,
            'certificados' => $certificados->map(function($cert) {
                return [
                    'id' => $cert->id,
                    'nombre_completo' => $cert->nombre_completo,
                    'tipo_certificado' => $cert->tipo_certificado,
                    'nombre_evento' => $cert->nombre_evento,
                    'periodo_evento' => $cert->periodo_evento,
                    'horas_academicas' => $cert->horas_academicas,
                    'fecha_emision' => $cert->fecha_emision->format('d/m/Y'),
                    'codigo_verificacion' => $cert->codigo_verificacion
                ];
            })
        ]);
    }

    /**
     * Generar PDF del certificado
     */
    public function generarPdf($id)
    {
        try {
            $certificado = Certificado::findOrFail($id);
            
            // Verificar que la plantilla existe
            $rutaPlantilla = public_path('src/Imagenes/certificados/' . $certificado->plantilla_certificado);
            if (!file_exists($rutaPlantilla)) {
                return redirect()->back()->with('error', 'Plantilla de certificado no encontrada');
            }

            // Generar HTML del certificado
            $html = $this->generarHtmlCertificado($certificado);
            
            // Generar PDF
            $pdf = Pdf::loadHTML($html)
                     ->setPaper('a4', 'landscape')
                     ->setOptions([
                         'defaultFont' => 'serif',
                         'isRemoteEnabled' => true,
                         'isHtml5ParserEnabled' => true
                     ]);
            
            $nombreArchivo = 'certificado_' . $certificado->dni . '_' . Str::slug($certificado->nombre_evento) . '.pdf';
            
            return $pdf->download($nombreArchivo);
            
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al generar el PDF: ' . $e->getMessage());
        }
    }

    /**
     * Verificar certificado por código
     */
    public function verificar(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'codigo' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Código de verificación requerido'
            ]);
        }

        $certificado = Certificado::verificarCodigo($request->codigo);
        
        if (!$certificado) {
            return response()->json([
                'success' => false,
                'message' => 'Certificado no encontrado o inválido'
            ]);
        }

        return response()->json([
            'success' => true,
            'certificado' => [
                'nombre_completo' => $certificado->nombre_completo,
                'tipo_certificado' => $certificado->tipo_certificado,
                'nombre_evento' => $certificado->nombre_evento,
                'periodo_evento' => $certificado->periodo_evento,
                'horas_academicas' => $certificado->horas_academicas,
                'fecha_emision' => $certificado->fecha_emision_formateada,
                'codigo_verificacion' => $certificado->codigo_verificacion
            ]
        ]);
    }

    /**
     * Obtener plantillas disponibles
     */
    private function obtenerPlantillasDisponibles()
    {
        $rutaCertificados = public_path('src/Imagenes/certificados');
        $plantillas = [];
        
        if (is_dir($rutaCertificados)) {
            $archivos = scandir($rutaCertificados);
            foreach ($archivos as $archivo) {
                if (pathinfo($archivo, PATHINFO_EXTENSION) === 'svg') {
                    $nombre = pathinfo($archivo, PATHINFO_FILENAME);
                    $plantillas[$archivo] = ucwords(str_replace(['-', '_'], ' ', $nombre));
                }
            }
        }
        
        return $plantillas;
    }

    /**
     * Generar HTML del certificado basado en la plantilla SVG
     */
    private function generarHtmlCertificado($certificado)
    {
        $rutaPlantilla = public_path('src/Imagenes/certificados/' . $certificado->plantilla_certificado);
        $svgContent = file_get_contents($rutaPlantilla);
        
        // Insertar el nombre del estudiante en el SVG
        // Buscar el área donde debe ir el nombre (después de "Por haber participado como")
        $nombreTexto = '<text x="480" y="340" fill="#1e40af" font-family="serif" font-size="18" font-weight="bold">' . 
                      htmlspecialchars($certificado->nombre_completo) . '</text>';
        
        // Insertar el nombre en el SVG
        $svgContent = str_replace(
            '<rect x="280" y="330" width="640" height="40" fill="none" stroke="none"/>',
            $nombreTexto,
            $svgContent
        );
        
        // Actualizar información dinámica si es necesario
        $svgContent = str_replace('{{nombre_evento}}', $certificado->nombre_evento, $svgContent);
        $svgContent = str_replace('{{horas_academicas}}', $certificado->horas_academicas, $svgContent);
        $svgContent = str_replace('{{fecha_emision}}', $certificado->fecha_emision_formateada, $svgContent);
        
        return '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Certificado - ' . $certificado->nombre_completo . '</title>
            <style>
                body { margin: 0; padding: 20px; }
                .certificado { width: 100%; height: auto; }
            </style>
        </head>
        <body>
            <div class="certificado">
                ' . $svgContent . '
            </div>
        </body>
        </html>';
    }

    /**
     * Desactivar certificado
     */
    public function destroy($id)
    {
        try {
            $certificado = Certificado::findOrFail($id);
            $certificado->update(['activo' => false]);
            
            return redirect()->route('admin.certificados.index')
                           ->with('success', 'Certificado desactivado exitosamente');
        } catch (\Exception $e) {
            return redirect()->back()
                           ->with('error', 'Error al desactivar el certificado: ' . $e->getMessage());
        }
    }
}