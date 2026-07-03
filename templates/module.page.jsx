// The MODULE'S VISUALIZATION. Every module ships one. Reuse the shared UI classes; fetch
// only this module's own /api routes. Register it in the PAGES map under manifest.surface.
import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.js';

export default function Thing() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get('/api/thing').then((r) => setItems(r.items || [])); }, []);

  return (
    <div>
      <h1 className="page-title">Thing</h1>
      {/* Standard shape: list on the left, detail on the right, one primary action.
          Reuse the design system's classes; do not invent new CSS. */}
      <div className="panel panel-pad">
        {items.map((it) => <div key={it.id}>{it.name}</div>)}
      </div>
    </div>
  );
}
