document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchResultsDiv = document.getElementById('searchResults');
    const loadingMessage = document.getElementById('loadingMessage');
    const noResultsMessage = document.getElementById('noResultsMessage');

    let searchIndex = {}; // Índice JSON cargado

    // URL base del visor en Netlify
    const visorBaseUrl = 'https://velvety-praline-a6d785.netlify.app/pdfjs/web/viewer.html';

    // Cargar índice JSON
    async function loadSearchIndex() {
        loadingMessage.style.display = 'block';
        noResultsMessage.style.display = 'none';
        searchResultsDiv.innerHTML = '';

        try {
            const response = await fetch('search_index.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            searchIndex = await response.json();
            loadingMessage.style.display = 'none';
            searchInput.focus();
            console.log("Índice cargado correctamente");
        } catch (error) {
            loadingMessage.textContent = 'Error al cargar índice. Recarga la página.';
            loadingMessage.style.color = 'red';
            console.error('Error al cargar índice:', error);
        }
    }

    // Buscar y mostrar resultados
    function performSearch() {
        const query = searchInput.value.toLowerCase().trim();
        searchResultsDiv.innerHTML = '';
        noResultsMessage.style.display = 'none';

        if (query.length === 0) {
            return;
        }

        let foundResults = false;
        const results = [];

        for (const pdfFilename in searchIndex) {
            const pdfData = searchIndex[pdfFilename];
            const pdfUrl = pdfData.url;

            for (const pageKey in pdfData.pages) {
                const pageText = pdfData.pages[pageKey].toLowerCase();
                const pageNumber = pageKey.replace('page_', '');

                if (pageText.includes(query)) {
                    foundResults = true;
                    results.push({
                        filename: pdfFilename,
                        url: pdfUrl,
                        pageNumber: pageNumber,
                    });
                }
            }
        }

        // Ordenar resultados
        results.sort((a, b) => {
            if (a.filename !== b.filename) {
                return a.filename.localeCompare(b.filename);
            }
            return parseInt(a.pageNumber) - parseInt(b.pageNumber);
        });

        if (results.length > 0) {
            results.forEach(result => {
                const resultItem = document.createElement('div');
                resultItem.classList.add('result-item');

                const newsTitle = document.createElement('h3');
                newsTitle.textContent = `Noticia: ${result.filename.replace('.pdf', '').replace(/_/g, ' ')}`;

                const pageLink = document.createElement('a');
                const encodedPdfUrl = encodeURIComponent(result.url);
                pageLink.href = `${visorBaseUrl}?file=${encodedPdfUrl}#page=${result.pageNumber}`;
                pageLink.target = "_blank";
                pageLink.rel = "noopener noreferrer";
                pageLink.textContent = `Ver página ${result.pageNumber}`;

                resultItem.appendChild(newsTitle);
                resultItem.appendChild(pageLink);
                searchResultsDiv.appendChild(resultItem);
            });
        } else {
            noResultsMessage.style.display = 'block';
        }
    }

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            performSearch();
        }
    });

    loadSearchIndex();
});
