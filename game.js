document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const toPdfInput = document.getElementById('toPdfInput');
    const fromPdfInput = document.getElementById('fromPdfInput');
    const toPdfArea = document.getElementById('toPdfArea');
    const fromPdfArea = document.getElementById('fromPdfArea');
    const convertToPdfBtn = document.getElementById('convertToPdfBtn');
    const convertFromPdfBtn = document.getElementById('convertFromPdfBtn');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const fileList = document.getElementById('fileList');
    const downloadContainer = document.getElementById('downloadContainer');
    const downloadLinks = document.getElementById('downloadLinks');
    const downloadAllBtn = document.getElementById('downloadAllBtn');

    // File drag and drop functionality
    function setupFileDropArea(dropArea, inputElement) {
        dropArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropArea.classList.add('highlight');
        });

        dropArea.addEventListener('dragleave', () => {
            dropArea.classList.remove('highlight');
        });

        dropArea.addEventListener('drop', (e) => {
            e.preventDefault();
            dropArea.classList.remove('highlight');
            
            if (e.dataTransfer.files.length) {
                inputElement.files = e.dataTransfer.files;
                updateFileMessage(dropArea, inputElement.files);
            }
        });

        inputElement.addEventListener('change', () => {
            if (inputElement.files.length) {
                updateFileMessage(dropArea, inputElement.files);
            }
        });
    }

    function updateFileMessage(dropArea, files) {
        const fileMsg = dropArea.querySelector('.file-msg');
        if (files.length === 1) {
            fileMsg.textContent = files[0].name;
        } else {
            fileMsg.textContent = `${files.length} files selected`;
        }
    }

    // Initialize file drop areas
    setupFileDropArea(toPdfArea, toPdfInput);
    setupFileDropArea(fromPdfArea, fromPdfInput);

    // Conversion functions (simulated - in a real app, this would call an API)
    function convertToPdf(files, merge) {
        showProgress();
        
        // Simulate conversion process
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress >= 100) {
                progress = 100;
                clearInterval(progressInterval);
                
                // Simulate completion
                setTimeout(() => {
                    showDownloadLinks(files, merge ? 'pdf' : 'pdfs');
                }, 500);
            }
            updateProgress(progress, `Converting ${files.length} files to PDF...`);
        }, 300);
    }

    function convertFromPdf(files, format) {
        showProgress();
        
        // Simulate conversion process
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress >= 100) {
                progress = 100;
                clearInterval(progressInterval);
                
                // Simulate completion
                setTimeout(() => {
                    showDownloadLinks(files, format);
                }, 500);
            }
            updateProgress(progress, `Converting PDF to ${format.toUpperCase()}...`);
        }, 300);
    }

    // UI update functions
    function showProgress() {
        progressContainer.classList.remove('hidden');
        downloadContainer.classList.add('hidden');
        progressBar.style.width = '0%';
        
        // Clear previous file list
        fileList.innerHTML = '';
    }

    function updateProgress(percent, text) {
        progressBar.style.width = `${percent}%`;
        progressText.textContent = text;
    }

    function showDownloadLinks(files, format) {
        progressContainer.classList.add('hidden');
        downloadContainer.classList.remove('hidden');
        downloadLinks.innerHTML = '';
        
        // Create download links (simulated)
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileName = file.name.split('.')[0];
            const link = document.createElement('a');
            link.href = '#'; // In a real app, this would be the download URL
            link.className = 'download-link';
            link.textContent = `Download ${fileName}.${format}`;
            link.download = `${fileName}.${format}`;
            downloadLinks.appendChild(link);
            
            // Add file to list
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <span>${file.name}</span>
                <span>→ ${fileName}.${format}</span>
            `;
            fileList.appendChild(fileItem);
        }
    }

    // Event listeners for conversion buttons
    convertToPdfBtn.addEventListener('click', () => {
        if (!toPdfInput.files || toPdfInput.files.length === 0) {
            alert('Please select files to convert');
            return;
        }
        
        const merge = document.querySelector('input[name="toPdfFormat"]:checked').value === 'merge';
        convertToPdf(Array.from(toPdfInput.files), merge);
    });

    convertFromPdfBtn.addEventListener('click', () => {
        if (!fromPdfInput.files || fromPdfInput.files.length === 0) {
            alert('Please select PDF files to convert');
            return;
        }
        
        const format = document.getElementById('outputFormat').value;
        convertFromPdf(Array.from(fromPdfInput.files), format);
    });

    // Download all button (simulated)
    downloadAllBtn.addEventListener('click', () => {
        alert('In a real application, this would download all converted files as a ZIP archive');
    });
});
