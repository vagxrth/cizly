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
            ctx.strokeRect(0, 0, 500, 500);
        }
    }, [canvasRef]);

  return <div>
    <h1>Canvas</h1>
    <canvas ref={canvasRef} id="canvas" width="1000" height="1000"></canvas>
  </div>;
};

export default CanvasPage;