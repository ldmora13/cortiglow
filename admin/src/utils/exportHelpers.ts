import * as XLSX from 'xlsx';

// Exportar datos a CSV
export function exportToCSV(data: any[], filename: string): void {
  if (!data || data.length === 0) {
    throw new Error('No hay datos para exportar');
  }

  // Convertir objetos a formato CSV
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];

  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      // Escapar comillas y valores con comas
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvRows.push(values.join(','));
  });

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadFile(blob, `${filename}.csv`);
}

// Exportar datos a Excel
export function exportToExcel(data: any[], filename: string, sheetName: string = 'Datos'): void {
  if (!data || data.length === 0) {
    throw new Error('No hay datos para exportar');
  }

  // Crear workbook
  const workbook = XLSX.utils.book_new();
  
  // Convertir datos a worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Agregar worksheet al workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // Generar archivo y descargar
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

// Exportar múltiples hojas a Excel
export function exportMultipleSheetsToExcel(
  sheets: Array<{ data: any[]; name: string }>,
  filename: string
): void {
  if (!sheets || sheets.length === 0) {
    throw new Error('No hay datos para exportar');
  }

  const workbook = XLSX.utils.book_new();

  sheets.forEach(sheet => {
    if (sheet.data && sheet.data.length > 0) {
      const worksheet = XLSX.utils.json_to_sheet(sheet.data);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
    }
  });

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

// Función auxiliar para descargar archivo
function downloadFile(blob: Blob, filename: string): void {
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Formatear datos para exportación (limpiar campos innecesarios)
export function prepareDataForExport(data: any[], fieldsToInclude?: string[]): any[] {
  return data.map(item => {
    if (fieldsToInclude) {
      // Solo incluir campos especificados
      const filtered: any = {};
      fieldsToInclude.forEach(field => {
        if (item[field] !== undefined) {
          filtered[field] = item[field];
        }
      });
      return filtered;
    }
    
    // Remover campos no deseados
    const { __typename, ...cleaned } = item;
    return cleaned;
  });
}

// Formatear fecha para nombre de archivo
export function getExportFilename(prefix: string): string {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
  return `${prefix}_${dateStr}_${timeStr}`;
}

