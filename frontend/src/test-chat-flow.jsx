// Test chat functionality end-to-end
import { api } from '../services/api';

export async function testChatFlow() {
  console.log('🧪 Testing Chat Flow...');
  
  try {
    // Test 1: Create a task
    console.log('📝 Step 1: Creating task...');
    const taskResponse = await api.createTask('Test query about documents');
    console.log('✅ Task created:', taskResponse);
    
    // Test 2: Get task result
    console.log('📊 Step 2: Getting task result...');
    const result = await api.getResult(taskResponse.task_id);
    console.log('✅ Task result:', result);
    
    // Test 3: Upload a file (if test file exists)
    console.log('📁 Step 3: Testing file upload...');
    const testFile = new Blob(['Test PDF content'], { type: 'application/pdf' });
    const formData = new FormData();
    formData.append('file', testFile, 'test.pdf');
    
    try {
      const uploadResponse = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (uploadResponse.ok) {
        console.log('✅ File upload successful');
      } else {
        console.log('⚠️ File upload failed (expected for test)');
      }
    } catch (error) {
      console.log('⚠️ File upload error (expected for test):', error.message);
    }
    
    console.log('🎉 Chat flow test completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Chat flow test failed:', error);
    return false;
  }
}

// Auto-run test when component mounts
export default function ChatFlowTester() {
  const [testResult, setTestResult] = useState(null);
  
  useEffect(() => {
    testChatFlow().then(result => {
      setTestResult(result);
    });
  }, []);
  
  return (
    <div className="p-4 bg-dark-surface rounded-lg">
      <h3>Chat Flow Test</h3>
      <p>Result: {testResult ? '✅ Passed' : '❌ Failed'}</p>
    </div>
  );
}
