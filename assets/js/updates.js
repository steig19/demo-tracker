async function loadUpdates() {

  const container = document.getElementById("updates-feed");

  try {

    const res = await fetch(window.UPDATES_INDEX);
    const data = await res.json();

    const updates = data.updates || [];

    if (updates.length === 0) {
      container.innerHTML = "<p>No updates yet.</p>";
      return;
    }

    const sorted = updates.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    for (const entry of sorted) {

      const mdRes = await fetch(window.UPDATES_DIR + entry.file);

      if (!mdRes.ok) {
        console.error("Update file not found:", window.UPDATES_DIR + entry.file);
        continue;
      }
      const markdown = await mdRes.text();
      const html = renderMarkdown(markdown);

      const article = document.createElement("article");
      article.className = "update-entry";

      article.innerHTML = `
        <header>
          <h2>${entry.title}</h2>
          <div class="update-meta">
            ${entry.date} · Mile ${entry.mile}
          </div>
        </header>
        <div class="update-body">
          ${html}
        </div>
      `;

      container.appendChild(article);
    }

  } catch (err) {

    console.error(err);
    container.innerHTML = "<p>Unable to load updates.</p>";

  }

}

loadUpdates();
