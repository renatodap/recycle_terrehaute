export default function Home() {
  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
      <h1>Recycling API</h1>
      <p>This is an API-only service. No UI available.</p>
      <h2>Available Endpoints:</h2>
      <ul>
        <li>POST /api/identify - Image recognition for recycling</li>
        <li>GET /api/search - Search recycling database</li>
      </ul>
      <p>See README.md for API documentation.</p>
    </div>
  );
}