// Endpoint do backend
const apiCat = 'http://localhost:8080/categoria';

/* Helpers */
function getEl(id) { return document.getElementById(id); }
function safeJson(r) { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }
function toStr(v) { return (v === null || v === undefined || v === '') ? '-' : String(v); }

/* ==============================
   LISTAR
   ============================== */
function getCategoria() {
    fetch(apiCat)
        .then(safeJson)
        .then(data => {
            const ul = getEl('categoria-list');
            if (!ul) return;
            ul.innerHTML = '';

            (Array.isArray(data) ? data : []).forEach(cat => {
                const li = document.createElement('li');
                li.innerHTML = `
          <div class="cat-line"><strong>Nome:</strong> <span>${toStr(cat.nome)}</span></div>
          <div class="cat-line"><strong>Descrição:</strong> <span>${toStr(cat.descricao)}</span></div>
          <div class="cat-actions">
            <select onchange="handleSelectCategoria(event, ${cat.id})">
              <option value="">Ação</option>
              <option value="editar">Editar</option>
              <option value="excluir">Excluir</option>
            </select>
          </div>
        `;
                ul.appendChild(li);
            });

            if (!ul.children.length) {
                ul.innerHTML = '<li>Nenhuma categoria cadastrada.</li>';
            }
        })
        .catch(err => {
            console.error('Erro ao listar categorias:', err);
            const ul = getEl('categoria-list');
            if (ul) ul.innerHTML = '<li>Não foi possível carregar as categorias.</li>';
        });
}

/* ==============================
   CRIAR / ATUALIZAR
   ============================== */
async function createOrUpdateCategoria(event) {
    event.preventDefault();

    const id = getEl('categoria-id')?.value?.trim() || '';
    const nome = getEl('nome')?.value?.trim() || '';
    const descricao = getEl('descricao')?.value?.trim() || '';

    const payload = { nome, descricao };
    const isEdit = !!id;

    try {
        const resp = await fetch(apiCat, {
            method: isEdit ? 'PUT' : 'POST',           // backend aceita id no corpo para PUT
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(isEdit ? { ...payload, id: Number(id) } : payload)
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

        const form = getEl('categoria-form');
        if (form) {
            form.reset();
            const idEl = getEl('categoria-id');
            if (idEl) idEl.value = '';
            const btn = form.querySelector('button[type="submit"]');
            if (btn) btn.textContent = 'Cadastrar';
        }

        getCategoria();
    } catch (err) {
        console.error('Erro ao salvar categoria:', err);
        alert('Não foi possível salvar a categoria.');
    }
}

/* ==============================
   EDITAR / EXCLUIR
   ============================== */
function handleSelectCategoria(event, catId) {
    const action = event.target.value;

    if (action === 'editar') {
        fetch(apiCat)
            .then(safeJson)
            .then(list => {
                const cat = (Array.isArray(list) ? list : []).find(c => String(c.id) === String(catId));
                if (!cat) return alert('Categoria não encontrada!');

                const idEl = getEl('categoria-id');
                if (idEl) idEl.value = cat.id ?? '';

                const nomeEl = getEl('nome');
                if (nomeEl) nomeEl.value = cat.nome ?? '';

                const descEl = getEl('descricao');
                if (descEl) descEl.value = cat.descricao ?? '';

                const form = getEl('categoria-form');
                const btn = form?.querySelector('button[type="submit"]');
                if (btn) btn.textContent = 'Salvar Edição';
            })
            .catch(err => {
                console.error('Erro ao carregar categoria para edição:', err);
                alert('Não foi possível carregar a categoria para edição.');
            })
            .finally(() => { event.target.value = ''; });
    }

    if (action === 'excluir') {
        const popup = getEl('popup');
        if (!popup) return;
        popup.style.display = 'flex';

        const confirmBtn = getEl('confirm-delete');
        const cancelBtn = getEl('cancel-delete');

        if (confirmBtn) {
            confirmBtn.onclick = () => {
                deleteCategoria(catId);
                popup.style.display = 'none';
                event.target.value = '';
            };
        }
        if (cancelBtn) {
            cancelBtn.onclick = () => {
                popup.style.display = 'none';
                event.target.value = '';
            };
        }
    }
}

/* ==============================
   EXCLUIR
   ============================== */
function deleteCategoria(id) {
    fetch(`${apiCat}/${id}`, { method: 'DELETE' })
        .then(r => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            getCategoria();
        })
        .catch(err => {
            console.error('Erro ao excluir categoria:', err);
            alert('Não foi possível excluir a categoria.');
        });
}

/* ==============================
   BOOTSTRAP
   ============================== */
window.onload = getCategoria;

const catForm = getEl('categoria-form');
if (catForm) {
    catForm.addEventListener('submit', createOrUpdateCategoria);
}
