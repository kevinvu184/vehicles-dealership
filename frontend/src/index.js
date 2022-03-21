const url = "https://cy30854e9g.execute-api.ap-southeast-2.amazonaws.com";

async function loadTableData() {
  const tableBody = document.querySelector("#dealers-table");
  const response = await fetch(`${url}/dealers`);

  if (response.ok) {
    const data = await response.json();
    for (let i = 0; i < data.length; i++) {
      const row = tableBody.insertRow();
      for (const key in data[i]) {
        const cell = row.insertCell();
        cell.innerHTML = data[i][key];
      }
      row.insertCell().innerHTML = `<button class="btn btn-primary" onclick="loadRowData('${data[i].bac}')">Details</button>`;
    }
  } else {
    console.error("Error");
  }
}

async function loadRowData(id) {
  const tableBody = document.querySelector("#vehicles-table");
  const response = await fetch(`${url}/vehicles/${id}`);

  if (response.ok) {
    const data = await response.json();
    const row = tableBody.insertRow();
    row.insertCell().innerHTML = data.bac;
    row.insertCell().innerHTML = data.vin;
    row.insertCell().innerHTML = data.ctpStatus;
    row.insertCell().innerHTML = data.onstarStatus;
    row.insertCell().innerHTML = data.createdAt;
    row.insertCell().innerHTML = data.color;
    row.insertCell().innerHTML = data.stockNumber;
    row.insertCell().innerHTML = data.year;
  } else {
    console.error("Error");
  }
}

loadTableData();