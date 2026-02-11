let updates = [];
let filtered = [];
let currentPage = 1;
const itemsPerPage = 5;   

async function loadUpdates() {
    const list = document.getElementById("updatesList");
    const pagination = document.getElementById("pagination");
    const searchBox = document.getElementById("searchBox");
    const categoryFilter = document.getElementById("categoryFilter");

    const res = await fetch("updates.json");
    updates = await res.json();
    filtered = updates;

    function render() {
        list.innerHTML = "";

        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageItems = filtered.slice(start, end);

        pageItems.forEach(update => {
            const card = `
                <div class="update-card">
                    <h3>${update.title}</h3>
                    <p class="update-date">${update.date}</p>
                    <p>${update.category}</p>
                    <a href="update_details.html?id=${update.id}" class="btn">View Details</a>
                </div>
            `;
            list.innerHTML += card;
        });

        renderPagination();
    }

    function renderPagination() {
        pagination.innerHTML = "";
        const totalPages = Math.ceil(filtered.length / itemsPerPage);

        if (totalPages <= 1) return;

        if (currentPage > 1) {
            pagination.innerHTML += `<button class="page-btn" data-page="${currentPage - 1}">Prev</button>`;
        }

        for (let i = 1; i <= totalPages; i++) {
            pagination.innerHTML += `
                <button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">
                    ${i}
                </button>`;
        }


        if (currentPage < totalPages) {
            pagination.innerHTML += `<button class="page-btn" data-page="${currentPage + 1}">Next</button>`;
        }

        document.querySelectorAll(".page-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                currentPage = Number(e.target.dataset.page);
                render();
            });
        });
    }

    function applyFilters() {
        currentPage = 1;
        const keyword = searchBox.value.toLowerCase();
        const category = categoryFilter.value;

        filtered = updates.filter(u =>
            (category === "All" || u.category === category) &&
            u.title.toLowerCase().includes(keyword)
        );

        render();
    }

    searchBox.addEventListener("input", applyFilters);
    categoryFilter.addEventListener("change", applyFilters);

    render();
}

loadUpdates();