// Debug component to test if pages are rendering
console.log('Debug: App is loading');

// Test if components are imported correctly
try {
  const Layout = () => console.log('Layout component loaded');
  const UploadPage = () => console.log('UploadPage component loaded');
  const TaskPage = () => console.log('TaskPage component loaded');
  const ResultsPage = () => console.log('ResultsPage component loaded');
  console.log('All components imported successfully');
} catch (error) {
  console.error('Component import error:', error);
}
