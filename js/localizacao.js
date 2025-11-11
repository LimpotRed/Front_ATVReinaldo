const apiLoc = 'http://localhost:8080/localizacao';

const $ = (id) => document.getElementById(id);
const getEl = (ids) => ids.map($).find(Boolean) || null;
const getVal = (ids) => (getEl(ids)?.value ?? '').trim();

function safeJson(r) { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }
function toStr(v) { return (v === null || v === undefined || v === '') ? '-' : String(v); }

function getLocalizacao() {
  fetch(apiLoc).then(safeJson).then(data => {
    const ul = getEl(['btnListaLocalizacoes', 'localizacao-list']);
    if (!ul) return;
    ul.innerHTML = '';
    (Array.isArray(data) ? data : []).forEach(loc => {
      const li = document.createElement('li');
      li.innerHTML = `
        <div class="loc-line"><strong>Nome:</strong> <span>${toStr(loc.nome)}</span></div>
        <div class="loc-line"><strong>Descrição:</strong> <span>${toStr(loc.descricao)}</span></div>
        <div class="loc-actions">
          <select onchange="handleSelectLocalizacao(event, ${loc.id})">
            <option value="">Ação</option>
            <option value="editar">Editar</option>
            <option value="excluir">Excluir</option>
          </select>
        </div>`;
      ul.appendChild(li);
    });
    if (!ul.children.length) ul.innerHTML = '<li>Nenhuma localização cadastrada.</li>';
  }).catch(err => {
    console.error('Erro ao listar localizações:', err);
    const ul = getEl(['btnListaLocalizacoes', 'localizacao-list']);
    if (ul) ul.innerHTML = '<li>Erro ao carregar localizações.</li>';
  });
}

async function createOrUpdateLocalizacao(e) {
  e.preventDefault();
  const id = getVal(['btnIdLocalizacao', 'localizacao-id']);
  const nome = getVal(['btnCampoNomeLocalizacao', 'nome']);
  const descricao = getVal(['btnCampoDescricaoLocalizacao', 'descricao']);

  const isEdit = !!id;
  const resp = await fetch(apiLoc, {
    method: isEdit ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(isEdit ? { id: Number(id), nome, descricao } : { nome, descricao })
  });

  if (!resp.ok) {
    const txt = await resp.text().catch(() => '');
    console.error('Resposta do servidor:', resp.status, txt);
    alert('Não foi possível salvar a localização.');
    return;
  }

  const form = getEl(['btnFormLocalizacao', 'localizacao-form']);
  form?.reset();
  (getEl(['btnIdLocalizacao', 'localizacao-id']) || {}).value = '';
  const btn = form?.querySelector('button[type="submit"]'); if (btn) btn.textContent = 'Cadastrar';
  getLocalizacao();
}

function handleSelectLocalizacao(ev, id) {
  const action = ev.target.value;
  if (action === 'editar') {
    fetch(apiLoc).then(r => r.json()).then(list => {
      const loc = list.find(x => String(x.id) === String(id));
      if (!loc) return alert('Localização não encontrada');
      (getEl(['btnIdLocalizacao', 'localizacao-id']) || {}).value = loc.id ?? '';
      (getEl(['btnCampoNomeLocalizacao', 'nome']) || {}).value = loc.nome ?? '';
      (getEl(['btnCampoDescricaoLocalizacao', 'descricao']) || {}).value = loc.descricao ?? '';
      const form = getEl(['btnFormLocalizacao', 'localizacao-form']);
      const btn = form?.querySelector('button[type="submit"]'); if (btn) btn.textContent = 'Salvar Edição';
    }).finally(() => { ev.target.value = ''; });
  }
  if (action === 'excluir') {
    const popup = $('popup'); popup.style.display = 'flex';
    const ok = $('btnConfirmarExclusao') || $('confirm-delete');
    const cancel = $('btnCancelarExclusao') || $('cancel-delete');
    ok.onclick = () => { deleteLocalizacao(id); popup.style.display = 'none'; ev.target.value = ''; };
    cancel.onclick = () => popup.style.display = 'none';
  }
}

function deleteLocalizacao(id) {
  fetch(`${apiLoc}/${id}`, { method: 'DELETE' })
    .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); getLocalizacao(); })
    .catch(err => { console.error('Erro ao excluir local:', err); alert('Não foi possível excluir.'); });
}

window.onload = getLocalizacao;
(getEl(['btnFormLocalizacao', 'localizacao-form']) || {}).addEventListener?.('submit', createOrUpdateLocalizacao);
