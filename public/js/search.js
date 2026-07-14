document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("articlesSearch");
  const items = Array.from(document.querySelectorAll(".article-item"));
  const emptyMessage = document.getElementById("articlesEmpty");

  const categoryFilter = document.getElementById("categoryFilter");
  const categoryFilterButton = document.getElementById("categoryFilterButton");
  const categoryFilterDropdown = document.getElementById("categoryFilterDropdown");
  const categoryAll = document.getElementById("categoryAll");

  const categoryOptions = Array.from(
  categoryFilterDropdown.querySelectorAll(".category-filter-option")
  ).filter(option => option.querySelector(".category-checkbox"));

  categoryOptions
    .sort((firstOption, secondOption) => {
      const firstCategory =
        firstOption.querySelector(".category-checkbox").value;

      const secondCategory =
        secondOption.querySelector(".category-checkbox").value;

      return firstCategory.localeCompare(secondCategory, "ru", {
        sensitivity: "base"
      });
    })
    .forEach(option => {
      categoryFilterDropdown.appendChild(option);
    });

  const categoryCheckboxes = Array.from(
    document.querySelectorAll(".category-checkbox")
  );

  if (
    !input ||
    items.length === 0 ||
    !categoryFilter ||
    !categoryFilterButton ||
    !categoryFilterDropdown ||
    !categoryAll
  ) {
    return;
  }

  const getSelectedCategories = () => {
    return categoryCheckboxes
      .filter(checkbox => checkbox.checked)
      .map(checkbox => checkbox.value);
  };

  const updateCategoryButton = () => {
    const selectedCategories = getSelectedCategories();

    if (selectedCategories.length === 0) {
      categoryFilterButton.textContent = "Все категории";
      return;
    }

    if (selectedCategories.length <= 2) {
      categoryFilterButton.textContent = selectedCategories.join(", ");
      return;
    }

    categoryFilterButton.textContent =
      `Выбрано: ${selectedCategories.length}`;
  };

  const applyFilter = () => {
    const query = input.value.trim().toLowerCase();
    const selectedCategories = getSelectedCategories();

    let visibleItems = 0;

    items.forEach(item => {
      const searchText = (
        item.getAttribute("data-search") || ""
      ).toLowerCase();

      const articleCategories = (
        item.getAttribute("data-categories") || ""
      )
        .split("|")
        .map(category => category.trim())
        .filter(Boolean);

      const matchesText =
        query.length === 0 || searchText.includes(query);

      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.some(category =>
          articleCategories.includes(category)
        );

      const isVisible = matchesText && matchesCategory;

      item.style.display = isVisible ? "" : "none";

      if (isVisible) {
        visibleItems += 1;
      }
    });

    if (emptyMessage) {
      emptyMessage.hidden = visibleItems !== 0;
    }
  };

  const updateUrl = () => {
    const params = new URLSearchParams();
    const query = input.value.trim();
    const selectedCategories = getSelectedCategories();

    if (query.length > 0) {
      params.set("q", query);
    }

    selectedCategories.forEach(category => {
      params.append("category", category);
    });

    const queryString = params.toString();

    const newUrl = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;

    window.history.replaceState(null, "", newUrl);
  };

  const restoreFiltersFromUrl = () => {
    const params = new URLSearchParams(window.location.search);

    input.value = params.get("q") || "";

    const categoriesFromUrl = params.getAll("category");

    categoryCheckboxes.forEach(checkbox => {
      checkbox.checked = categoriesFromUrl.includes(checkbox.value);
    });

    const hasSelectedCategories = categoryCheckboxes.some(
      checkbox => checkbox.checked
    );

    categoryAll.checked = !hasSelectedCategories;

    updateCategoryButton();
    applyFilter();
  };

  categoryFilterButton.addEventListener("click", () => {
    const isOpen = !categoryFilterDropdown.hidden;

    categoryFilterDropdown.hidden = isOpen;

    categoryFilterButton.setAttribute(
      "aria-expanded",
      String(!isOpen)
    );
  });

  categoryAll.addEventListener("change", () => {
    if (categoryAll.checked) {
      categoryCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
      });
    }

    updateCategoryButton();
    applyFilter();
    updateUrl();
  });

  categoryCheckboxes.forEach(checkbox => {
    checkbox.addEventListener("change", () => {
      const hasSelectedCategories = categoryCheckboxes.some(
        item => item.checked
      );

      categoryAll.checked = !hasSelectedCategories;

      updateCategoryButton();
      applyFilter();
      updateUrl();
    });
  });

  input.addEventListener("input", () => {
    applyFilter();
    updateUrl();
  });

  input.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      applyFilter();
      updateUrl();
    }
  });

  document.addEventListener("click", event => {
    if (!categoryFilter.contains(event.target)) {
      categoryFilterDropdown.hidden = true;

      categoryFilterButton.setAttribute(
        "aria-expanded",
        "false"
      );
    }
  });

  window.addEventListener("popstate", restoreFiltersFromUrl);

  restoreFiltersFromUrl();
});