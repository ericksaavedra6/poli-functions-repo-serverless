
const endpoints = {
    //https://getdrivers-2dwszxyllq-uc.a.run.app
    //
    //
   //
  list: "https://getdrivers-2dwszxyllq-uc.a.run.app",
  byId: "https://getdriverbyid-2dwszxyllq-uc.a.run.app",
  byName: "https://searchdriversbyname-2dwszxyllq-uc.a.run.app",
  champions: "https://getchampions-2dwszxyllq-uc.a.run.app",
};

const statusEl = document.getElementById("status");
const resultsBody = document.getElementById("resultsBody");
const metricResults = document.getElementById("metricResults");

const driverIdInput = document.getElementById("driverIdInput");
const driverNameInput = document.getElementById("driverNameInput");

const loadDriversBtn = document.getElementById("loadDriversBtn");
const loadChampionsBtn = document.getElementById("loadChampionsBtn");
const searchIdBtn = document.getElementById("searchIdBtn");
const searchNameBtn = document.getElementById("searchNameBtn");
const clearBtn = document.getElementById("clearBtn");

function setStatus(message) {
  statusEl.textContent = message;
}

function setMetricResults(value) {
  metricResults.textContent = String(value);
}

function badge(value) {
  return value
    ? '<span class="badge badge-yes">Sí</span>'
    : '<span class="badge badge-no">No</span>';
}

function renderRows(data) {
  resultsBody.innerHTML = "";

  if (!data || data.length === 0) {
    resultsBody.innerHTML = `
      <tr>
        <td colspan="10" class="empty-row">No se encontraron resultados</td>
      </tr>
    `;
    setMetricResults(0);
    return;
  }

  data.forEach((item) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${item.id ?? ""}</td>
      <td>${item.driver ?? ""}</td>
      <td>${item.nationality ?? ""}</td>
      <td>${item.decade ?? ""}</td>
      <td>${item.championships ?? 0}</td>
      <td>${item.raceWins ?? 0}</td>
      <td>${item.podiums ?? 0}</td>
      <td>${item.points ?? 0}</td>
      <td>${badge(Boolean(item.active))}</td>
      <td>${badge(Boolean(item.champion))}</td>
    `;

    resultsBody.appendChild(row);
  });

  setMetricResults(data.length);
}

async function fetchJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    let errorMessage = `Error HTTP ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch (error) {
      // Ignorar si no viene JSON
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

async function loadDrivers() {
  try {
    setStatus("Cargando pilotos...");
    const data = await fetchJson(endpoints.list);
    renderRows(data);
    setStatus(`Se cargaron ${data.length} pilotos`);
  } catch (error) {
    renderRows([]);
    setStatus(`Error al listar pilotos: ${error.message}`);
  }
}

async function loadChampions() {
  try {
    setStatus("Consultando campeones...");
    const data = await fetchJson(endpoints.champions);
    renderRows(data);
    setStatus(`Se encontraron ${data.length} campeones`);
  } catch (error) {
    renderRows([]);
    setStatus(`Error al consultar campeones: ${error.message}`);
  }
}

async function searchById() {
  const id = driverIdInput.value.trim();

  if (!id) {
    setStatus("Debes ingresar un ID");
    return;
  }

  try {
    setStatus("Buscando por ID...");
    const data = await fetchJson(`${endpoints.byId}?id=${encodeURIComponent(id)}`);
    renderRows([data]);
    setStatus("Piloto encontrado");
  } catch (error) {
    renderRows([]);
    setStatus(`Error en búsqueda por ID: ${error.message}`);
  }
}

async function searchByName() {
  const name = driverNameInput.value.trim();

  if (!name) {
    setStatus("Debes ingresar un nombre");
    return;
  }

  try {
    setStatus("Buscando por nombre...");
    const data = await fetchJson(`${endpoints.byName}?name=${encodeURIComponent(name)}`);
    renderRows(data);
    setStatus(`Resultados encontrados: ${data.length}`);
  } catch (error) {
    renderRows([]);
    setStatus(`Error en búsqueda por nombre: ${error.message}`);
  }
}

function clearResults() {
  driverIdInput.value = "";
  driverNameInput.value = "";
  resultsBody.innerHTML = `
    <tr>
      <td colspan="10" class="empty-row">Resultados limpiados</td>
    </tr>
  `;
  setMetricResults(0);
  setStatus("Formulario y resultados limpiados");
}

loadDriversBtn.addEventListener("click", loadDrivers);
loadChampionsBtn.addEventListener("click", loadChampions);
searchIdBtn.addEventListener("click", searchById);
searchNameBtn.addEventListener("click", searchByName);
clearBtn.addEventListener("click", clearResults);

driverIdInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    searchById();
  }
});

driverNameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    searchByName();
  }
});

loadDrivers();