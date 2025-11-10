<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Certificado extends Model
{
    use HasFactory;

    protected $fillable = [
        'dni',
        'nombre_completo',
        'tipo_certificado',
        'nombre_evento',
        'descripcion_evento',
        'fecha_inicio',
        'fecha_fin',
        'horas_academicas',
        'fecha_emision',
        'plantilla_certificado',
        'codigo_verificacion',
        'activo'
    ];

    protected $casts = [
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
        'fecha_emision' => 'date',
        'activo' => 'boolean'
    ];

    /**
     * Generar código de verificación único al crear el certificado
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($certificado) {
            if (empty($certificado->codigo_verificacion)) {
                $certificado->codigo_verificacion = 'CERT-' . strtoupper(Str::random(8)) . '-' . date('Y');
            }
            if (empty($certificado->fecha_emision)) {
                $certificado->fecha_emision = now()->toDateString();
            }
        });
    }

    /**
     * Buscar certificados por DNI
     */
    public static function buscarPorDni($dni)
    {
        return self::where('dni', $dni)
                  ->where('activo', true)
                  ->orderBy('fecha_emision', 'desc')
                  ->get();
    }

    /**
     * Verificar si existe un certificado con el código dado
     */
    public static function verificarCodigo($codigo)
    {
        return self::where('codigo_verificacion', $codigo)
                  ->where('activo', true)
                  ->first();
    }

    /**
     * Obtener la ruta completa de la plantilla
     */
    public function getRutaPlantillaAttribute()
    {
        return public_path('src/Imagenes/certificados/' . $this->plantilla_certificado);
    }

    /**
     * Formatear el período del evento
     */
    public function getPeriodoEventoAttribute()
    {
        $inicio = $this->fecha_inicio->format('d/m/Y');
        $fin = $this->fecha_fin->format('d/m/Y');
        
        if ($inicio === $fin) {
            return $inicio;
        }
        
        return "del {$inicio} al {$fin}";
    }

    /**
     * Formatear la fecha de emisión
     */
    public function getFechaEmisionFormateadaAttribute()
    {
        $meses = [
            1 => 'Enero', 2 => 'Febrero', 3 => 'Marzo', 4 => 'Abril',
            5 => 'Mayo', 6 => 'Junio', 7 => 'Julio', 8 => 'Agosto',
            9 => 'Septiembre', 10 => 'Octubre', 11 => 'Noviembre', 12 => 'Diciembre'
        ];
        
        $fecha = $this->fecha_emision;
        return "Puno, {$fecha->day} de {$meses[$fecha->month]} del año {$fecha->year}.";
    }
}