// Silent utility script for clearing cache when needed
// This script no longer shows a button, but can be triggered from console with:
// clearAppCache()

function clearAppCache() {
  // Clear localStorage
  localStorage.clear();
  console.log('Cache cleared successfully!');
  
  // Force reload from server
  window.location.reload(true);
}

// You can uncomment this to automatically clear cache on each page load during development
/*
document.addEventListener('DOMContentLoaded', function() {
  // Uncomment to auto-clear cache during development
  // clearAppCache();
});
*/
