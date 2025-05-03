'use client';
import { useEffect, useRef } from "react";

const CanvasPage = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            // Set canvas dimensions to match window size
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return;
            }

            // Set initial black background
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Set stroke style to white
            ctx.strokeStyle = 'white';

            let isDrawing = false;
            let startX = 0;
            let startY = 0;
            
            // Handle window resize
            const handleResize = () => {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                // Redraw background after resize
                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.strokeStyle = 'white';
            };
            
            window.addEventListener('resize', handleResize);
            
            canvas.addEventListener('mousedown', (e) => {
                isDrawing = true;
                const rect = canvas.getBoundingClientRect();
                startX = e.clientX - rect.left;
                startY = e.clientY - rect.top;
            });

            canvas.addEventListener('mousemove', (e) => {
                if (isDrawing) {
                    const rect = canvas.getBoundingClientRect();
                    const currentX = e.clientX - rect.left;
                    const currentY = e.clientY - rect.top;
                    
                    const width = currentX - startX;
                    const height = currentY - startY;
                    
                    ctx.fillStyle = 'black';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.strokeRect(startX, startY, width, height);
                }
            });

            canvas.addEventListener('mouseup', () => {
                isDrawing = false;
            });

            // Cleanup
            return () => {
                window.removeEventListener('resize', handleResize);
            };
        }
    }, [canvasRef]);

    return (
        <div style={{ 
            width: '100vw', 
            height: '100vh', 
            margin: 0, 
            padding: 0, 
            overflow: 'hidden' 
        }}>
            <canvas 
                ref={canvasRef}
                style={{ 
                    backgroundColor: 'black',
                    display: 'block' // Removes any default spacing
                }}
            />
        </div>
    );
};

export default CanvasPage;