// Test upload functionality end-to-end
import { api } from '../services/api';

export async function testUploadFlow() {
  console.log('🧪 Testing Upload Flow...');
  
  try {
    // Test 1: Create a test PDF file
    console.log('📄 Step 1: Creating test PDF...');
    const testFile = new Blob(['%PDF-1.4\n%âãÏÓ\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(Test PDF Content) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\n0000000115 00000 n\n0000000174 00000 n\ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n249\n%%EOF'], { type: 'application/pdf' });
    
    // Test 2: Upload the file
    console.log('📤 Step 2: Uploading test PDF...');
    const formData = new FormData();
    formData.append('file', testFile, 'test-document.pdf');
    
    const uploadResponse = await fetch('http://localhost:8000/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (uploadResponse.ok) {
      const uploadResult = await uploadResponse.json();
      console.log('✅ File upload successful:', uploadResult);
      
      // Test 3: Create a task that uses the uploaded document
      console.log('🤖 Step 3: Creating task with uploaded document...');
      const taskResponse = await api.createTask('What information is in the uploaded document?');
      console.log('✅ Task created:', taskResponse);
      
      // Test 4: Get task result
      console.log('📊 Step 4: Getting task result...');
      const result = await api.getResult(taskResponse.task_id);
      console.log('✅ Task result:', result);
      
      console.log('🎉 Upload flow test completed successfully!');
      return true;
    } else {
      console.log('❌ File upload failed:', await uploadResponse.text());
      return false;
    }
    
  } catch (error) {
    console.error('❌ Upload flow test failed:', error);
    return false;
  }
}

// Auto-run test when component mounts
export default function UploadFlowTester() {
  const [testResult, setTestResult] = useState(null);
  
  useEffect(() => {
    testUploadFlow().then(result => {
      setTestResult(result);
    });
  }, []);
  
  return (
    <div className="p-4 bg-dark-surface rounded-lg">
      <h3>Upload Flow Test</h3>
      <p>Result: {testResult ? '✅ Passed' : '❌ Failed'}</p>
    </div>
  );
}
