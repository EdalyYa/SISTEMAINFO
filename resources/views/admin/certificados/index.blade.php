@extends('layouts.app')

@section('title', 'Gestión de Certificados')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h3 class="card-title mb-0">
                        <i class="fas fa-certificate text-primary"></i>
                        Gestión de Certificados
                    </h3>
                    <a href="{{ route('admin.certificados.create') }}" class="btn btn-primary">
                        <i class="fas fa-plus"></i> Nuevo Certificado
                    </a>
                </div>
                
                <div class="card-body">
                    <!-- Formulario de búsqueda por DNI -->
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <div class="input-group">
                                <input type="text" id="buscarDni" class="form-control" placeholder="Buscar por DNI..." maxlength="8">
                                <button class="btn btn-outline-secondary" type="button" id="btnBuscar">
                                    <i class="fas fa-search"></i> Buscar
                                </button>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <button class="btn btn-outline-info" type="button" id="btnMostrarTodos">
                                <i class="fas fa-list"></i> Mostrar Todos
                            </button>
                        </div>
                    </div>

                    <!-- Resultados de búsqueda -->
                    <div id="resultadosBusqueda" class="d-none">
                        <h5 class="text-primary">Resultados de Búsqueda</h5>
                        <div id="listaCertificados"></div>
                        <hr>
                    </div>

                    <!-- Tabla de certificados -->
                    <div class="table-responsive">
                        <table class="table table-striped table-hover">
                            <thead class="table-dark">
                                <tr>
                                    <th>DNI</th>
                                    <th>Nombre Completo</th>
                                    <th>Tipo</th>
                                    <th>Evento</th>
                                    <th>Período</th>
                                    <th>Horas</th>
                                    <th>Fecha Emisión</th>
                                    <th>Código</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($certificados as $certificado)
                                <tr>
                                    <td><span class="badge bg-secondary">{{ $certificado->dni }}</span></td>
                                    <td>{{ $certificado->nombre_completo }}</td>
                                    <td>
                                        <span class="badge bg-info">{{ $certificado->tipo_certificado }}</span>
                                    </td>
                                    <td>{{ Str::limit($certificado->nombre_evento, 30) }}</td>
                                    <td>{{ $certificado->periodo_evento }}</td>
                                    <td>
                                        <span class="badge bg-success">{{ $certificado->horas_academicas }}h</span>
                                    </td>
                                    <td>{{ $certificado->fecha_emision->format('d/m/Y') }}</td>
                                    <td>
                                        <small class="text-muted">{{ $certificado->codigo_verificacion }}</small>
                                    </td>
                                    <td>
                                        <div class="btn-group" role="group">
                                            <a href="{{ route('admin.certificados.pdf', $certificado->id) }}" 
                                               class="btn btn-sm btn-outline-danger" 
                                               title="Descargar PDF">
                                                <i class="fas fa-file-pdf"></i>
                                            </a>
                                            <button type="button" 
                                                    class="btn btn-sm btn-outline-warning" 
                                                    onclick="verificarCertificado('{{ $certificado->codigo_verificacion }}')"
                                                    title="Verificar">
                                                <i class="fas fa-check-circle"></i>
                                            </button>
                                            <form method="POST" 
                                                  action="{{ route('admin.certificados.destroy', $certificado->id) }}" 
                                                  class="d-inline"
                                                  onsubmit="return confirm('¿Está seguro de desactivar este certificado?')">
                                                @csrf
                                                @method('DELETE')
                                                <button type="submit" 
                                                        class="btn btn-sm btn-outline-danger" 
                                                        title="Desactivar">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                                @empty
                                <tr>
                                    <td colspan="9" class="text-center text-muted py-4">
                                        <i class="fas fa-certificate fa-3x mb-3 d-block"></i>
                                        No hay certificados registrados
                                    </td>
                                </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>

                    <!-- Paginación -->
                    @if($certificados->hasPages())
                    <div class="d-flex justify-content-center mt-4">
                        {{ $certificados->links() }}
                    </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Modal para verificación de certificado -->
<div class="modal fade" id="modalVerificacion" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">
                    <i class="fas fa-check-circle text-success"></i>
                    Verificación de Certificado
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" id="contenidoVerificacion">
                <!-- Contenido dinámico -->
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
$(document).ready(function() {
    // Búsqueda por DNI
    $('#btnBuscar').click(function() {
        buscarPorDni();
    });
    
    $('#buscarDni').keypress(function(e) {
        if (e.which == 13) {
            buscarPorDni();
        }
    });
    
    // Mostrar todos los certificados
    $('#btnMostrarTodos').click(function() {
        $('#resultadosBusqueda').addClass('d-none');
        location.reload();
    });
    
    // Solo permitir números en el campo DNI
    $('#buscarDni').on('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
});

function buscarPorDni() {
    const dni = $('#buscarDni').val().trim();
    
    if (dni.length !== 8) {
        Swal.fire({
            icon: 'warning',
            title: 'DNI Inválido',
            text: 'El DNI debe tener exactamente 8 dígitos'
        });
        return;
    }
    
    // Mostrar loading
    $('#btnBuscar').html('<i class="fas fa-spinner fa-spin"></i> Buscando...');
    
    $.ajax({
        url: '{{ route("admin.certificados.buscar") }}',
        method: 'POST',
        data: {
            dni: dni,
            _token: '{{ csrf_token() }}'
        },
        success: function(response) {
            if (response.success) {
                mostrarResultados(response.certificados);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.message
                });
            }
        },
        error: function() {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al realizar la búsqueda'
            });
        },
        complete: function() {
            $('#btnBuscar').html('<i class="fas fa-search"></i> Buscar');
        }
    });
}

function mostrarResultados(certificados) {
    let html = '';
    
    if (certificados.length === 0) {
        html = '<div class="alert alert-info"><i class="fas fa-info-circle"></i> No se encontraron certificados para este DNI</div>';
    } else {
        html = '<div class="row">';
        certificados.forEach(function(cert) {
            html += `
                <div class="col-md-6 mb-3">
                    <div class="card border-primary">
                        <div class="card-body">
                            <h6 class="card-title text-primary">${cert.nombre_completo}</h6>
                            <p class="card-text">
                                <strong>Evento:</strong> ${cert.nombre_evento}<br>
                                <strong>Tipo:</strong> <span class="badge bg-info">${cert.tipo_certificado}</span><br>
                                <strong>Período:</strong> ${cert.periodo_evento}<br>
                                <strong>Horas:</strong> <span class="badge bg-success">${cert.horas_academicas}h</span><br>
                                <strong>Código:</strong> <small class="text-muted">${cert.codigo_verificacion}</small>
                            </p>
                            <div class="btn-group w-100">
                                <a href="/admin/certificados/${cert.id}/pdf" class="btn btn-sm btn-outline-danger">
                                    <i class="fas fa-file-pdf"></i> PDF
                                </a>
                                <button class="btn btn-sm btn-outline-warning" onclick="verificarCertificado('${cert.codigo_verificacion}')">
                                    <i class="fas fa-check-circle"></i> Verificar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
    }
    
    $('#listaCertificados').html(html);
    $('#resultadosBusqueda').removeClass('d-none');
}

function verificarCertificado(codigo) {
    $.ajax({
        url: '{{ route("admin.certificados.verificar") }}',
        method: 'POST',
        data: {
            codigo: codigo,
            _token: '{{ csrf_token() }}'
        },
        success: function(response) {
            if (response.success) {
                const cert = response.certificado;
                const html = `
                    <div class="text-center">
                        <div class="alert alert-success">
                            <i class="fas fa-check-circle fa-2x mb-2"></i>
                            <h5>Certificado Válido</h5>
                        </div>
                        <div class="text-start">
                            <p><strong>Nombre:</strong> ${cert.nombre_completo}</p>
                            <p><strong>Evento:</strong> ${cert.nombre_evento}</p>
                            <p><strong>Tipo:</strong> <span class="badge bg-info">${cert.tipo_certificado}</span></p>
                            <p><strong>Período:</strong> ${cert.periodo_evento}</p>
                            <p><strong>Horas Académicas:</strong> <span class="badge bg-success">${cert.horas_academicas}h</span></p>
                            <p><strong>Fecha de Emisión:</strong> ${cert.fecha_emision}</p>
                            <p><strong>Código:</strong> <code>${cert.codigo_verificacion}</code></p>
                        </div>
                    </div>
                `;
                $('#contenidoVerificacion').html(html);
            } else {
                $('#contenidoVerificacion').html(`
                    <div class="text-center">
                        <div class="alert alert-danger">
                            <i class="fas fa-times-circle fa-2x mb-2"></i>
                            <h5>Certificado No Válido</h5>
                            <p>${response.message}</p>
                        </div>
                    </div>
                `);
            }
            $('#modalVerificacion').modal('show');
        },
        error: function() {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al verificar el certificado'
            });
        }
    });
}
</script>
@endpush

@push('styles')
<style>
.card {
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    border: 1px solid rgba(0, 0, 0, 0.125);
}

.table th {
    border-top: none;
    font-weight: 600;
}

.btn-group .btn {
    border-radius: 0;
}

.btn-group .btn:first-child {
    border-top-left-radius: 0.375rem;
    border-bottom-left-radius: 0.375rem;
}

.btn-group .btn:last-child {
    border-top-right-radius: 0.375rem;
    border-bottom-right-radius: 0.375rem;
}

.badge {
    font-size: 0.75em;
}

.modal-header {
    background-color: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
}
</style>
@endpush