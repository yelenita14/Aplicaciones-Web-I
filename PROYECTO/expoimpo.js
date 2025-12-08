// SISTEMA JSON Y XML
// EXPORTAR A JSON
function exportarJSON() {
    const estudiantes = JSON.parse(localStorage.getItem('estudiantes') || '[]');
    const materias = JSON.parse(localStorage.getItem('materias') || '[]');
    const asistencias = JSON.parse(localStorage.getItem('asistencias') || '[]');
    const justificaciones = JSON.parse(localStorage.getItem('justificaciones') || '[]');
    
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
    };
    const jsonStr = JSON.stringify(datos, null, 2);
    descargarArchivo(jsonStr, 'datos_uleam.json', 'application/json');
    alert('Datos exportados a JSON exitosamente');
}
// EXPORTAR A XML 
function exportarXML() {
    const estudiantes = JSON.parse(localStorage.getItem('estudiantes') || '[]');
    const materias = JSON.parse(localStorage.getItem('materias') || '[]');
    const asistencias = JSON.parse(localStorage.getItem('asistencias') || '[]');
    const justificaciones = JSON.parse(localStorage.getItem('justificaciones') || '[]');
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<datos_uleam>\n';
    xml += '  <metadata>\n';
    xml += `    <fecha_exportacion>${new Date().toISOString()}</fecha_exportacion>\n`;
    xml += '    <version>1.0</version>\n';
    xml += '    <institucion>ULEAM</institucion>\n';
    xml += '  </metadata>\n\n';
    
    // Estudiantes
    xml += `  <estudiantes total="${estudiantes.length}">\n`;
    estudiantes.forEach(est => {
        xml += '    <estudiante>\n';
        xml += `      <matricula>${escaparXML(est.matricula || '')}</matricula>\n`;
        xml += `      <cedula>${escaparXML(est.cedula || '')}</cedula>\n`;
        xml += `      <nombres>${escaparXML(est.nombres || '')}</nombres>\n`;
        xml += `      <apellidos>${escaparXML(est.apellidos || '')}</apellidos>\n`;
        xml += `      <email>${escaparXML(est.email || '')}</email>\n`;
        xml += `      <telefono>${escaparXML(est.telefono || '')}</telefono>\n`;
        xml += `      <carrera>${escaparXML(est.carrera || '')}</carrera>\n`;
        xml += '    </estudiante>\n';
    });
    xml += '  </estudiantes>\n\n';
    
    // Materias
    xml += `  <materias total="${materias.length}">\n`;
    materias.forEach(mat => {
        xml += '    <materia>\n';
        xml += `      <codigo>${escaparXML(mat.codigo || '')}</codigo>\n`;
        xml += `      <nombre>${escaparXML(mat.nombre || '')}</nombre>\n`;
        xml += `      <nivel>${escaparXML(mat.nivel || '')}</nivel>\n`;
        xml += `      <creditos>${escaparXML(mat.creditos || '')}</creditos>\n`;
        xml += `      <docente>${escaparXML(mat.docente || '')}</docente>\n`;
        xml += '    </materia>\n';
    });
    xml += '  </materias>\n\n';
    
    // Asistencias
    xml += `  <asistencias total="${asistencias.length}">\n`;
    asistencias.forEach(asi => {
        xml += '    <asistencia>\n';
        xml += `      <id>${escaparXML(String(asi.id) || '')}</id>\n`;
        xml += `      <matricula>${escaparXML(asi.matricula || '')}</matricula>\n`;
        xml += `      <nombres>${escaparXML(asi.nombres || '')}</nombres>\n`;
        xml += `      <apellidos>${escaparXML(asi.apellidos || '')}</apellidos>\n`;
        xml += `      <materia>${escaparXML(asi.materia || '')}</materia>\n`;
        xml += `      <fecha>${escaparXML(asi.fecha || '')}</fecha>\n`;
        xml += `      <estado>${escaparXML(asi.estado || '')}</estado>\n`;
        xml += `      <observacion>${escaparXML(asi.observacion || '')}</observacion>\n`;
        xml += `      <registradoPor>${escaparXML(asi.registradoPor || '')}</registradoPor>\n`;
        xml += `      <fechaRegistro>${escaparXML(asi.fechaRegistro || '')}</fechaRegistro>\n`;
        xml += '    </asistencia>\n';
    });
    xml += '  </asistencias>\n\n';
    
    // Justificaciones
    xml += `  <justificaciones total="${justificaciones.length}">\n`;
    justificaciones.forEach(jus => {
        xml += '    <justificacion>\n';
        xml += `      <id>${escaparXML(String(jus.id) || '')}</id>\n`;
        xml += `      <attendanceId>${escaparXML(String(jus.attendanceId) || '')}</attendanceId>\n`;
        xml += `      <matricula>${escaparXML(jus.matricula || '')}</matricula>\n`;
        xml += `      <tipo>${escaparXML(jus.tipo || '')}</tipo>\n`;
        xml += `      <motivo>${escaparXML(jus.motivo || '')}</motivo>\n`;
        xml += `      <estado>${escaparXML(jus.estado || '')}</estado>\n`;
        xml += `      <fechaSolicitud>${escaparXML(jus.fechaSolicitud || '')}</fechaSolicitud>\n`;
        xml += '    </justificacion>\n';
    });
    xml += '  </justificaciones>\n';
    
    xml += '</datos_uleam>';
    
    descargarArchivo(xml, 'datos_uleam.xml', 'application/xml');
    alert('Datos exportados a XML exitosamente');
}
// IMPORTAR DESDE JSON 
function importarJSON(archivo) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const datos = JSON.parse(e.target.result);
            
            // Importar estudiantes
            if (datos.estudiantes && datos.estudiantes.items) {
                localStorage.setItem('estudiantes', JSON.stringify(datos.estudiantes.items));
            } else if (datos.estudiantes && Array.isArray(datos.estudiantes)) {
                localStorage.setItem('estudiantes', JSON.stringify(datos.estudiantes));
            }
            
            // Importar materias
            if (datos.materias && datos.materias.items) {
                localStorage.setItem('materias', JSON.stringify(datos.materias.items));
            } else if (datos.materias && Array.isArray(datos.materias)) {
                localStorage.setItem('materias', JSON.stringify(datos.materias));
            }
            
            // Importar asistencias
            if (datos.asistencias && datos.asistencias.items) {
                localStorage.setItem('asistencias', JSON.stringify(datos.asistencias.items));
            } else if (datos.asistencias && Array.isArray(datos.asistencias)) {
                localStorage.setItem('asistencias', JSON.stringify(datos.asistencias));
            }
            
            // Importar justificaciones
            if (datos.justificaciones && datos.justificaciones.items) {
                localStorage.setItem('justificaciones', JSON.stringify(datos.justificaciones.items));
            } else if (datos.justificaciones && Array.isArray(datos.justificaciones)) {
                localStorage.setItem('justificaciones', JSON.stringify(datos.justificaciones));
            }
            
            alert('Datos importados desde JSON exitosamente');
            location.reload();
        } catch (error) {
            alert('Error al importar JSON: ' + error.message);
        }
    };
    
    reader.readAsText(archivo);
}
// IMPORTAR DESDE XML 
function importarXML(archivo) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(e.target.result, "text/xml");
            
            // Verificar errores
            if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
                throw new Error('XML mal formado');
            }
            
            // Importar estudiantes
            const estudiantesXML = xmlDoc.getElementsByTagName('estudiante');
            const estudiantes = [];
            for (let i = 0; i < estudiantesXML.length; i++) {
                const est = estudiantesXML[i];
                estudiantes.push({
                    matricula: getTextoXML(est, 'matricula'),
                    cedula: getTextoXML(est, 'cedula'),
                    nombres: getTextoXML(est, 'nombres'),
                    apellidos: getTextoXML(est, 'apellidos'),
                    email: getTextoXML(est, 'email'),
                    telefono: getTextoXML(est, 'telefono'),
                    carrera: getTextoXML(est, 'carrera')
                });
            }
            
            // Importar materias
            const materiasXML = xmlDoc.getElementsByTagName('materia');
            const materias = [];
            for (let i = 0; i < materiasXML.length; i++) {
                const mat = materiasXML[i];
                materias.push({
                    codigo: getTextoXML(mat, 'codigo'),
                    nombre: getTextoXML(mat, 'nombre'),
                    nivel: getTextoXML(mat, 'nivel'),
                    creditos: getTextoXML(mat, 'creditos'),
                    docente: getTextoXML(mat, 'docente')
                });
            }
            
            // Importar asistencias
            const asistenciasXML = xmlDoc.getElementsByTagName('asistencia');
            const asistencias = [];
            for (let i = 0; i < asistenciasXML.length; i++) {
                const asi = asistenciasXML[i];
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
                });
            }
            
            // Importar justificaciones
            const justificacionesXML = xmlDoc.getElementsByTagName('justificacion');
            const justificaciones = [];
            for (let i = 0; i < justificacionesXML.length; i++) {
                const jus = justificacionesXML[i];
                justificaciones.push({
                    id: getTextoXML(jus, 'id'),
                    attendanceId: parseFloat(getTextoXML(jus, 'attendanceId')),
                    matricula: getTextoXML(jus, 'matricula'),
                    tipo: getTextoXML(jus, 'tipo'),
                    motivo: getTextoXML(jus, 'motivo'),
                    estado: getTextoXML(jus, 'estado'),
                    fechaSolicitud: getTextoXML(jus, 'fechaSolicitud')
                });
            }
            
            // Guardar en localStorage
            if (estudiantes.length > 0) {
                localStorage.setItem('estudiantes', JSON.stringify(estudiantes));
            }
            if (materias.length > 0) {
                localStorage.setItem('materias', JSON.stringify(materias));
            }
            if (asistencias.length > 0) {
                localStorage.setItem('asistencias', JSON.stringify(asistencias));
            }
            if (justificaciones.length > 0) {
                localStorage.setItem('justificaciones', JSON.stringify(justificaciones));
            }
            
            alert('Datos importados desde XML exitosamente');
            location.reload();
        } catch (error) {
            alert('Error al importar XML: ' + error.message);
        }
    };   
    reader.readAsText(archivo);
}
// FUNCIONES AUXILIARES
function escaparXML(texto) {
    return String(texto)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}
function getTextoXML(elemento, tag) {
    const tags = elemento.getElementsByTagName(tag);
    return tags.length > 0 ? tags[0].textContent : '';
}
function descargarArchivo(contenido, nombre, tipo) {
    const blob = new Blob([contenido], { type: tipo });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
console.log('Sistema JSON/XML cargado');