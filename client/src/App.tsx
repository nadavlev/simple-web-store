import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';
import './App.css';
import ProductCard from './ProductCard';
import { SelectChangeEvent } from '@mui/material/Select';
import SocketContext from './SocketContext';

function App() {
  const [products, setProducts] = useState<any[]>([]);
  const [socket, setWs] = useState<WebSocket | null>(null);
  const [selectedName, setSelectedName] = useState<string>('John');
  const productsRef = useRef<any[]>([]);

  useEffect(() => {
    axios.get('/api/products')
      .then((response) => setProducts(response.data))
      .catch((error) => console.error('Error fetching products:', error));
  }, []);

  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:5000');
    setWs(socket);

    socket.onopen = () => {
      console.log('WebSocket connection established');
      socket.send(JSON.stringify({ customerName: selectedName, action: 'onopen' }));
    };

    socket.onmessage = (event) => {
      console.log(`WebSocket message received: ${event.data}`);
      const { productId, orderQuantity, action } = JSON.parse(event.data);
      switch (action) {
        case 'quantityChange':
          const updatedProducts = productsRef.current.map((product) =>
            product.id === productId ? { ...product, orderQuantity } : product
          );
          setProducts([...updatedProducts]);
          break;
        default:
          console.error('Unknown action');
          break;
      }
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      socket.close();
    };
  }, [selectedName]);

  const handleNameChange = (event: SelectChangeEvent<string>) => {
    setSelectedName(event.target.value as string);
  };

  return (
    <SocketContext.Provider value={socket}>
      <div className="App">
        <header className="app-header">
          <h1>Welcome to Simple Web Store</h1>
        </header>
        <FormControl variant="outlined" className="name-selector">
          <InputLabel id="name-select-label">Select a name</InputLabel>
          <Select
            labelId="name-select-label"
            id="name-select"
            value={selectedName}
            onChange={handleNameChange}
            label="Select a name"
          >
            <MenuItem value="John" selected>John</MenuItem>
            <MenuItem value="Jane">Jane</MenuItem>
            <MenuItem value="Doe">Doe</MenuItem>
          </Select>
        </FormControl>
        <div className="products-container">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} customerName={selectedName} />
          ))}
        </div>
        <Button variant="contained" color="primary">
          Checkout
        </Button>
      </div>
    </SocketContext.Provider>
  );
}

export default App;