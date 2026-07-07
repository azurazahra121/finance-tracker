// 1. Define your React component using JSX
function Counter() {
    const [count, setCount] = React.useState(0);

    return (
        <div style={{ fontFamily: 'sans-serif', padding: '20px', textAlign: 'center' }}>
            <h1>Hello from Option 1!</h1>
            <p>This .jsx file is running directly on GitHub Pages.</p>
            <button 
                onClick={() => setCount(count + 1)}
                style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
            >
                Count is: {count}
            </button>
        </div>
    );
}

// 2. Target the HTML root container and render the component
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Counter />);
