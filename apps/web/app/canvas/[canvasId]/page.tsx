'use client';
import { useEffect, useRef, useState } from "react";

type ShapeType = 'rect' | 'circle';

type Shape = {
    type: 'rect';
    x: number;
    y: number;
    width: number;
    height: number;
} | {
    type: 'circle';
    centerX: number;
    centerY: number;
    radius: number;
}

const CanvasPage = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [shapes, setShapes] = useState<Shape[]>([]);
    const [selectedShape, setSelectedShape] = useState<ShapeType>('rect');
    const isDrawingRef = useRef(false);
    const startPosRef = useRef({ x: 0, y: 0 });

    const clearCanvas = (shapes: Shape[], canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'white';
        
        // Draw all saved shapes
        shapes.forEach((shape) => {
            if (shape.type === 'rect') {
                ctx.beginPath();
                ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
            } else if (shape.type === 'circle') {
                ctx.beginPath();
                ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, 2 * Math.PI);
                ctx.stroke();
            }
        });
    }

    const drawCurrentShape = (
        ctx: CanvasRenderingContext2D, 
        startPos: { x: number; y: number }, 
        currentPos: { x: number; y: number },
        shapeType: ShapeType
    ) => {
        if (shapeType === 'rect') {
            const width = currentPos.x - startPos.x;
            const height = currentPos.y - startPos.y;
            ctx.beginPath();
            ctx.strokeRect(startPos.x, startPos.y, width, height);
        } else {
            const radius = Math.sqrt(
                Math.pow(currentPos.x - startPos.x, 2) + 
                Math.pow(currentPos.y - startPos.y, 2)
            );
            ctx.beginPath();
            ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
            ctx.stroke();
        }
    }

    // Effect to handle canvas initialization and resize
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        clearCanvas(shapes, canvas, ctx);

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            clearCanvas(shapes, canvas, ctx);
        };
        
        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [shapes]);

    // Effect to set up mouse event listeners
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const handleMouseDown = (e: MouseEvent) => {
            isDrawingRef.current = true;
            const rect = canvas.getBoundingClientRect();
            startPosRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!isDrawingRef.current) return;

            const rect = canvas.getBoundingClientRect();
            const currentPos = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
            
            clearCanvas(shapes, canvas, ctx);
            drawCurrentShape(ctx, startPosRef.current, currentPos, selectedShape);
        };

        const handleMouseUp = (e: MouseEvent) => {
            if (!isDrawingRef.current) return;

            const rect = canvas.getBoundingClientRect();
            const currentPos = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };

            if (selectedShape === 'rect') {
                const x = Math.min(startPosRef.current.x, currentPos.x);
                const y = Math.min(startPosRef.current.y, currentPos.y);
                const width = Math.abs(currentPos.x - startPosRef.current.x);
                const height = Math.abs(currentPos.y - startPosRef.current.y);
                setShapes(prevShapes => [...prevShapes, {
                    type: 'rect',
                    x,
                    y,
                    width,
                    height,
                }]);
            } else {
                const radius = Math.sqrt(
                    Math.pow(currentPos.x - startPosRef.current.x, 2) + 
                    Math.pow(currentPos.y - startPosRef.current.y, 2)
                );
                setShapes(prevShapes => [...prevShapes, {
                    type: 'circle',
                    centerX: startPosRef.current.x,
                    centerY: startPosRef.current.y,
                    radius,
                }]);
            }
            
            isDrawingRef.current = false;
        };

        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);

        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseup', handleMouseUp);
        };
    }, [shapes, selectedShape]);

    return (
        <div style={{ 
            width: '100vw', 
            height: '100vh', 
            margin: 0, 
            padding: 0, 
            overflow: 'hidden',
            position: 'relative'
        }}>
            <canvas 
                ref={canvasRef}
                style={{ 
                    backgroundColor: 'black',
                    display: 'block'
                }}
            />
            <div style={{
                position: 'absolute',
                bottom: '20px',
                right: '20px',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                padding: '10px',
                borderRadius: '8px',
                display: 'flex',
                gap: '10px'
            }}>
                <button
                    onClick={() => setSelectedShape('rect')}
                    style={{
                        backgroundColor: selectedShape === 'rect' ? '#4a90e2' : '#2c2c2c',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s'
                    }}
                >
                    Rectangle
                </button>
                <button
                    onClick={() => setSelectedShape('circle')}
                    style={{
                        backgroundColor: selectedShape === 'circle' ? '#4a90e2' : '#2c2c2c',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s'
                    }}
                >
                    Circle
                </button>
            </div>
        </div>
    );
};

export default CanvasPage;