// Utilidad para convertir PDF membretado a imagen para fondo de reporte
export async function getMembretadaImage() {
  // Cargar el PDF membretado como imagen (usando una página de preview)
  // Como jsPDF no soporta PDF como fondo, se recomienda exportar la hoja membretada como PNG y colocarla en public/
  // Aquí se asume que existe 'public/hoja_membretada.png'
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.src = process.env.PUBLIC_URL
      ? process.env.PUBLIC_URL + '/hoja_membretada.png'
      : '/hoja_membretada.png';
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
}
