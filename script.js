document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchResultsDiv = document.getElementById('searchResults');
    const loadingMessage = document.getElementById('loadingMessage');
    const noResultsMessage = document.getElementById('noResultsMessage');

    let searchIndex = {}; // Índice JSON cargado

    // Cargar índice JSON
    async function loadSearchIndex() {
        loadingMessage.style.display = 'block';
        noResultsMessage.style.display = 'none';
        searchResultsDiv.innerHTML = '';

        try {
            const response = await fetch('search_index.json'); // Cambia si tu JSON está en otra ruta
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

    // Extraer fragmento de texto para mostrar en resultados (con la palabra buscada)
    function getTextSnippet(text, query, snippetLength = 100) {
        const lowerText = text.toLowerCase();
        const lowerQuery = query.toLowerCase();
        const index = lowerText.indexOf(lowerQuery);
        if (index === -1) return '';

        const start = Math.max(0, index - snippetLength / 2);
        const end = Math.min(text.length, index + lowerQuery.length + snippetLength / 2);

        let snippet = text.substring(start, end).trim();

        // Agregar "..." si el snippet está cortado
        if (start > 0) snippet = '...' + snippet;
        if (end < text.length) snippet = snippet + '...';

        return snippet;
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
                const pageText = pdfData.pages[pageKey];
                const pageTextLower = pageText.toLowerCase();
                const pageNumber = pageKey.replace('page_', '');

                if (pageTextLower.includes(query)) {
                    foundResults = true;

                    const snippet = getTextSnippet(pageText, query);

                    results.push({
                        filename: pdfFilename,
                        url: pdfUrl,
                        pageNumber: pageNumber,
                        snippet: snippet,
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
                // URL codificada para evitar problemas
                const encodedPdfUrl = encodeURIComponent(result.url);
                pageLink.href = `pdfjs/web/viewer.html?file=${encodedPdfUrl}#page=${result.pageNumber}`;
                pageLink.target = "_blank";
                pageLink.rel = "noopener noreferrer";
                pageLink.textContent = `Ver página ${result.pageNumber}`;

                const snippetDiv = document.createElement('p');
                snippetDiv.textContent = result.snippet;

                resultItem.appendChild(newsTitle);
                resultItem.appendChild(pageLink);
                resultItem.appendChild(snippetDiv);
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
