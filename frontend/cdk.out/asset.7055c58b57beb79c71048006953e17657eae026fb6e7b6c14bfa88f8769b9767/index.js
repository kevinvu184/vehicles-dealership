async function loadTableData(url) {
  const tableBody = document.querySelector("tbody");
  const response = await fetch(url);

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
  const response = await fetch(`https://bb61co4l22.execute-api.us-west-2.amazonaws.com/development/vehicles/${id}`);
  if (response.ok) {
    const data = await response.json();
    document.querySelector("#details").innerHTML = "<div><pre>" + JSON.stringify(data, null, 2) + "</pre></div>";
  } else {
    console.error("Error");
  }
}

loadTableData('https://bb61co4l22.execute-api.us-west-2.amazonaws.com/development/dealers');