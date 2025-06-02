document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchResultsDiv = document.getElementById('searchResults');
    const loadingMessage = document.getElementById('loadingMessage');
    const noResultsMessage = document.getElementById('noResultsMessage');

    let searchIndex = {}; // Aquí se cargará nuestro índice JSON

    // Función asíncrona para cargar el índice JSON
    async function loadSearchIndex() {
        loadingMessage.style.display = 'block'; // Mostrar mensaje de carga
        noResultsMessage.style.display = 'none'; // Asegurarse de que noResults esté oculto
        searchResultsDiv.innerHTML = ''; // Limpiar resultados anteriores

        try {
            // La ruta del archivo JSON, asumiendo que está en la misma carpeta que script.js
            const response = await fetch('search_index.json'); 
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            searchIndex = await response.json();
            loadingMessage.style.display = 'none'; // Ocultar mensaje de carga
            console.log("Índice de búsqueda cargado con éxito.");
            searchInput.focus(); // Opcional: enfocar el input de búsqueda una vez cargado
        } catch (error) {
            loadingMessage.textContent = 'Error al cargar el índice de búsqueda. Por favor, recarga la página o inténtalo más tarde.';
            loadingMessage.style.color = 'red';
            console.error('Error al cargar el índice de búsqueda:', error);
        }
    }

    // Función para realizar la búsqueda
    function performSearch() {
        const query = searchInput.value.toLowerCase().trim();
        searchResultsDiv.innerHTML = ''; // Limpiar resultados anteriores
        noResultsMessage.style.display = 'none'; // Ocultar mensaje de no resultados

        if (query.length === 0) {
            return;
        }

        let foundResults = false;
        const results = []; // Para almacenar resultados y luego ordenarlos/mostrarlos

        // Recorre cada PDF en nuestro índice
        for (const pdfFilename in searchIndex) {
            const pdfData = searchIndex[pdfFilename];
            const pdfUrl = pdfData.url;

            // Recorre cada página dentro del PDF
            for (const pageKey in pdfData.pages) {
                const pageText = pdfData.pages[pageKey].toLowerCase();
                const pageNumber = pageKey.replace('page_', ''); // Extraer el número de página (ej. de "page_5" a "5")

                // Si la palabra clave se encuentra en el texto de la página
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

        // Ordenar los resultados alfabéticamente por nombre de archivo, luego por número de página
        results.sort((a, b) => {
            if (a.filename !== b.filename) {
                return a.filename.localeCompare(b.filename);
            }
            return parseInt(a.pageNumber) - parseInt(b.pageNumber);
        });

// Mostrar los resultados en la interfaz
if (results.length > 0) {
    results.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.classList.add('result-item');

        const newsTitle = document.createElement('h3');
        newsTitle.textContent = `Noticia: ${result.filename.replace('.pdf', '').replace(/_/g, ' ')}`;

        const pageLink = document.createElement('a');
        pageLink.href = `${result.url}#page=${result.pageNumber}`;  // Enlace directo al PDF con página
        pageLink.target = "_blank";  // Abrir en nueva pestaña
        pageLink.textContent = `Ver en página ${result.pageNumber}`;

        resultItem.appendChild(newsTitle);
        resultItem.appendChild(pageLink);
        searchResultsDiv.appendChild(resultItem);
    });
} else {
    noResultsMessage.style.display = 'block';  // Mostrar mensaje de no resultados
        }
    }

    // Event listeners para el botón y la tecla Enter
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            performSearch();
        }
    });

    // Cargar el índice de búsqueda cuando la página se haya cargado
    loadSearchIndex();
});
