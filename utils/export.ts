export function exportJSON(data: any, filename: string) {
  const jsonData = JSON.stringify(data);
  const a = document.createElement('a');
  const file = new Blob([jsonData], { type: 'application/json' });
  a.href = URL.createObjectURL(file);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
