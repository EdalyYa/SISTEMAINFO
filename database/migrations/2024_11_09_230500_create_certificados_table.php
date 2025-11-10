<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('certificados', function (Blueprint $table) {
            $table->id();
            $table->string('dni', 8)->index(); // DNI del estudiante
            $table->string('nombre_completo'); // Nombre completo del estudiante
            $table->string('tipo_certificado'); // Tipo de certificado (seminario, curso, etc.)
            $table->string('nombre_evento'); // Nombre del evento/curso
            $table->text('descripcion_evento')->nullable(); // Descripción del evento
            $table->date('fecha_inicio'); // Fecha de inicio del evento
            $table->date('fecha_fin'); // Fecha de fin del evento
            $table->integer('horas_academicas'); // Horas académicas
            $table->date('fecha_emision'); // Fecha de emisión del certificado
            $table->string('plantilla_certificado'); // Nombre del archivo de plantilla
            $table->string('codigo_verificacion')->unique(); // Código único para verificación
            $table->boolean('activo')->default(true); // Si el certificado está activo
            $table->timestamps();
            
            // Índices para búsquedas rápidas
            $table->index(['dni', 'activo']);
            $table->index('codigo_verificacion');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('certificados');
    }
};