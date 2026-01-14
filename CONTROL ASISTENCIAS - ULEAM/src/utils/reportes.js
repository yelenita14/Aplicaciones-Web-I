import { jsPDF } from 'jspdf'

export function generarReportePDF(tipoReporte, fechaInicio, fechaFin, asistencias) {
  const doc = new jsPDF()
  
  // Agregar fondo y diseño
  doc.setFillColor(240, 248, 255)
  doc.rect(0, 0, 210, 40, 'F')
  
  // Título principal
  doc.setFontSize(16)
  doc.setTextColor(0, 51, 102)
  doc.text('ULEAM - REPORTE DE ASISTENCIA', 20, 18)
  
  // Línea divisoria
  doc.setLineWidth(0.5)
  doc.setDrawColor(0, 51, 102)
  doc.line(20, 25, 190, 25)
  
  // Información del reporte
  doc.setFontSize(11)
  doc.setTextColor(0, 0, 0)
  doc.text(`Tipo: ${tipoReporte.charAt(0).toUpperCase() + tipoReporte.slice(1)}`, 20, 35)
  
  // Calcular período académico
  const inicio = new Date(fechaInicio)
  const fin = new Date(fechaFin)
  const periodoTexto = calcularPeriodoAcademico(inicio, fin)
  
  doc.text(`Período: ${periodoTexto}`, 20, 43)
  doc.text(`Generado: ${new Date().toLocaleString('es-EC')}`, 20, 51)
  
  let yPosition = 65
  
  // Generar reporte según tipo
  switch(tipoReporte) {
    case 'estudiante':
      yPosition = generarReportePorEstudiante(doc, asistencias, yPosition)
      break
    case 'materia':
      yPosition = generarReportePorMateria(doc, asistencias, yPosition)
      break
    case 'periodo':
      yPosition = generarReportePorPeriodo(doc, asistencias, yPosition)
      break
    case 'general':
      yPosition = generarReporteGeneral(doc, asistencias, yPosition)
      break
  }
  
  doc.save(`reporte_${tipoReporte}_${new Date().getTime()}.pdf`)
}

function calcularPeriodoAcademico(inicio, fin) {
  const mes1 = inicio.getMonth() + 1
  const year1 = inicio.getFullYear()
  const mes2 = fin.getMonth() + 1
  const year2 = fin.getFullYear()
  
  let sem1, sem2
  if (mes1 >= 4 && mes1 <= 7) sem1 = 1
  else if (mes1 >= 9 && mes1 <= 12) sem1 = 2
  else sem1 = (mes1 <= 3) ? 2 : 1
  
  if (mes2 >= 4 && mes2 <= 7) sem2 = 1
  else if (mes2 >= 9 && mes2 <= 12) sem2 = 2
  else sem2 = (mes2 <= 3) ? 2 : 1
  
  return `${year1}-${sem1} a ${year2}-${sem2}`
}

function generarReportePorEstudiante(doc, asistencias, yStart) {
  // Encabezado de sección
  doc.setFillColor(230, 240, 255)
  doc.rect(20, yStart - 5, 170, 10, 'F')
  doc.setFontSize(14)
  doc.setTextColor(0, 51, 102)
  doc.text('REPORTE POR ESTUDIANTE', 20, yStart)
  doc.setTextColor(0, 0, 0)
  yStart += 15
  
  const porEstudiante = {}
  asistencias.forEach(a => {
    const key = a.matricula
    if (!porEstudiante[key]) {
      porEstudiante[key] = {
        nombres: a.nombres,
        apellidos: a.apellidos,
        email: a.email,
        presente: 0,
        ausente: 0,
        total: 0
      }
    }
    porEstudiante[key].total++
    if (a.estado === 'presente') porEstudiante[key].presente++
    else if (a.estado === 'ausente') porEstudiante[key].ausente++
  })
  
  doc.setFontSize(10)
  Object.values(porEstudiante).forEach(est => {
    const porcentaje = ((est.presente / est.total) * 100).toFixed(2)
    
    if (yStart > 250) {
      doc.addPage()
      yStart = 20
    }
    
    doc.text(`Estudiante: ${est.nombres} ${est.apellidos}`, 20, yStart)
    yStart += 7
    doc.text(`Email: ${est.email}`, 20, yStart)
    yStart += 7
    doc.text(`Asistencias: ${est.presente} | Inasistencias: ${est.ausente} | Total: ${est.total}`, 20, yStart)
    yStart += 7
    doc.text(`Porcentaje: ${porcentaje}%`, 20, yStart)
    yStart += 10
  })
  
  return yStart
}

function generarReportePorMateria(doc, asistencias, yStart) {
  doc.setFillColor(230, 240, 255)
  doc.rect(20, yStart - 5, 170, 10, 'F')
  doc.setFontSize(14)
  doc.setTextColor(0, 51, 102)
  doc.text('REPORTE POR MATERIA', 20, yStart)
  doc.setTextColor(0, 0, 0)
  yStart += 15
  
  const porMateria = {}
  asistencias.forEach(a => {
    const key = a.materia
    if (!porMateria[key]) {
      porMateria[key] = {
        presente: 0,
        ausente: 0,
        total: 0
      }
    }
    porMateria[key].total++
    if (a.estado === 'presente') porMateria[key].presente++
    else if (a.estado === 'ausente') porMateria[key].ausente++
  })
  
  doc.setFontSize(10)
  Object.entries(porMateria).forEach(([materia, datos]) => {
    const porcentaje = ((datos.presente / datos.total) * 100).toFixed(2)
    
    if (yStart > 250) {
      doc.addPage()
      yStart = 20
    }
    
    doc.text(`Materia: ${materia}`, 20, yStart)
    yStart += 7
    doc.text(`Asistencias: ${datos.presente} | Inasistencias: ${datos.ausente} | Total: ${datos.total}`, 20, yStart)
    yStart += 7
    doc.text(`Porcentaje Promedio: ${porcentaje}%`, 20, yStart)
    yStart += 10
  })
  
  return yStart
}

function generarReportePorPeriodo(doc, asistencias, yStart) {
  doc.setFillColor(230, 240, 255)
  doc.rect(20, yStart - 5, 170, 10, 'F')
  doc.setFontSize(14)
  doc.setTextColor(0, 51, 102)
  doc.text('REPORTE POR PERÍODO', 20, yStart)
  doc.setTextColor(0, 0, 0)
  yStart += 15
  
  const porPeriodo = {}
  asistencias.forEach(a => {
    const fecha = new Date(a.fecha)
    const year = fecha.getFullYear()
    const mes = fecha.getMonth() + 1
    
    let semestre, periodoYear
    if (mes >= 4 && mes <= 7) {
      semestre = 1
      periodoYear = year
    } else if (mes >= 9 && mes <= 12) {
      semestre = 2
      periodoYear = year
    } else if (mes >= 1 && mes <= 3) {
      semestre = 2
      periodoYear = year - 1
    } else {
      semestre = 1
      periodoYear = year + 1
    }
    const periodo = `${periodoYear}-${semestre}`
    
    if (!porPeriodo[periodo]) {
      porPeriodo[periodo] = {
        presente: 0,
        ausente: 0,
        total: 0
      }
    }
    porPeriodo[periodo].total++
    if (a.estado === 'presente') porPeriodo[periodo].presente++
    else if (a.estado === 'ausente') porPeriodo[periodo].ausente++
  })
  
  doc.setFontSize(10)
  Object.entries(porPeriodo)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([periodo, datos]) => {
      const porcentaje = ((datos.presente / datos.total) * 100).toFixed(2)
      
      if (yStart > 250) {
        doc.addPage()
        yStart = 20
      }
      
      doc.text(`Período: ${periodo}`, 20, yStart)
      yStart += 7
      doc.text(`Asistencias: ${datos.presente} | Inasistencias: ${datos.ausente} | Total: ${datos.total}`, 20, yStart)
      yStart += 7
      doc.text(`Porcentaje: ${porcentaje}%`, 20, yStart)
      yStart += 10
    })
  
  return yStart
}

function generarReporteGeneral(doc, asistencias, yStart) {
  doc.setFillColor(230, 240, 255)
  doc.rect(20, yStart - 5, 170, 10, 'F')
  doc.setFontSize(14)
  doc.setTextColor(0, 51, 102)
  doc.text('REPORTE GENERAL', 20, yStart)
  doc.setTextColor(0, 0, 0)
  yStart += 15
  
  let totalPresente = 0
  let totalAusente = 0
  let totalAsistencias = asistencias.length
  const materias = new Set()
  const estudiantes = new Set()
  
  asistencias.forEach(a => {
    if (a.estado === 'presente') totalPresente++
    else if (a.estado === 'ausente') totalAusente++
    materias.add(a.materia)
    estudiantes.add(a.matricula)
  })
  
  const porcentaje = ((totalPresente / totalAsistencias) * 100).toFixed(2)
  
  doc.setFontSize(11)
  doc.text(`Total de Registros: ${totalAsistencias}`, 20, yStart)
  yStart += 8
  doc.text(`Asistencias: ${totalPresente}`, 20, yStart)
  yStart += 8
  doc.text(`Inasistencias: ${totalAusente}`, 20, yStart)
  yStart += 8
  doc.text(`Porcentaje General: ${porcentaje}%`, 20, yStart)
  yStart += 8
  doc.text(`Materias Reportadas: ${materias.size}`, 20, yStart)
  yStart += 8
  doc.text(`Estudiantes Reportados: ${estudiantes.size}`, 20, yStart)
  yStart += 15
  
  return yStart
}