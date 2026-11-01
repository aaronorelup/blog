// The figures a chart element is drawn from, read once out of its plain <table>, which stays for screen readers and
// readers without JS. Read by ao-bars, ao-series, ao-runs and ao-treemap.

// The header cells' text and data-unit ('' without one), and each body row's cells as trimmed text.
export const readTable = (table) => {
  const ths = [...table.querySelectorAll('thead th')];
  return {
    head: ths.map((th) => th.textContent.trim()),
    units: ths.map((th) => th.dataset.unit || ''),
    rows: [...table.querySelectorAll('tbody tr')].map((tr) => [...tr.children].map((c) => c.textContent.trim())),
  };
};

// The number in a cell however it is written ("1,634", "12%", "$3.50"); NaN when there is none.
export const cellNumber = (text) => parseFloat(String(text || '').replace(/[^0-9.\-]/g, ''));
