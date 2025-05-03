'use client';
import { useEffect, useRef } from "react";

const CanvasPage = () => {

    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return;
            }

            let isDrawing = false;
            let startX = 0;
            let startY = 0;
            
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
                
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.strokeRect(startX, startY, width, height);
                }
            });

            canvas.addEventListener('mouseup', () => {
                isDrawing = false;
            });
        }
    }, [canvasRef]);

  return <div>
    <h1>Canvas</h1>
    <canvas ref={canvasRef} id="canvas" width="1000" height="1000"></canvas>
  </div>;
};

export default CanvasPage;