export default function TestButton() {
  const handleClick = () => {
    console.log('Test button clicked!');
    alert('Button works!');
  };

  return (
    <button 
      onClick={handleClick}
      style={{ 
        padding: '10px', 
        backgroundColor: '#007bff', 
        color: 'white', 
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      Test Button - Click Me!
    </button>
  );
}
