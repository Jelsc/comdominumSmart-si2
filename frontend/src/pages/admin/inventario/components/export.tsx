import { 
  type InventarioDetallado,
  estadoInventarioLabels,
  categoriaInventarioLabels
} from "@/types/inventario";

// Funciones de exportación independientes

// Función para exportar a Excel/CSV
export const exportToExcel = (data: InventarioDetallado[], formatCurrency: (value: string | number) => string) => {
    // Preparar los datos para la exportación
    const headers = [
      "Nombre", 
      "Categoría", 
      "Estado", 
      "Área Común", 
      "Valor Estimado", 
      "Ubicación", 
      "Fecha Adquisición"
    ];

    // Asegurar que los separadores sean correctos para Excel (punto y coma en lugar de coma)
    const csvContent = [
      headers.join(';'),
      ...data.map(item => [
        `"${item.nombre.replace(/"/g, '""')}"`,
        `"${categoriaInventarioLabels[item.categoria].replace(/"/g, '""')}"`,
        `"${estadoInventarioLabels[item.estado].replace(/"/g, '""')}"`,
        `"${item.area_comun ? item.area_comun.nombre.replace(/"/g, '""') : ""}"`,
        `"${typeof item.valor_estimado === 'number' ? item.valor_estimado.toString().replace('.', ',') : item.valor_estimado.replace('.', ',')}"`,
        `"${item.ubicacion.replace(/"/g, '""')}"`,
        `"${new Date(item.fecha_adquisicion).toLocaleDateString()}"`,
      ].join(';'))
    ].join('\n');

    // Añadir BOM (Byte Order Mark) para asegurar que Excel reconozca el UTF-8
    const BOM = "\uFEFF";
    const csvContentWithBOM = BOM + csvContent;
    
    // Crear un objeto Blob con los datos
    const blob = new Blob([csvContentWithBOM], { type: 'text/csv;charset=utf-8;' });
    
    // Crear un enlace de descarga
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "inventario.csv");
    document.body.appendChild(link);
    
    // Iniciar la descarga
    link.click();
    
    // Limpiar
    document.body.removeChild(link);
  };

// Función para exportar a PDF
export const exportToPDF = (data: InventarioDetallado[], formatCurrency: (value: string | number) => string) => {
    // Usando window.print() como solución provisional
    // Esta función abrirá el diálogo de impresión del navegador, donde el usuario puede guardar como PDF
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor, permita ventanas emergentes para imprimir la tabla.');
      return;
    }
    
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Inventario - Exportación</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; text-align: center; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .footer { text-align: center; font-size: 12px; color: #666; margin-top: 30px; }
          @media print {
            .no-print { display: none; }
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        <h1>Reporte de Inventario</h1>
        <p>Fecha de generación: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Estado</th>
              <th>Área Común</th>
              <th>Valor Estimado</th>
              <th>Ubicación</th>
              <th>Fecha Adquisición</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(item => `
              <tr>
                <td>${item.nombre}</td>
                <td>${categoriaInventarioLabels[item.categoria]}</td>
                <td>${estadoInventarioLabels[item.estado]}</td>
                <td>${item.area_comun ? item.area_comun.nombre : "—"}</td>
                <td>${formatCurrency(item.valor_estimado)}</td>
                <td>${item.ubicacion}</td>
                <td>${new Date(item.fecha_adquisicion).toLocaleDateString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">
          <p>Generado por Sistema de Administración de Condominio</p>
        </div>
        <div class="no-print">
          <button onclick="window.print()">Imprimir o Guardar como PDF</button>
          <button onclick="window.close()">Cerrar</button>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Dar tiempo a que se cargue el contenido antes de imprimir
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);
  };