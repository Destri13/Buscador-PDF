document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchResultsDiv = document.getElementById('searchResults');
    const loadingMessage = document.getElementById('loadingMessage');
    const noResultsMessage = document.getElementById('noResultsMessage');

    let searchIndex = {}; // Aquí se cargará nuestro índice JSON

    // Cargar el índice JSON
    async function loadSearchIndex() {
        loadingMessage.style.display = 'block';
        noResultsMessage.style.display = 'none';
        searchResultsDiv.innerHTML = '';

        try {
            const response = await fetch('search_index.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            searchIndex = await response.json();
            loadingMessage.style.display = 'none';
            console.log("Índice de búsqueda cargado con éxito.");
            searchInput.focus();
        } catch (error) {
            loadingMessage.textContent = 'Error al cargar el índice de búsqueda.';
            loadingMessage.style.color = 'red';
            console.error('Error:', error);
        }
    }

    // Función para buscar
    function performSearch() {
        const query = searchInput.value.toLowerCase().trim();
        searchResultsDiv.innerHTML = '';
        noResultsMessage.style.display = 'none';

        if (query.length === 0) return;

        let foundResults = false;
        const results = [];

        for (const pdfFilename in searchIndex) {
            const pdfData = searchIndex[pdfFilename];

            for (const pageKey in pdfData.pages) {
                const pageText = pdfData.pages[pageKey].toLowerCase();
                const pageNumber = pageKey.replace('page_', '');

                if (pageText.includes(query)) {
                    foundResults = true;
                    results.push({
                        filename: pdfFilename,
                        pageNumber: pageNumber
                    });
                }
            }
        }

        results.sort((a, b) => {
            if (a.filename !== b.filename) return a.filename.localeCompare(b.filename);
            return parseInt(a.pageNumber) - parseInt(b.pageNumber);
        });

        if (results.length > 0) {
            results.forEach(result => {
                const resultItem = document.createElement('div');
                resultItem.classList.add('result-item');

                const newsTitle = document.createElement('h3');
                newsTitle.textContent = `Noticia: ${result.filename.replace('.pdf', '').replace(/_/g, ' ')}`;

                const pageLink = document.createElement('a');
                pageLink.href = `pdfjs/web/viewer.html?file=../../noticias_pdf/${result.filename}#page=${result.pageNumber}`;
                pageLink.target = "_blank";
                pageLink.textContent = `Ver en página ${result.pageNumber}`;

                resultItem.appendChild(newsTitle);
                resultItem.appendChild(pageLink);
                searchResultsDiv.appendChild(resultItem);
            });
        } else {
            noResultsMessage.style.display = 'block';
        }
    }

    // Event listeners
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') performSearch();
    });

    loadSearchIndex();
});
