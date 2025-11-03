document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('image');
  const fileError = document.getElementById('fileError');

  if (!fileInput) return; // safety check if element not found

  fileInput.addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
      const maxSize = 4 * 1024 * 1024; // 3 MB
      if (file.size > maxSize) {
        fileError.textContent = "File size must be less than 3 MB.";
        this.value = ""; // reset file input
      } else {
        fileError.textContent = "";
      }
    }
  });
});