document.addEventListener("DOMContentLoaded", function () {

  const input = document.querySelector('input[placeholder="Поиск по статьям..."]');
  const resultsContainer = document.getElementById("search-results");

  if (!input) return;

  fetch("/index.json")
    .then(response => response.json())
    .then(data => {

      const idx = lunr(function () {
        this.ref("url");
        this.field("title");
        this.field("content");

        data.forEach(function (doc) {
          this.add(doc);
        }, this);
      });

      input.addEventListener("input", function () {
        const query = input.value;

        if (query.length < 2) {
          resultsContainer.innerHTML = "";
          return;
        }

        const results = idx.search(query);

        resultsContainer.innerHTML = "";

        results.forEach(function (result) {
          const match = data.find(d => d.url === result.ref);

          const item = document.createElement("div");
          item.className = "search-item";
          item.innerHTML = `
            <h4><a href="${match.url}">${match.title}</a></h4>
            <p>${match.date} · ${match.author || ""}</p>
          `;

          resultsContainer.appendChild(item);
        });

      });

    });

});
