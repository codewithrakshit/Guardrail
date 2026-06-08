async function loadModPanel() {
  const statusEl = document.getElementById('status');
  const container = document.getElementById('patchesContainer');

  statusEl.className = 'loading';
  statusEl.textContent = 'Loading patches...';
  container.innerHTML = '';

  try {
    const res = await fetch('/api/patch');
    if (!res.ok) {
      throw new Error(`Server error: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    const patches = data.patches || [];

    if (patches.length === 0) {
      statusEl.className = '';
      statusEl.innerHTML = '<div class="patch-empty"><h3>No patches available</h3><p>No mod security patches have been generated yet. Run a scan and generate a fix to see patches here.</p></div>';
      return;
    }

    statusEl.className = '';
    statusEl.textContent = `${patches.length} patch${patches.length > 1 ? 'es' : ''} available`;
    statusEl.style.cssText = 'text-align: left; padding: 0 0 1rem; color: var(--green);';

    container.innerHTML = patches.map(patch => `
      <div class="patch-card">
        <div class="patch-hd">
          <span class="patch-file">${escapeHtml(patch.filename || patch.id || 'unknown')}</span>
          <span class="badge badge-safe">&#x2713; Patched</span>
        </div>
        <div class="patch-meta">
          <span class="badge badge-info">Confidence: ${patch.confidence || 'N/A'}%</span>
          ${patch.language ? `<span class="badge badge-info">${escapeHtml(patch.language)}</span>` : ''}
          ${patch.createdAt ? `<span class="badge badge-info">${new Date(patch.createdAt).toLocaleString()}</span>` : ''}
        </div>
        ${patch.explanation ? `<div class="patch-desc">${escapeHtml(patch.explanation)}</div>` : ''}
        ${patch.secureCode ? `<div class="patch-code">${escapeHtml(patch.secureCode)}</div>` : ''}
      </div>
    `).join('');

  } catch (err) {
    statusEl.className = 'error';
    statusEl.textContent = `Failed to load patches: ${err.message}`;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', () => {
  loadModPanel();
  document.getElementById('refreshBtn').addEventListener('click', loadModPanel);
});
