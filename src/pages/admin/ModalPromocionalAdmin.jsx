import React, { useState, useEffect } from 'react';
import { ConfirmModal, useToast } from '../../components/ui';
import { API_BASE } from '@/config/api';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  CalendarIcon,
  PhotoIcon,
  TagIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const ModalPromocionalAdmin = () => {
  const toast = useToast ? useToast() : { success:()=>{}, error:()=>{}, warning:()=>{} };
  const [modales, setModales] = useState([]);
  const [cronograma, setCronograma] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCronogramaModal, setShowCronogramaModal] = useState(false);
  const [editingModal, setEditingModal] = useState(null);
  const [editingCronograma, setEditingCronograma] = useState(null);
  const [selectedModalId, setSelectedModalId] = useState(null);
  const [stats, setStats] = useState({});
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  // Estado del formulario principal
  const [formData, setFormData] = useState({
    titulo: '',
    subtitulo: '',
    descripcion: '',
    tipo: 'avisos',
    fecha_inicio: new Date().toISOString().slice(0,10),
    fecha_fin: '',
    activo: true,
    orden: 0,
    imagen: null,
    imagenes: [],
    video_tiktok_url: '',
    facebook_url: '',
    mostrar_en_primer_modal: false,
    url_accion: '',
    texto_boton_primario: '',
    texto_boton_secundario: ''
  });

  // Previews de imagen principal y adicionales
  const [imagePreview, setImagePreview] = useState('');
  const [extraPreviews, setExtraPreviews] = useState([]);

  // Estado del formulario de cronograma
  const [cronogramaFormData, setCronogramaFormData] = useState({
    fase: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    estado: 'pendiente',
    color: 'blue',
    icono: 'calendar',
    orden: 0,
    activo: true
  });

  const tiposModal = [
    { value: 'facebook', label: 'Facebook', color: 'blue' },
    { value: 'video', label: 'TikTok', color: 'black' },
    { value: 'flyer', label: 'Flyer', color: 'pink' },
    { value: 'cronograma', label: 'Cronograma', color: 'purple' },
    { value: 'avisos', label: 'Avisos', color: 'red' },
    { value: 'noticias', label: 'Noticias', color: 'indigo' }
  ];

  const gradientes = [
    'from-blue-500 to-purple-600',
    'from-green-500 to-teal-600',
    'from-orange-500 to-red-600',
    'from-purple-500 to-pink-600',
    'from-indigo-500 to-blue-600',
    'from-yellow-500 to-orange-600'
  ];

  const estadosCronograma = [
    { value: 'pendiente', label: 'Pendiente', color: 'gray' },
    { value: 'activo', label: 'Activo', color: 'green' },
    { value: 'finalizado', label: 'Finalizado', color: 'blue' }
  ];

  const coloresCronograma = [
    'blue', 'green', 'orange', 'purple', 'pink', 'indigo', 'yellow', 'red'
  ];

  const iconosCronograma = [
    'calendar', 'clock', 'user-plus', 'clipboard-document-list', 
    'academic-cap', 'document-text', 'check-circle', 'exclamation-triangle'
  ];

  // Construye URL de embed para publicaciones de Facebook
  const buildFacebookEmbed = (url) => {
    try {
      const href = encodeURIComponent(String(url || '').trim());
      if (!href) return null;
      return `https://www.facebook.com/plugins/post.php?href=${href}&show_text=true&width=500`;
    } catch {
      return null;
    }
  };

  // Extrae nombre de página desde una URL de Facebook
  const extractFacebookPageName = (url) => {
    try {
      const u = new URL(String(url));
      if (!/facebook\.com$/i.test(u.hostname) && !/\.facebook\.com$/i.test(u.hostname)) return 'Facebook';
      const firstSeg = (u.pathname || '/').split('/').filter(Boolean)[0] || '';
      const special = ['story.php', 'permalink.php', 'photo.php', 'share'];
      if (!firstSeg || special.includes(firstSeg)) {
        const idParam = u.searchParams.get('id') || u.searchParams.get('page_id');
        return idParam ? `ID ${idParam}` : 'Facebook';
      }
      return decodeURIComponent(firstSeg).replace(/[-_]/g, ' ');
    } catch {
      return 'Facebook';
    }
  };

  const getFacebookFavicon = () => 'https://www.facebook.com/favicon.ico';

  useEffect(() => {
    fetchModales();
    fetchStats();
  }, []);

  const fetchModales = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/modal-promocional/admin/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setModales(data);
      } else {
        console.error('Error al obtener modales');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/modal-promocional/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
    }
  };

  const fetchCronograma = async (modalId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/modal-promocional/admin/${modalId}/cronograma`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCronograma(data);
      }
    } catch (error) {
      console.error('Error al obtener cronograma:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const urlBase = `${API_BASE}/modal-promocional/admin`;
      const isEditing = Boolean(editingModal);

      // Si es tipo 'flyer' y hay varias imágenes seleccionadas, crear múltiples modales (uno por imagen)
      if (!isEditing && formData.tipo === 'flyer') {
        const allImages = [];
        if (formData.imagen) allImages.push(formData.imagen);
        if (Array.isArray(formData.imagenes) && formData.imagenes.length > 0) {
          allImages.push(...formData.imagenes);
        }

        if (allImages.length === 0) {
          alert('Seleccione al menos una imagen para crear flyers.');
          return;
        }

        let successCount = 0;
        for (const img of allImages) {
          const fd = new FormData();
          fd.append('imagen', img);
          fd.append('titulo', formData.titulo);
          fd.append('tipo', formData.tipo);
          fd.append('fecha_inicio', formData.fecha_inicio || '');
          fd.append('fecha_fin', formData.fecha_fin || '');
          fd.append('activo', formData.activo ? '1' : '0');
          fd.append('orden', formData.orden != null ? String(formData.orden) : '0');
          fd.append('mostrar_en_primer_modal', formData.mostrar_en_primer_modal ? '1' : '0');

          const res = await fetch(urlBase, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: fd
          });
          if (res.ok) successCount++;
        }

        if (successCount > 0) {
          await fetchModales();
          await fetchStats();
          setShowModal(false);
          resetForm();
        } else {
          console.error('Error al guardar todos los flyers');
          alert('No se pudo crear ningún flyer.');
        }
        return;
      }

      // Flujo normal (crear/editar un solo modal)
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'imagen' && formData[key]) {
          formDataToSend.append('imagen', formData[key]);
        } else if (key === 'imagenes' && Array.isArray(formData[key])) {
          formData[key].forEach(f => formDataToSend.append('imagenes', f));
        } else if (key !== 'imagen') {
          formDataToSend.append(key, formData[key]);
        }
      });

      const url = isEditing ? `${urlBase}/${editingModal.id}` : urlBase;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataToSend
      });

      if (response.ok) {
        await fetchModales();
        await fetchStats();
        setShowModal(false);
        resetForm();
      } else {
        console.error('Error al guardar modal');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCronogramaSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      
      const url = editingCronograma 
        ? `${API_BASE}/modal-promocional/admin/cronograma/${editingCronograma.id}`
        : `${API_BASE}/modal-promocional/admin/${selectedModalId}/cronograma`;
      
      const method = editingCronograma ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cronogramaFormData)
      });

      if (response.ok) {
        await fetchCronograma(selectedModalId);
        setShowCronogramaModal(false);
        resetCronogramaForm();
      } else {
        console.error('Error al guardar elemento de cronograma');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteAction, setDeleteAction] = useState(null);

  const handleDelete = (id) => {
    setConfirmMessage('¿Estás seguro de que quieres eliminar este modal? Esta acción es permanente.');
    setDeleteAction(() => async () => {
      try {
        setDeleting(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/modal-promocional/admin/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          await fetchModales();
          await fetchStats();
          try { toast.success('Modal eliminado', { title: 'Eliminación exitosa', duration: 5000 }); } catch(_){}
        } else {
          console.error('Error al eliminar modal');
          try { toast.error('Error al eliminar modal', { title: 'Error', duration: 6000 }); } catch(_){}
        }
      } catch (error) {
        console.error('Error:', error);
        try { toast.error('Error de conexión', { title: 'Error', duration: 6000 }); } catch(_){}
      } finally {
        setDeleting(false);
        setConfirmOpen(false);
        setDeleteAction(null);
      }
    });
    setConfirmOpen(true);
  };

  const handleDeleteCronograma = (cronogramaId) => {
    setConfirmMessage('¿Estás seguro de que quieres eliminar este elemento del cronograma? Esta acción es permanente.');
    setDeleteAction(() => async () => {
      try {
        setDeleting(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/modal-promocional/admin/cronograma/${cronogramaId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          await fetchCronograma(selectedModalId);
          try { toast.success('Elemento del cronograma eliminado', { title: 'Eliminación exitosa', duration: 5000 }); } catch(_){}
        } else {
          console.error('Error al eliminar elemento de cronograma');
          try { toast.error('Error al eliminar elemento', { title: 'Error', duration: 6000 }); } catch(_){}
        }
      } catch (error) {
        console.error('Error:', error);
        try { toast.error('Error de conexión', { title: 'Error', duration: 6000 }); } catch(_){}
      } finally {
        setDeleting(false);
        setConfirmOpen(false);
        setDeleteAction(null);
      }
    });
    setConfirmOpen(true);
  };

  const openModal = () => {
    setEditingModal(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (modal) => {
    setEditingModal(modal);
    const normalizeDateInput = (v) => {
      const s = String(v || '');
      return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : '';
    };
    setFormData({
      titulo: modal.titulo,
      subtitulo: modal.subtitulo || '',
      descripcion: modal.descripcion || '',
      tipo: modal.tipo,
      fecha_inicio: normalizeDateInput(modal.fecha_inicio),
      fecha_fin: normalizeDateInput(modal.fecha_fin),
      activo: modal.activo,
      orden: modal.orden,
      imagen: null,
      imagenes: [],
      video_tiktok_url: modal.video_tiktok_url || '',
      facebook_url: modal.facebook_url || '',
      mostrar_en_primer_modal: !!modal.mostrar_en_primer_modal
    });
    // Previews de imagen principal y adicionales
    if (modal.imagen) {
      setImagePreview(modal.imagen);
    } else {
      setImagePreview('');
    }
    try {
      const extras = modal.imagenes_extra ? JSON.parse(modal.imagenes_extra) : [];
      const urls = Array.isArray(extras) ? extras.map(p => p && String(p)) : [];
      setExtraPreviews(urls);
    } catch {
      setExtraPreviews([]);
    }
    setShowModal(true);
  };

  const openCronogramaModal = (modalId) => {
    setSelectedModalId(modalId);
    setEditingCronograma(null);
    resetCronogramaForm();
    fetchCronograma(modalId);
    setShowCronogramaModal(true);
  };

  const openEditCronograma = (cronogramaItem) => {
    setEditingCronograma(cronogramaItem);
    setCronogramaFormData({
      fase: cronogramaItem.fase,
      descripcion: cronogramaItem.descripcion || '',
      fecha_inicio: cronogramaItem.fecha_inicio,
      fecha_fin: cronogramaItem.fecha_fin,
      estado: cronogramaItem.estado,
      color: cronogramaItem.color,
      icono: cronogramaItem.icono,
      orden: cronogramaItem.orden,
      activo: cronogramaItem.activo
    });
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      subtitulo: '',
      descripcion: '',
      tipo: 'nuevo',
      fecha_inicio: new Date().toISOString().slice(0,10),
      fecha_fin: '',
      activo: true,
      orden: 0,
      imagen: null,
      imagenes: [],
      video_tiktok_url: '',
      facebook_url: '',
      mostrar_en_primer_modal: false
    });
    setImagePreview('');
    setExtraPreviews([]);
  };

  const resetCronogramaForm = () => {
    setCronogramaFormData({
      fase: '',
      descripcion: '',
      fecha_inicio: '',
      fecha_fin: '',
      estado: 'pendiente',
      color: 'blue',
      icono: 'calendar',
      orden: 0,
      activo: true
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file' && name === 'imagen') {
      const file = files && files[0];
      if (!file) {
        setFormData(prev => ({ ...prev, imagen: null }));
        setImagePreview('');
        return;
      }
      const allowed = ['image/jpeg', 'image/png'];
      if (!allowed.includes(file.type)) {
        alert('Formato no permitido. Solo JPG o PNG.');
        e.target.value = '';
        setFormData(prev => ({ ...prev, imagen: null }));
        setImagePreview('');
        return;
      }
      // Opcional: límite de tamaño (5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('La imagen excede 5MB. Elige una más ligera.');
        e.target.value = '';
        setFormData(prev => ({ ...prev, imagen: null }));
        setImagePreview('');
        return;
      }
      setFormData(prev => ({ ...prev, imagen: file }));
      try { setImagePreview(URL.createObjectURL(file)); } catch {}
      return;
    }
    if (type === 'file' && name === 'imagenes') {
      const filesArr = Array.from(files || []);
      const allowed = ['image/jpeg', 'image/png'];
      const maxSize = 5 * 1024 * 1024;
      const validFiles = [];
      const previews = [];
      filesArr.forEach(f => {
        if (!allowed.includes(f.type)) {
          alert('Una imagen no es JPG/PNG y fue descartada.');
          return;
        }
        if (f.size > maxSize) {
          alert('Una imagen excede 5MB y fue descartada.');
          return;
        }
        validFiles.push(f);
        try { previews.push(URL.createObjectURL(f)); } catch {}
      });
      // Para 'flyer' queremos crear múltiples modales: almacenar todas las imágenes seleccionadas.
      const isFlyer = formData.tipo === 'flyer';
      const mainImage = validFiles[0] || null;
      const extraFiles = validFiles.slice(1);
      const extrasForState = isFlyer ? extraFiles : extraFiles.slice(0, 5);
      if (!isFlyer && extraFiles.length > 5) {
        alert('Solo se permiten hasta 5 imágenes adicionales. Se tomarán las primeras 5.');
      }
      setFormData(prev => ({ ...prev, imagen: mainImage, imagenes: isFlyer ? validFiles.slice(1) : extrasForState }));
      const mainPreview = previews[0] || '';
      const extrasPreview = (isFlyer ? previews.slice(1) : previews.slice(1, 6));
      setImagePreview(mainPreview);
      setExtraPreviews(extrasPreview);
      return;
    }
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCronogramaInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCronogramaFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const filteredModales = modales.filter(modal => {
    const matchesTipo = !filtroTipo || modal.tipo === filtroTipo;
    const matchesEstado = !filtroEstado || 
      (filtroEstado === 'activo' && modal.activo) ||
      (filtroEstado === 'inactivo' && !modal.activo);
    return matchesTipo && matchesEstado;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Administración de Modal Promocional</h1>
        <p className="text-gray-600">Gestiona el contenido del modal que aparece al inicio, incluyendo cronogramas y flyers</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TagIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Modales</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_modales || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <EyeIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Modales Activos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.modales_activos || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Modales Vigentes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.modales_vigentes || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Elementos Cronograma</p>
              <p className="text-2xl font-bold text-gray-900">{stats.elementos_cronograma || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y botón agregar */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los tipos</option>
                {tiposModal.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                ))}
              </select>

              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los estados</option>
                <option value="activo">Activos</option>
                <option value="inactivo">Inactivos</option>
              </select>
            </div>

            <button
              onClick={openModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Agregar Modal
            </button>
          </div>
        </div>

        {/* Lista de modales */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fechas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cronograma</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredModales.map((modal) => (
                <tr key={modal.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {modal.imagen ? (
                          <img className="h-10 w-10 rounded-full object-cover" src={modal.imagen} alt="" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <PhotoIcon className="h-6 w-6 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{modal.titulo}</div>
                        <div className="text-sm text-gray-500">{modal.subtitulo}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      modal.tipo === 'cronograma' ? 'bg-purple-100 text-purple-800' :
                      modal.tipo === 'flyer' ? 'bg-pink-100 text-pink-800' :
                      modal.tipo === 'video' ? 'bg-gray-100 text-gray-800' :
                      modal.tipo === 'facebook' ? 'bg-blue-100 text-blue-800' :
                      modal.tipo === 'avisos' ? 'bg-red-100 text-red-800' :
                      modal.tipo === 'noticias' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {tiposModal.find(t => t.value === modal.tipo)?.label || modal.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      {modal.fecha_inicio && <div>Inicio: {new Date(modal.fecha_inicio).toLocaleDateString()}</div>}
                      {modal.fecha_fin && <div>Fin: {new Date(modal.fecha_fin).toLocaleDateString()}</div>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      modal.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {modal.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {modal.total_cronograma || 0} elementos
                      </span>
                      {(modal.tipo === 'cronograma' || modal.total_cronograma > 0) && (
                        <button
                          onClick={() => openCronogramaModal(modal.id)}
                          className="text-blue-600 hover:text-blue-800 text-xs"
                        >
                          Gestionar
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(modal)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(modal.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de formulario principal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto w-11/12 max-w-5xl bg-white rounded-xl shadow-md border p-5 md:p-6">
            <div className="mt-0.5">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {editingModal ? 'Editar Modal' : 'Crear Nuevo Modal'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                    <input
                      type="text"
                      name="titulo"
                      value={formData.titulo}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {formData.tipo !== 'flyer' && formData.tipo !== 'facebook' && (
                    <div className="lg:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
                      <input
                        type="text"
                        name="subtitulo"
                        value={formData.subtitulo}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  {formData.tipo !== 'flyer' && formData.tipo !== 'facebook' && (
                    <div className="sm:col-span-2 lg:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                      <textarea
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleInputChange}
                        rows={2}
                        required={formData.tipo === 'avisos' || formData.tipo === 'noticias'}
                        className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                    <select
                      name="tipo"
                      value={formData.tipo}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {tiposModal.map(tipo => (
                        <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                      ))}
                    </select>
                  </div>

                  {formData.tipo !== 'flyer' && formData.tipo !== 'facebook' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
                      <input
                        type="number"
                        name="orden"
                        value={formData.orden}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  {formData.tipo !== 'facebook' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                    <input
                      type="date"
                      name="fecha_inicio"
                      value={formData.fecha_inicio}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  )}

                  {formData.tipo !== 'facebook' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                    <input
                      type="date"
                      name="fecha_fin"
                      value={formData.fecha_fin}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  )}
                  {formData.tipo !== 'flyer' && (
                    <div className="sm:col-span-2 lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {formData.tipo === 'facebook' ? 'Facebook Post URL' : 'Video TikTok URL'}
                      </label>
                      {formData.tipo === 'facebook' ? (
                        <input
                          type="url"
                          name="facebook_url"
                          value={formData.facebook_url}
                          onChange={handleInputChange}
                          placeholder={'https://www.facebook.com/... (URL completa de la publicación)'}
                          required
                          className={`w-full border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 border-blue-400 bg-blue-50 focus:ring-blue-600`}
                        />
                      ) : (
                        <input
                          type="url"
                          name="video_tiktok_url"
                          value={formData.video_tiktok_url}
                          onChange={handleInputChange}
                          placeholder={'https://www.tiktok.com/@usuario/video/123456789'}
                          required={formData.tipo === 'video'}
                          className={`w-full border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 ${formData.tipo === 'video' ? 'border-blue-400 bg-blue-50 focus:ring-blue-600' : 'border-gray-300 focus:ring-blue-500'}`}
                        />
                      )}
                      <p className="mt-0.5 text-xs text-gray-500">
                        {formData.tipo === 'facebook'
                          ? 'Pegue la URL completa de la publicación de Facebook.'
                          : 'Pegue la URL completa del video de TikTok.'}
                        {(formData.tipo === 'video' || formData.tipo === 'facebook') && (
                          <span className="ml-1 text-blue-600 font-medium">Obligatorio cuando el tipo es “{formData.tipo === 'video' ? 'Video' : 'Facebook'}”.</span>
                        )}
                      </p>
                      {formData.tipo === 'facebook' && formData.facebook_url && (
                        <div className="mt-2 border rounded-md overflow-hidden">
                          <iframe
                            title={`Vista previa Facebook`}
                            className="w-full h-[380px] md:h-[420px]"
                            src={buildFacebookEmbed(formData.facebook_url)}
                            style={{ border: 'none', overflow: 'hidden' }}
                            scrolling="no"
                            frameBorder="0"
                            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                          />
                          <div className="px-3 py-2 flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                              La publicación debe ser pública para que se muestre correctamente.
                            </p>
                            <a
                              href={formData.facebook_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                            >
                              <img src={getFacebookFavicon()} alt="Facebook" className="w-3.5 h-3.5 rounded-sm" />
                              <span className="text-white/90">{extractFacebookPageName(formData.facebook_url)}</span>
                              <span>Ver en Facebook</span>
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {formData.tipo !== 'video' && formData.tipo !== 'facebook' && (
                    <div className="sm:col-span-2 lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {formData.tipo === 'avisos' ? 'Flyer de Avisos' : formData.tipo === 'noticias' ? 'Flyer de Noticias' : formData.tipo === 'cronograma' ? 'Flyer de Cronograma' : 'Imágenes (JPG/PNG)'} {((formData.tipo === 'flyer' || formData.tipo === 'avisos' || formData.tipo === 'noticias' || formData.tipo === 'cronograma') && !editingModal) ? '*' : ''}
                      </label>
                      <input
                        type="file"
                        name="imagenes"
                        multiple
                        onChange={handleInputChange}
                        accept="image/jpeg,image/png"
                        required={(formData.tipo === 'flyer' || formData.tipo === 'avisos' || formData.tipo === 'noticias' || formData.tipo === 'cronograma') && !editingModal}
                        className={`w-full border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 ${formData.tipo === 'flyer' ? 'border-pink-400 bg-pink-50 focus:ring-pink-600' : formData.tipo === 'avisos' ? 'border-red-400 bg-red-50 focus:ring-red-600' : formData.tipo === 'noticias' ? 'border-indigo-400 bg-indigo-50 focus:ring-indigo-600' : formData.tipo === 'cronograma' ? 'border-purple-400 bg-purple-50 focus:ring-purple-600' : 'border-gray-300 focus:ring-blue-500'}`}
                      />
                      {imagePreview && (
                        <div className="mt-2">
                          <img src={imagePreview} alt="Vista previa principal" className="w-full h-40 object-contain rounded border" />
                        </div>
                      )}
                      {extraPreviews?.length > 0 && (
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                          {extraPreviews.map((src, idx) => (
                            <img key={idx} src={src} alt={`Extra ${idx+1}`} className="w-full h-28 object-cover rounded border" />
                          ))}
                        </div>
                      )}
                      <p className="mt-0.5 text-xs text-gray-500">
                        {formData.tipo === 'avisos' && 'Sube el flyer del comunicado/aviso. Recomendado 1080x1350 (4:5).'}
                        {formData.tipo === 'noticias' && 'Sube el flyer de la noticia. Recomendado 1200x630 (OpenGraph).'}
                        {formData.tipo === 'cronograma' && 'Sube el flyer del cronograma del ciclo. Recomendado 1920x1080 (16:9).'}
                        {formData.tipo === 'flyer' && 'La primera imagen será la principal; las demás, adicionales (máx 5 adicionales).'}
                        {!(formData.tipo === 'avisos' || formData.tipo === 'noticias' || formData.tipo === 'cronograma' || formData.tipo === 'flyer') && 'La primera imagen será la principal; las demás, adicionales (máx 5 adicionales).'}
                      </p>
                      {((formData.tipo === 'flyer' || formData.tipo === 'avisos' || formData.tipo === 'noticias' || formData.tipo === 'cronograma') && !editingModal) && (
                        <p className="mt-0.5 text-xs text-blue-600">Obligatorio al crear para {formData.tipo === 'flyer' ? 'Flyer' : formData.tipo === 'avisos' ? 'Avisos' : formData.tipo === 'noticias' ? 'Noticias' : 'Cronograma'}.</p>
                      )}
                    </div>
                  )}

                  {/* Enlaces y textos de botones según tipo */}
                  {(formData.tipo === 'avisos' || formData.tipo === 'noticias' || formData.tipo === 'cronograma') && (
                    <div className="sm:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {formData.tipo === 'noticias' ? 'Enlace a la noticia' : formData.tipo === 'avisos' ? 'Enlace al comunicado/archivo' : 'Enlace del cronograma (opcional)'}
                        </label>
                        <input
                          type="url"
                          name="url_accion"
                          value={formData.url_accion}
                          onChange={handleInputChange}
                          placeholder={formData.tipo === 'noticias' ? 'https://.../noticia' : formData.tipo === 'avisos' ? 'https://.../comunicado.pdf' : 'https://.../detalle-cronograma'}
                          className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Texto botón primario</label>
                        <input
                          type="text"
                          name="texto_boton_primario"
                          value={formData.texto_boton_primario}
                          onChange={handleInputChange}
                          placeholder={formData.tipo === 'noticias' ? 'Leer noticia' : formData.tipo === 'avisos' ? 'Ver comunicado' : 'Ver cronograma'}
                          className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Texto botón secundario (opcional)</label>
                        <input
                          type="text"
                          name="texto_boton_secundario"
                          value={formData.texto_boton_secundario}
                          onChange={handleInputChange}
                          placeholder="Más información"
                          className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                  <div className="sm:col-span-2 lg:col-span-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                      {formData.tipo !== 'flyer' && (
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="mostrar_en_primer_modal"
                            checked={formData.mostrar_en_primer_modal}
                            onChange={handleInputChange}
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          />
                          <span className="ml-2 text-sm text-gray-700">Mostrar primero</span>
                        </label>
                      )}
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="activo"
                          checked={formData.activo}
                          onChange={handleInputChange}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">Modal activo</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingModal ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de cronograma */}
      {showCronogramaModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-12 mx-auto w-11/12 max-w-5xl bg-white rounded-xl shadow-md border p-5 md:p-6">
            <div className="mt-1">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Gestionar Cronograma
                </h3>
                <button
                  onClick={() => setShowCronogramaModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Cerrar</span>
                  ×
                </button>
              </div>

              {/* Formulario de cronograma */}
              <div className="mb-5 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-md font-medium text-gray-900 mb-3">
                  {editingCronograma ? 'Editar Elemento' : 'Agregar Elemento al Cronograma'}
                </h4>
                
                <form onSubmit={handleCronogramaSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fase *</label>
                      <input
                        type="text"
                        name="fase"
                        value={cronogramaFormData.fase}
                        onChange={handleCronogramaInputChange}
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio *</label>
                      <input
                        type="date"
                        name="fecha_inicio"
                        value={cronogramaFormData.fecha_inicio}
                        onChange={handleCronogramaInputChange}
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin *</label>
                      <input
                        type="date"
                        name="fecha_fin"
                        value={cronogramaFormData.fecha_fin}
                        onChange={handleCronogramaInputChange}
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                      <textarea
                        name="descripcion"
                        value={cronogramaFormData.descripcion}
                        onChange={handleCronogramaInputChange}
                        rows={2}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                      <select
                        name="estado"
                        value={cronogramaFormData.estado}
                        onChange={handleCronogramaInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {estadosCronograma.map(estado => (
                          <option key={estado.value} value={estado.value}>{estado.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                      <select
                        name="color"
                        value={cronogramaFormData.color}
                        onChange={handleCronogramaInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {coloresCronograma.map(color => (
                          <option key={color} value={color}>{color}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Icono</label>
                      <select
                        name="icono"
                        value={cronogramaFormData.icono}
                        onChange={handleCronogramaInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {iconosCronograma.map(icono => (
                          <option key={icono} value={icono}>{icono}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
                      <input
                        type="number"
                        name="orden"
                        value={cronogramaFormData.orden}
                        onChange={handleCronogramaInputChange}
                        min="0"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="activo"
                          checked={cronogramaFormData.activo}
                          onChange={handleCronogramaInputChange}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">Activo</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    {editingCronograma && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCronograma(null);
                          resetCronogramaForm();
                        }}
                        className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Cancelar Edición
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      {editingCronograma ? 'Actualizar' : 'Agregar'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Lista de cronograma */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fase</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fechas</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orden</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cronograma.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.fase}</div>
                          {item.descripcion && (
                            <div className="text-sm text-gray-500">{item.descripcion}</div>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>{new Date(item.fecha_inicio).toLocaleDateString()}</div>
                          <div>{new Date(item.fecha_fin).toLocaleDateString()}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            item.estado === 'activo' ? 'bg-green-100 text-green-800' :
                            item.estado === 'finalizado' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {estadosCronograma.find(e => e.value === item.estado)?.label || item.estado}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.orden}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditCronograma(item)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCronograma(item.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => { if (!deleting) { setConfirmOpen(false); setDeleteAction(null); } }}
        onConfirm={async () => { if (typeof deleteAction === 'function') { await deleteAction(); } }}
        title="Confirmar eliminación"
        message={confirmMessage || 'Esta acción es permanente. ¿Deseas continuar?'}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};
// Se usa deleteAction para ejecutar dinámicamente la acción configurada
// en los handlers de eliminación de modales y cronogramas.
export default ModalPromocionalAdmin;
