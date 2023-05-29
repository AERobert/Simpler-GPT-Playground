// Open IndexedDB database
const dbPromise = window.indexedDB.open('request-store', 1);

dbPromise.onupgradeneeded = event => {
        // Create file store object
        const db = event.target.result;
        const requestStore = db.createObjectStore('requests', { keyPath: 'id', autoIncrement: true });
};

dbPromise.onsuccess = event => {
        // Handle file uploads
        const db = event.target.result;
        const fileName = document.getElementById('filename');
const saveButton = document.getElementById('indexedDB_save');

saveButton.addEventListener('click', event => {
                event.preventDefault();

                const requestData = getRequestData();
			const jsonData = JSON.stringify(requestData);
                const transaction = db.transaction(['requests'], 'readwrite');
                const requestStore = transaction.objectStore('requests');
		const fileData = {
			'name': fileName.value,
			'data': jsonData
		}
                const request = requestStore.add(fileData);
                request.onsuccess = () => {
                        // Add file to list
                        const requestList = document.getElementById('request-select');
                        const option = document.createElement('option');
                        option.value = request.result;
                        option.text = fileName.value;
                        requestList.add(option);
                };
        });

        // Handle file downloads           
        const indexedDB_import = document.getElementById('indexedDB_import');
        indexedDB_import.addEventListener('click', () => {
                const requestId = document.getElementById('request-select').value;
                const transaction = db.transaction(['requests'], 'readonly');
                const requestStore = transaction.objectStore('requests');
                const request = requestStore.get(Number(requestId));
                request.onsuccess = () => {
                        const fileData = request.result.data;
			const requestFile = new File([fileData], fileName.value, { type: 'application/json' });
                        importFromFile(requestFile)
                .then(data => {
			revertRequest(data);
                })
                .catch(error => {
                    console.error("Error:", error);
                });
                                        };
        });

// Handle file deletion
const deleteButton = document.getElementById('indexedDB_delete');
deleteButton.addEventListener('click', () => {
    const requestList = document.getElementById('request-select');
    const requestId = requestList.value;
    const transaction = db.transaction(['requests'], 'readwrite');
    const requestStore = transaction.objectStore('requests');
    const request = requestStore.delete(Number(requestId));
    request.onsuccess = () => {
        // Get the index of the option to remove
        const indexToRemove = requestList.selectedIndex;

        // Remove the option
        const option = requestList.querySelector(`option[value="${requestId}"]`);
        requestList.removeChild(option);

        // Set the selected index to the option after the removed one
        if (requestList.options.length > 0) {
            requestList.selectedIndex = Math.min(indexToRemove, requestList.options.length - 1);
        }
    };
});

        // Load uploaded files from IndexedDB
        const requestList = document.getElementById('request-select');
        const requestStore = db.transaction(['requests'], 'readonly').objectStore('requests');
        requestStore.openCursor().onsuccess = event => {
                    const cursor = event.target.result;
                    if (cursor) {
                            const option = document.createElement('option');
                            option.value = cursor.value.id;
                            option.text = cursor.value.name;
                            requestList.add(option);
                            cursor.continue();
                    }
            };
    };
