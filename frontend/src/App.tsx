import { useEffect, useState } from 'react';

function App() {
  const [backendStatus, setBackendStatus] = useState<string>('checking...');

  useEffect(() => {
    fetch('http://localhost:3000/health')
      .then(res => res.json())
      .then(data => setBackendStatus(data.message))
      .catch(() => setBackendStatus('Backend is not running'));
  }, []);

  return (
    <div className="App">
      <h1>Bookshelf - 読書管理アプリ</h1>
      <p>Backend Status: {backendStatus}</p>
    </div>
  );
}

export default App;
