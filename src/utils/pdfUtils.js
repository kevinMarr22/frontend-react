// src/utils/pdfUtils.js
// Utilidad para exportar reportes a PDF usando jsPDF y html2canvas

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


export async function exportarReportePDF(elementId, nombre = 'reporte.pdf') {
  // Obtener datos del DOM para el PDF formal
  const input = document.getElementById(elementId);
  if (!input) return;

  // Buscar nombre del trabajador y tareas
  let trabajador = '';
  let tareas = [];
  let totalPagado = 0;
  let saldoPendiente = 0;
  // Buscar en el DOM los datos renderizados
  const h3 = input.querySelector('h3');
  if (h3) trabajador = h3.textContent.replace('Tareas realizadas por ', '').trim();
  // Buscar tarjetas de tarea (unificar lógica para cards de usuario y cards de "hoy")
  const cards = input.querySelectorAll('div[style*="border-left"], .card.tarea-card');
  if (cards.length > 0) {
    tareas = Array.from(cards).map(card => {
      // Título
      let titulo = '';
      const strong = card.querySelector('strong');
      const h3 = card.querySelector('h3');
      if (strong) {
        titulo = strong.textContent;
      } else if (h3) {
        titulo = h3.textContent;
      }
      // Descripción
      let desc = '';
      const descSpan = Array.from(card.querySelectorAll('span')).find(s => s.style && s.style.color === 'rgb(85, 85, 85)');
      const descP = card.querySelector('p.tarea-desc');
      if (descP) {
        desc = descP.textContent;
      } else if (descSpan) {
        desc = descSpan.textContent;
      } else {
        // fallback: primer span que no sea pago ni estado
        const fallbackSpan = Array.from(card.querySelectorAll('span')).find(s => s.textContent && !s.textContent.includes('Pago:') && !s.textContent.includes('Estado:') && !s.textContent.includes('Pagado') && !s.textContent.includes('Pendiente'));
        if (fallbackSpan) desc = fallbackSpan.textContent;
      }
      // Pago
      let pago = '';
      const pagoSpan = Array.from(card.querySelectorAll('span')).find(s => s.textContent && s.textContent.includes('Pago:'));
      if (pagoSpan) {
        pago = pagoSpan.textContent.replace(/[^\d.]/g, '');
      } else {
        // Buscar en div.tarea-info
        const pagoInfo = Array.from(card.querySelectorAll('span')).find(s => s.textContent && s.textContent.includes('Pago:'));
        if (pagoInfo) pago = pagoInfo.textContent.replace(/[^\d.]/g, '');
      }
      // Estado
      let estado = '';
      const bEstado = card.querySelector('b');
      const estadoSpan = card.querySelector('.tarea-estado');
      if (bEstado) {
        estado = bEstado.textContent;
      } else if (estadoSpan) {
        estado = estadoSpan.textContent;
      }
      // Pagado/Pendiente
      let pagado = false;
      const pagadoSpan = Array.from(card.querySelectorAll('span')).find(s => s.textContent && (s.textContent.includes('Pagado') || s.textContent.includes('Pendiente')));
      if (pagadoSpan && pagadoSpan.textContent.includes('Pagado')) pagado = true;
      return { titulo, desc, pago, estado, pagado };
    });
    // Calcular totales
    totalPagado = tareas.reduce((acc, t) => t.pagado ? acc + (parseFloat(t.pago) || 0) : acc, 0);
    saldoPendiente = tareas.reduce((acc, t) => !t.pagado ? acc + (parseFloat(t.pago) || 0) : acc, 0);
  }

  // Si no hay tarjetas, buscar filas de tabla (vista general)
  if (tareas.length === 0) {
    const filas = input.querySelectorAll('tbody tr');
    tareas = Array.from(filas).map(tr => {
      const tds = tr.querySelectorAll('td');
      return {
        titulo: tds[0]?.textContent || '',
        pago: tds[1]?.textContent?.replace(/[^\d.]/g, '') || '',
        estado: '',
        desc: ''
      };
    });
    totalPagado = tareas.reduce((acc, t) => acc + (parseFloat(t.pago) || 0), 0);
    saldoPendiente = 0;
  }

  // Buscar periodo y calcular rango de fechas
  let periodo = '';
  let fechaInicio = '';
  let fechaFin = '';
  const periodoBtn = document.querySelector('button[style*="background: rgb(40, 167, 69)"]');
  if (periodoBtn) {
    periodo = periodoBtn.textContent.trim();
  }
  // Calcular fechas según periodo
  const hoy = new Date();
  if (periodo === 'Hoy') {
    fechaInicio = fechaFin = hoy.toLocaleDateString();
  } else if (periodo === 'Semana') {
    const first = new Date(hoy.setDate(hoy.getDate() - hoy.getDay() + 1));
    const last = new Date(hoy.setDate(first.getDate() + 6));
    fechaInicio = first.toLocaleDateString();
    fechaFin = last.toLocaleDateString();
  } else if (periodo === 'Mes') {
    const first = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const last = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    fechaInicio = first.toLocaleDateString();
    fechaFin = last.toLocaleDateString();
  } else {
    // Todos o sin filtro
    fechaInicio = '';
    fechaFin = '';
  }

  // Crear PDF formal
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  pdf.setFontSize(18);
  pdf.text('Reporte de Tareas', 40, 50);
  if (trabajador) {
    pdf.setFontSize(14);
    pdf.text('Trabajador: ' + trabajador, 40, 80);
  }
  pdf.setFontSize(12);
  if (fechaInicio && fechaFin) {
    pdf.text(`Periodo: ${fechaInicio} a ${fechaFin}`, 40, 100);
  } else {
    pdf.text('Fecha de generación: ' + new Date().toLocaleDateString(), 40, 100);
  }

  // Tabla de tareas
  if (tareas.length > 0) {
    autoTable(pdf, {
      startY: 120,
      head: [['Tarea', 'Descripción', 'Pago', 'Estado']],
      body: tareas.map(t => [t.titulo, t.desc, t.pago ? 'Q' + t.pago : '', t.estado]),
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [40, 167, 69] },
      theme: 'grid',
    });
  } else {
    pdf.text('No hay tareas para mostrar.', 40, 130);
  }

  // Resumen de pagos
  let y = pdf.lastAutoTable ? pdf.lastAutoTable.finalY + 30 : 160;
  pdf.setFontSize(13);
  pdf.text('Total pagado: Q' + totalPagado.toFixed(2), 40, y);
  pdf.text('Saldo pendiente: Q' + saldoPendiente.toFixed(2), 40, y + 20);

  pdf.save(nombre);
}
