/*
	Cypher/Neo4j Crash Course | Special Topics: Graph Databases
	faw.jku.at | @mbahara
*/

function openNeo4jSandbox() {
  window.open("https://sandbox.neo4j.com/?usecase=blank-sandbox", "_blank");
}

function copy(id, btn) {
  const text = document.getElementById(id).innerText;
  navigator.clipboard
    .writeText(text)
    .then(() => {
      const oldText = btn.innerText;
      btn.innerText = "Copied!";
      btn.classList.add("copied");
      setTimeout(() => {
        btn.innerText = oldText;
        btn.classList.remove("copied");
      }, 2000);
    })
    .catch((err) => {
      console.error("Failed to copy: ", err);
    });
}

function openBrowser() {
  window.open("https://browser.neo4j.io/", "_blank");
}

function toggleSolution(id, btn) {
  const elem = document.getElementById(id);
  if (elem.classList.contains("hidden")) {
    elem.classList.remove("hidden");
    btn.innerText = "Hide Solution";
  } else {
    elem.classList.add("hidden");
    btn.innerText = "Show Solution";
  }
}

let apiSecretKey = null;

function getApiKey() {
  if (!apiSecretKey) {
    apiSecretKey = prompt("Please enter the API Key issued by the server:");
  }
  return apiSecretKey;
}

async function executeClear() {
  const cypher = "MATCH (n) DETACH DELETE n;";

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 500);

    const response = await fetch("http://localhost:8080/api/health", {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const key = getApiKey();
      if (!key) return;

      const clearRes = await fetch("http://localhost:8080/api/clearDB", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: key }),
      });

      if (clearRes.ok) {
        alert("Database cleared successfully.");
      } else {
        alert("Failed to clear database.");
        apiSecretKey = null;
      }
    }
  } catch (error) {
    navigator.clipboard
      .writeText(cypher)
      .then(() => {
        alert(
          `Local server not detected or CORS blocked.\n\nThe corresponding cypher query has been copied to your clipboard.`,
        );
      })
      .catch(() => {
        prompt("Please copy this command manually:", cypher);
      });
  }
}

async function load(dataset, event) {
  if (dataset === "movie") {
    const modal = document.getElementById("customModal");
    const proceedBtn = document.getElementById("modalCloseBtn");
    const cancelBtn = document.getElementById("modalCancelBtn");

    modal.style.display = "flex";

    proceedBtn.onclick = function () {
      modal.style.display = "none";
      window.open("https://demo.neo4jlabs.com:7473", "_blank");
    };

    cancelBtn.onclick = function () {
      modal.style.display = "none";
    };

    modal.onclick = function (e) {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    };

    return;
  }

  const btn = event.currentTarget;
  const originalText = btn.innerHTML;
  btn.disabled = true;
  const refreshSymbol = "&#128192";
  btn.innerHTML = `${originalText} <span class="spinner">${refreshSymbol}</span>`;

  try {
    const response = await fetch("http://localhost:8080/api/health", {
      method: "GET",
    });

    if (response.ok) {
      const key = getApiKey();
      if (!key) return;

      const loadRes = await fetch(`http://localhost:8080/api/load/${dataset}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: key }),
      });

      if (loadRes.ok) {
        alert(`Dataset '${dataset}' loaded successfully.`);
      } else {
        alert("Error loading dataset. CORS blocked.");
        apiSecretKey = null;
      }
    }
  } catch (error) {
    console.log(
      "Local server not detected or CORS blocked. Load command ignored.",
    );
    alert(
      "This feature requires the local Java server to be running on localhost:8080.",
    );
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const solutions = {
    1: "MATCH (m:Movie) WHERE m.released >= 1990 AND m.released <= 2000 RETURN m.title, m.released ORDER BY m.released DESC;",
    2: "MATCH (p:Person)-[r:ACTED_IN]->(m:Movie {title: 'The Matrix'}) RETURN p.name, r.roles;",
    3: "MATCH (tom:Person {name: 'Tom Hanks'})-[:ACTED_IN]->(m:Movie)<-[:ACTED_IN]-(coActor:Person) RETURN DISTINCT coActor.name;",
    4: "MATCH (p:Person)-[:DIRECTED]->(m:Movie), (p)-[:ACTED_IN]->(m) RETURN p.name, m.title;",
    5: "MATCH (keanu:Person {name: 'Keanu Reeves'}), (kevin:Person {name: 'Kevin Bacon'}) MATCH p = shortestPath((keanu)-[*]-(kevin)) RETURN p, length(p); \n// OR \nMATCH (keanu:Person {name: 'Keanu Reeves'}), (kevin:Person {name: 'Kevin Bacon'}) MATCH p = SHORTEST 1 (keanu)-[*]-(kevin) RETURN [n IN nodes(p) | coalesce(n.name, n.title)] AS connection_chain, length(p) AS degrees;",
  };

  const labels = document.querySelectorAll(".ex-label");

  labels.forEach((label) => {
    label.addEventListener("click", () => {
      const exId = label.getAttribute("data-ex");
      if (solutions[exId]) {
        console.log(solutions[exId]);
      }
    });
  });
});
