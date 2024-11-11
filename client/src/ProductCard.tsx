import React, {useContext} from 'react';
import { Card, CardContent, Typography, Button } from '@mui/material';
import SocketContext from './SocketContext';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    inventoryCount: number;
    maxAllowedPerCustomer: number;
    orderQuantity?: number; // Optional attribute
}

interface ProductCardProps {
    product: Product;
    customerName: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, customerName }) => {

    const socket = useContext(SocketContext);

    const handleBuyEvent = (newValue: number) => {
        product.orderQuantity = newValue;
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ action: "buy", productId: product.id, orderQuantity: newValue, customerName }));
          }
    };

    return (
        <Card key={product.id} className="product-item">
            <CardContent className="product-item-content">
                <Typography variant="h5" component="div">
                    {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {product.description}
                </Typography>
                <Typography variant="body1">
                    Price: ${product.price}
                </Typography>
                <Typography variant="body1">
                    Orders: {product.orderQuantity || 0} / {product.maxAllowedPerCustomer}
                </Typography>
                <Button variant="contained"
                    onClick={() => handleBuyEvent(product.orderQuantity ? product.orderQuantity + 1 : 1)}
                >
                    Get it now!
                </Button>
            </CardContent>
        </Card>
    );
};

export default ProductCard;