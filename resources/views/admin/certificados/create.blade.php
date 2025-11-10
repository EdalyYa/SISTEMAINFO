@extends('layouts.app')

@section('title', 'Crear Nuevo Certificado')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title mb-0">
                        <i class="fas fa-plus-circle text-primary"></i>
                        Crear Nuevo Certificado
                    </h3>
                    <div class="card-tools">
                        <a href="{{ route('admin.certificados.index') }}" class="btn btn-outline-secondary">
                            <i class="fas fa-arrow-left"></i> Volver
                        </a>
                    </div>
                </div>
                
                <form method="POST" action="{{ route('admin.certificados.store') }}" id="formCertificado">
                    @csrf
                    <div class="card-body">
                        <div class="row">
                            <!-- Información del Estudiante -->
                            <div class="col-md-6">
                                <div class="card border-primary">
                                    <div class="card-header bg-primary text-white">
                                        <h5 class="mb-0">
                                            <i class="fas fa-user"></i>
                                            Información del Estudiante
                                        </h5>
                                    </div>
                                    <div class="card-body">
                                        <div class="mb-3">
                                            <label for="dni" class="form-label">DNI *</label>
                                            <input type="text" 
                                                   class="form-control @error('dni') is-invalid @enderror" 
                                                   id="dni" 
                                                   name="dni" 
                                                   value="{{ old('dni') }}"
                                                   maxlength="8" 
                                                   placeholder="Ingrese el DNI del estudiante"
                                                   required>
                                            @error('dni')
                                                <div class="invalid-feedback">{{ $message }}</div>
                                            @enderror
                                        </div>
                                        
                                        <div class="mb-3">
                                            <label for="nombre_completo" class="form-label">Nombre Completo *</label>
                                            <input type="text" 
                                                   class="form-control @error('nombre_completo') is-invalid @enderror" 
                                                   id="nombre_completo" 
                                                   name="nombre_completo" 
                                                   value="{{ old('nombre_completo') }}"
                                                   placeholder="Ingrese el nombre completo del estudiante"
                                                   required>
                                            @error('nombre_completo')
                                                <div class="invalid-feedback">{{ $message }}</div>
                                            @enderror
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Información del Evento -->
                            <div class="col-md-6">
                                <div class="card border-success">
                                    <div class="card-header bg-success text-white">
                                        <h5 class="mb-0">
                                            <i class="fas fa-calendar-alt"></i>
                                            Información del Evento
                                        </h5>
                                    </div>
                                    <div class="card-body">
                                        <div class="mb-3">
                                            <label for="tipo_certificado" class="form-label">Tipo de Certificado *</label>
                                            <select class="form-select @error('tipo_certificado') is-invalid @enderror" 
                                                    id="tipo_certificado" 
                                                    name="tipo_certificado" 
                                                    required>
                                                <option value="">Seleccione el tipo</option>
                                                <option value="Seminario" {{ old('tipo_certificado') == 'Seminario' ? 'selected' : '' }}>Seminario</option>
                                                <option value="Curso" {{ old('tipo_certificado') == 'Curso' ? 'selected' : '' }}>Curso</option>
                                                <option value="Taller" {{ old('tipo_certificado') == 'Taller' ? 'selected' : '' }}>Taller</option>
                                                <option value="Conferencia" {{ old('tipo_certificado') == 'Conferencia' ? 'selected' : '' }}>Conferencia</option>
                                                <option value="Diplomado" {{ old('tipo_certificado') == 'Diplomado' ? 'selected' : '' }}>Diplomado</option>
                                                <option value="Capacitación" {{ old('tipo_certificado') == 'Capacitación' ? 'selected' : '' }}>Capacitación</option>
                                            </select>
                                            @error('tipo_certificado')
                                                <div class="invalid-feedback">{{ $message }}</div>
                                            @enderror
                                        </div>
                                        
                                        <div class="mb-3">
                                            <label for="nombre_evento" class="form-label">Nombre del Evento *</label>
                                            <input type="text" 
                                                   class="form-control @error('nombre_evento') is-invalid @enderror" 
                                                   id="nombre_evento" 
                                                   name="nombre_evento" 
                                                   value="{{ old('nombre_evento') }}"
                                                   placeholder="Ej: Perspectivas para el Desarrollo Regional - Puno al 2030"
                                                   required>
                                            @error('nombre_evento')
                                                <div class="invalid-feedback">{{ $message }}</div>
                                            @enderror
                                        </div>
                                        
                                        <div class="mb-3">
                                            <label for="descripcion_evento" class="form-label">Descripción del Evento</label>
                                            <textarea class="form-control @error('descripcion_evento') is-invalid @enderror" 
                                                      id="descripcion_evento" 
                                                      name="descripcion_evento" 
                                                      rows="3"
                                                      placeholder="Descripción adicional del evento (opcional)">{{ old('descripcion_evento') }}</textarea>
                                            @error('descripcion_evento')
                                                <div class="invalid-feedback">{{ $message }}</div>
                                            @enderror
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row mt-4">
                            <!-- Fechas y Duración -->
                            <div class="col-md-6">
                                <div class="card border-warning">
                                    <div class="card-header bg-warning text-dark">
                                        <h5 class="mb-0">
                                            <i class="fas fa-clock"></i>
                                            Fechas y Duración
                                        </h5>
                                    </div>
                                    <div class="card-body">
                                        <div class="row">
                                            <div class="col-md-6">
                                                <div class="mb-3">
                                                    <label for="fecha_inicio" class="form-label">Fecha de Inicio *</label>
                                                    <input type="date" 
                                                           class="form-control @error('fecha_inicio') is-invalid @enderror" 
                                                           id="fecha_inicio" 
                                                           name="fecha_inicio" 
                                                           value="{{ old('fecha_inicio') }}"
                                                           required>
                                                    @error('fecha_inicio')
                                                        <div class="invalid-feedback">{{ $message }}</div>
                                                    @enderror
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <div class="mb-3">
                                                    <label for="fecha_fin" class="form-label">Fecha de Fin *</label>
                                                    <input type="date" 
                                                           class="form-control @error('fecha_fin') is-invalid @enderror" 
                                                           id="fecha_fin" 
                                                           name="fecha_fin" 
                                                           value="{{ old('fecha_fin') }}"
                                                           required>
                                                    @error('fecha_fin')
                                                        <div class="invalid-feedback">{{ $message }}</div>
                                                    @enderror
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div class="mb-3">
                                            <label for="horas_academicas" class="form-label">Horas Académicas *</label>
                                            <div class="input-group">
                                                <input type="number" 
                                                       class="form-control @error('horas_academicas') is-invalid @enderror" 
                                                       id="horas_academicas" 
                                                       name="horas_academicas" 
                                                       value="{{ old('horas_academicas') }}"
                                                       min="1" 
                                                       max="1000"
                                                       placeholder="Ej: 41"
                                                       required>
                                                <span class="input-group-text">horas</span>
                                                @error('horas_academicas')
                                                    <div class="invalid-feedback">{{ $message }}</div>
                                                @enderror
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Plantilla del Certificado -->
                            <div class="col-md-6">
                                <div class="card border-info">
                                    <div class="card-header bg-info text-white">
                                        <h5 class="mb-0">
                                            <i class="fas fa-file-image"></i>
                                            Plantilla del Certificado
                                        </h5>
                                    </div>
                                    <div class="card-body">
                                        <div class="mb-3">
                                            <label for="plantilla_certificado" class="form-label">Seleccionar Plantilla *</label>
                                            <select class="form-select @error('plantilla_certificado') is-invalid @enderror" 
                                                    id="plantilla_certificado" 
                                                    name="plantilla_certificado" 
                                                    required>
                                                <option value="">Seleccione una plantilla</option>
                                                @foreach($plantillas as $archivo => $nombre)
                                                    <option value="{{ $archivo }}" {{ old('plantilla_certificado') == $archivo ? 'selected' : '' }}>
                                                        {{ $nombre }}
                                                    </option>
                                                @endforeach
                                            </select>
                                            @error('plantilla_certificado')
                                                <div class="invalid-feedback">{{ $message }}</div>
                                            @enderror
                                        </div>
                                        
                                        <!-- Vista previa de la plantilla -->
                                        <div id="vistaPrevia" class="d-none">
                                            <label class="form-label">Vista Previa:</label>
                                            <div class="border rounded p-2 text-center" style="max-height: 200px; overflow: hidden;">
                                                <div id="contenidoPrevia"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card-footer">
                        <div class="row">
                            <div class="col-md-6">
                                <button type="submit" class="btn btn-primary btn-lg">
                                    <i class="fas fa-save"></i>
                                    Crear Certificado
                                </button>
                                <button type="reset" class="btn btn-outline-secondary btn-lg ms-2">
                                    <i class="fas fa-undo"></i>
                                    Limpiar
                                </button>
                            </div>
                            <div class="col-md-6 text-end">
                                <small class="text-muted">
                                    <i class="fas fa-info-circle"></i>
                                    Los campos marcados con (*) son obligatorios
                                </small>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
$(document).ready(function() {
    // Solo permitir números en el campo DNI
    $('#dni').on('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
    
    // Validar que la fecha de fin sea posterior a la de inicio
    $('#fecha_inicio, #fecha_fin').change(function() {
        const fechaInicio = $('#fecha_inicio').val();
        const fechaFin = $('#fecha_fin').val();
        
        if (fechaInicio && fechaFin && fechaFin < fechaInicio) {
            Swal.fire({
                icon: 'warning',
                title: 'Fechas Inválidas',
                text: 'La fecha de fin debe ser posterior o igual a la fecha de inicio'
            });
            $('#fecha_fin').val('');
        }
    });
    
    // Vista previa de la plantilla
    $('#plantilla_certificado').change(function() {
        const plantilla = $(this).val();
        if (plantilla) {
            mostrarVistaPrevia(plantilla);
        } else {
            $('#vistaPrevia').addClass('d-none');
        }
    });
    
    // Validación del formulario
    $('#formCertificado').submit(function(e) {
        const dni = $('#dni').val();
        if (dni.length !== 8) {
            e.preventDefault();
            Swal.fire({
                icon: 'error',
                title: 'DNI Inválido',
                text: 'El DNI debe tener exactamente 8 dígitos'
            });
            return false;
        }
        
        // Mostrar confirmación
        e.preventDefault();
        Swal.fire({
            title: '¿Crear Certificado?',
            text: 'Se creará un nuevo certificado con la información proporcionada',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, crear',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                // Mostrar loading
                Swal.fire({
                    title: 'Creando Certificado...',
                    text: 'Por favor espere',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
                
                // Enviar formulario
                this.submit();
            }
        });
    });
});

function mostrarVistaPrevia(plantilla) {
    // Simular vista previa (en un caso real, podrías cargar la imagen SVG)
    const previews = {
        'seminario-desarrollo.svg': '<div class="bg-light p-3 rounded"><h6 class="text-primary">Seminario de Desarrollo Regional</h6><p class="small text-muted">Plantilla para seminarios y eventos académicos</p></div>'
    };
    
    const contenido = previews[plantilla] || '<div class="bg-light p-3 rounded"><h6 class="text-info">Vista Previa</h6><p class="small text-muted">Plantilla: ' + plantilla + '</p></div>';
    
    $('#contenidoPrevia').html(contenido);
    $('#vistaPrevia').removeClass('d-none');
}
</script>
@endpush

@push('styles')
<style>
.card {
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    border: 1px solid rgba(0, 0, 0, 0.125);
}

.card-header {
    font-weight: 600;
}

.form-label {
    font-weight: 500;
    color: #495057;
}

.btn-lg {
    padding: 0.75rem 1.5rem;
    font-size: 1.1rem;
}

.border-primary {
    border-color: #0d6efd !important;
}

.border-success {
    border-color: #198754 !important;
}

.border-warning {
    border-color: #ffc107 !important;
}

.border-info {
    border-color: #0dcaf0 !important;
}

.bg-primary {
    background-color: #0d6efd !important;
}

.bg-success {
    background-color: #198754 !important;
}

.bg-warning {
    background-color: #ffc107 !important;
}

.bg-info {
    background-color: #0dcaf0 !important;
}

#vistaPrevia {
    transition: all 0.3s ease;
}
</style>
@endpush