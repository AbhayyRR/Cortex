// Debug script to check component connectivity
console.log('=== Debugging Component Connectivity ===');

// Test if all components are properly imported
try {
  console.log('Testing imports...');
  
  // Check if Dashboard can be imported
  import('./pages/Dashboard.jsx').then(() => {
    console.log('✅ Dashboard import successful');
  }).catch(err => {
    console.error('❌ Dashboard import failed:', err);
  });
  
  // Check if components can be imported
  import('./components/Chat.jsx').then(() => {
    console.log('✅ Chat import successful');
  }).catch(err => {
    console.error('❌ Chat import failed:', err);
  });
  
  import('./components/Sidebar.jsx').then(() => {
    console.log('✅ Sidebar import successful');
  }).catch(err => {
    console.error('❌ Sidebar import failed:', err);
  });
  
  import('./components/UploadBox.jsx').then(() => {
    console.log('✅ UploadBox import successful');
  }).catch(err => {
    console.error('❌ UploadBox import failed:', err);
  });
  
  import('./services/api.js').then(() => {
    console.log('✅ API service import successful');
  }).catch(err => {
    console.error('❌ API service import failed:', err);
  });
  
} catch (error) {
  console.error('Import testing failed:', error);
}

// Test API connectivity
fetch('http://localhost:8000/docs')
  .then(response => {
    if (response.ok) {
      console.log('✅ Backend API is accessible');
    } else {
      console.log('❌ Backend API returned error:', response.status);
    }
  })
  .catch(err => {
    console.log('❌ Backend API not accessible:', err.message);
  });

console.log('=== Debug Complete ===');
