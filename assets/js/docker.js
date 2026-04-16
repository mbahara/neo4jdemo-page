/*
	Cypher/Neo4j Crash Course | Special Topics: Graph Databases
	faw.jku.at | @mbahara
*/

function copyText(id, btn) {
  const text = document.getElementById(id).innerText;
  navigator.clipboard.writeText(text).then(() => {
    btn.classList.add("copied");

    const originalSvg = btn.innerHTML;
    btn.innerHTML =
      '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>';

    setTimeout(() => {
      btn.classList.remove("copied");
      btn.innerHTML = originalSvg;
    }, 2000);
  });
}
