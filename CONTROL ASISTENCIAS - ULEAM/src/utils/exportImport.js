// Función para escapar caracteres XML
function escaparXML(texto) {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// Función para obtener texto de elemento XML
function getTextoXML(elemento, tag) {
  const tags = elemento.getElementsByTagName(tag)
  return tags.length > 0 ? tags[0].textContent : ''
}

// Función para descargar archivo
function descargarArchivo(contenido, nombre, tipo) {
  const blob = new Blob([contenido], { type: tipo })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// EXPORTAR A JSON
export function exportarJSONUtil() {
  const estudiantes = JSON.parse(localStorage.getItem('estudiantes') || '[]')
  const materias = JSON.parse(localStorage.getItem('materias') || '[]')
  const asistencias = JSON.parse(localStorage.getItem('asistencias') || '[]')
  const justificaciones = JSON.parse(localStorage.getItem('justificaciones') || '[]')
  
  const datos = {
    metadata: {
      fecha_exportacion: new Date().toISOString(),
      version: "1.0",
      institucion: "ULEAM"
    },
    estudiantes: {
      total: estudiantes.length,
      items: estudiantes
    },
    materias: {
      total: materias.length,
      items: materias
    },
    asistencias: {
      total: asistencias.length,
      items: asistencias
    },
    justificaciones: {
      total: justificaciones.length,
      items: justificaciones
    }
  }
  
  const jsonStr = JSON.stringify(datos, null, 2)
  descargarArchivo(jsonStr, 'datos_uleam.json', 'application/json')
}

// EXPORTAR A XML
export function exportarXMLUtil() {
  const estudiantes = JSON.parse(localStorage.getItem('estudiantes') || '[]')
  const materias = JSON.parse(localStorage.getItem('materias') || '[]')
  const asistencias = JSON.parse(localStorage.getItem('asistencias') || '[]')
  const justificaciones = JSON.parse(localStorage.getItem('justificaciones') || '[]')
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<datos_uleam>\n'
  xml += '  <metadata>\n'
  xml += `    <fecha_exportacion>${new Date().toISOString()}</fecha_exportacion>\n`
  xml += '    <version>1.0</version>\n'
  xml += '    <institucion>ULEAM</institucion>\n'
  xml += '  </metadata>\n\n'
  
  // Estudiantes
  xml += `  <estudiantes total="${estudiantes.length}">\n`
  estudiantes.forEach(est => {
    xml += '    <estudiante>\n'
    xml += `      <matricula>${escaparXML(est.matricula || '')}</matricula>\n`
    xml += `      <cedula>${escaparXML(est.cedula || '')}</cedula>\n`
    xml += `      <nombres>${escaparXML(est.nombres || '')}</nombres>\n`
    xml += `      <apellidos>${escaparXML(est.apellidos || '')}</apellidos>\n`
    xml += `      <email>${escaparXML(est.email || '')}</email>\n`
    xml += `      <telefono>${escaparXML(est.telefono || '')}</telefono>\n`
    xml += `      <carrera>${escaparXML(est.carrera || '')}</carrera>\n`
    xml += '    </estudiante>\n'
  })
  xml += '  </estudiantes>\n\n'
  
  // Materias
  xml += `  <materias total="${materias.length}">\n`
  materias.forEach(mat => {
    xml += '    <materia>\n'
    xml += `      <codigo>${escaparXML(mat.codigo || '')}</codigo>\n`
    xml += `      <nombre>${escaparXML(mat.nombre || '')}</nombre>\n`
    xml += `      <nivel>${escaparXML(mat.nivel || '')}</nivel>\n`
    xml += `      <creditos>${escaparXML(mat.creditos || '')}</creditos>\n`
    xml += `      <docente>${escaparXML(mat.docente || '')}</docente>\n`
    xml += '    </materia>\n'
  })
  xml += '  </materias>\n\n'
  
  // Asistencias
  xml += `  <asistencias total="${asistencias.length}">\n`
  asistencias.forEach(asi => {
    xml += '    <asistencia>\n'
    xml += `      <id>${escaparXML(String(asi.id) || '')}</id>\n`
    xml += `      <matricula>${escaparXML(asi.matricula || '')}</matricula>\n`
    xml += `      <nombres>${escaparXML(asi.nombres || '')}</nombres>\n`
    xml += `      <apellidos>${escaparXML(asi.apellidos || '')}</apellidos>\n`
    xml += `      <materia>${escaparXML(asi.materia || '')}</materia>\n`
    xml += `      <fecha>${escaparXML(asi.fecha || '')}</fecha>\n`
    xml += `      <estado>${escaparXML(asi.estado || '')}</estado>\n`
    xml += `      <observacion>${escaparXML(asi.observacion || '')}</observacion>\n`
    xml += `      <registradoPor>${escaparXML(asi.registradoPor || '')}</registradoPor>\n`
    xml += `      <fechaRegistro>${escaparXML(asi.fechaRegistro || '')}</fechaRegistro>\n`
    xml += '    </asistencia>\n'
  })
  xml += '  </asistencias>\n\n'
  
  // Justificaciones
  xml += `  <justificaciones total="${justificaciones.length}">\n`
  justificaciones.forEach(jus => {
    xml += '    <justificacion>\n'
    xml += `      <id>${escaparXML(String(jus.id) || '')}</id>\n`
    xml += `      <attendanceId>${escaparXML(String(jus.attendanceId) || '')}</attendanceId>\n`
    xml += `      <matricula>${escaparXML(jus.matricula || '')}</matricula>\n`
    xml += `      <tipo>${escaparXML(jus.tipo || '')}</tipo>\n`
    xml += `      <motivo>${escaparXML(jus.motivo || '')}</motivo>\n`
    xml += `      <estado>${escaparXML(jus.estado || '')}</estado>\n`
    xml += `      <fechaSolicitud>${escaparXML(jus.fechaSolicitud || '')}</fechaSolicitud>\n`
    xml += '    </justificacion>\n'
  })
  xml += '  </justificaciones>\n'
  
  xml += '</datos_uleam>'
  
  descargarArchivo(xml, 'datos_uleam.xml', 'application/xml')
}

// IMPORTAR ARCHIVO
export function importarArchivoUtil(event, callback) {
  const archivo = event.target.files[0]
  if (!archivo) return
  
  const reader = new FileReader()
  
  reader.onload = function(e) {
    try {
      const contenido = e.target.result
      const extension = archivo.name.split('.').pop().toLowerCase()
      
      if (extension === 'json') {
        importarJSON(contenido, callback)
      } else if (extension === 'xml') {
        importarXML(contenido, callback)
      } else {
        alert('Formato de archivo no soportado. Usa JSON o XML')
      }
    } catch (error) {
      console.error('Error al importar:', error)
      alert('Error al procesar el archivo: ' + error.message)
    }
  }
  
  reader.readAsText(archivo)
  event.target.value = ''
}

// IMPORTAR DESDE JSON
function importarJSON(contenido, callback) {
  try {
    const datos = JSON.parse(contenido)
    
    if (!datos.asistencias && !datos.estudiantes && !datos.materias) {
      throw new Error('Formato JSON inválido')
    }
    
    const confirmar = confirm(
      `Se importarán datos. ¿Deseas continuar?\n\n` +
      `Estudiantes: ${datos.estudiantes?.items?.length || datos.estudiantes?.length || 0}\n` +
      `Materias: ${datos.materias?.items?.length || datos.materias?.length || 0}\n` +
      `Asistencias: ${datos.asistencias?.items?.length || datos.asistencias?.length || 0}`
    )
    
    if (!confirmar) return
    
    // Importar estudiantes
    if (datos.estudiantes) {
      const items = datos.estudiantes.items || datos.estudiantes
      if (Array.isArray(items)) {
        localStorage.setItem('estudiantes', JSON.stringify(items))
      }
    }
    
    // Importar materias
    if (datos.materias) {
      const items = datos.materias.items || datos.materias
      if (Array.isArray(items)) {
        localStorage.setItem('materias', JSON.stringify(items))
      }
    }
    
    // Importar asistencias
    if (datos.asistencias) {
      const items = datos.asistencias.items || datos.asistencias
      if (Array.isArray(items)) {
        localStorage.setItem('asistencias', JSON.stringify(items))
      }
    }
    
    // Importar justificaciones
    if (datos.justificaciones) {
      const items = datos.justificaciones.items || datos.justificaciones
      if (Array.isArray(items)) {
        localStorage.setItem('justificaciones', JSON.stringify(items))
      }
    }
    
    if (callback) callback()
  } catch (error) {
    alert('Error al importar JSON: ' + error.message)
  }
}

// IMPORTAR DESDE XML
function importarXML(contenido, callback) {
  try {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(contenido, "text/xml")
    
    if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
      throw new Error('XML mal formado')
    }
    
    const confirmar = confirm('Se importarán datos desde XML. ¿Deseas continuar?')
    if (!confirmar) return
    
    // Importar estudiantes
    const estudiantesXML = xmlDoc.getElementsByTagName('estudiante')
    const estudiantes = []
    for (let i = 0; i < estudiantesXML.length; i++) {
      const est = estudiantesXML[i]
      estudiantes.push({
        matricula: getTextoXML(est, 'matricula'),
        cedula: getTextoXML(est, 'cedula'),
        nombres: getTextoXML(est, 'nombres'),
        apellidos: getTextoXML(est, 'apellidos'),
        email: getTextoXML(est, 'email'),
        telefono: getTextoXML(est, 'telefono'),
        carrera: getTextoXML(est, 'carrera')
      })
    }
    
    // Importar materias
    const materiasXML = xmlDoc.getElementsByTagName('materia')
    const materias = []
    for (let i = 0; i < materiasXML.length; i++) {
      const mat = materiasXML[i]
      materias.push({
        codigo: getTextoXML(mat, 'codigo'),
        nombre: getTextoXML(mat, 'nombre'),
        nivel: getTextoXML(mat, 'nivel'),
        creditos: getTextoXML(mat, 'creditos'),
        docente: getTextoXML(mat, 'docente')
      })
    }
    
    // Importar asistencias
    const asistenciasXML = xmlDoc.getElementsByTagName('asistencia')
    const asistencias = []
    for (let i = 0; i < asistenciasXML.length; i++) {
      const asi = asistenciasXML[i]
      asistencias.push({
        id: parseFloat(getTextoXML(asi, 'id')) || Date.now() + Math.random(),
        matricula: getTextoXML(asi, 'matricula'),
        nombres: getTextoXML(asi, 'nombres'),
        apellidos: getTextoXML(asi, 'apellidos'),
        email: getTextoXML(asi, 'email'),
        materia: getTextoXML(asi, 'materia'),
        codigoMateria: getTextoXML(asi, 'codigoMateria'),
        fecha: getTextoXML(asi, 'fecha'),
        estado: getTextoXML(asi, 'estado'),
        observacion: getTextoXML(asi, 'observacion'),
        registradoPor: getTextoXML(asi, 'registradoPor'),
        fechaRegistro: getTextoXML(asi, 'fechaRegistro')
      })
    }
    
    // Guardar en localStorage
    if (estudiantes.length > 0) {
      localStorage.setItem('estudiantes', JSON.stringify(estudiantes))
    }
    if (materias.length > 0) {
      localStorage.setItem('materias', JSON.stringify(materias))
    }
    if (asistencias.length > 0) {
      localStorage.setItem('asistencias', JSON.stringify(asistencias))
    }
    
    if (callback) callback()
  } catch (error) {
    alert('Error al importar XML: ' + error.message)
  }
}