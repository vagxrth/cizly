'use client';
import axios from "axios";
import { useEffect, useRef, useState, use } from "react";

type ShapeType = 'rect' | 'circle' | 'line';

type Point = {
    x: number;
    y: number;
};

type ResizeHandle = {
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top' | 'right' | 'bottom' | 'left';
    x: number;
    y: number;
};

type Shape = {
    id: string;
    type: 'rect';
    x: number;
    y: number;
    width: number;
    height: number;
    deleted?: boolean;
} | {
    id: string;
    type: 'circle';
    centerX: number;
    centerY: number;
    radius: number;
    deleted?: boolean;
} | {
    id: string;
    type: 'line';
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    deleted?: boolean;
}

type DeleteMessage = {
    type: 'delete';
    id: string;
};

const getExistingShapes = async (canvasId: string): Promise<Shape[]> => {
    try {
        const response = await axios.get(`/api/canvas/${canvasId}`);
        const messages = response.data.messages;
        const shapes = messages.map((x: {content: string}) => JSON.parse(x.content));
        
        // Create a map to track the latest version of each shape
        const latestShapes = new Map<string, Shape>();
        shapes.forEach((shape: Shape | DeleteMessage) => {
            if (shape.type === 'delete') {
                latestShapes.delete(shape.id);
            } else {
                latestShapes.set(shape.id, shape as Shape);
            }
        });
        
        // Convert map back to array and filter out deleted shapes
        return Array.from(latestShapes.values()).filter(shape => !shape.deleted);
    } catch (error) {
        console.error('Failed to fetch existing shapes:', error);
        return [];
    }
}

const CanvasPage = ({params}: {params: Promise<{canvasId: string}>}) => {
    const resolvedParams = use(params);
    const canvasId = resolvedParams.canvasId;
    
    // Group all hooks at the top level
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [shapes, setShapes] = useState<Shape[]>([]);
    const [selectedShape, setSelectedShape] = useState<ShapeType>('rect');
    const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const isDrawingRef = useRef(false);
    const isResizingRef = useRef(false);
    const activeHandleRef = useRef<string | null>(null);
    const startPosRef = useRef<Point>({ x: 0, y: 0 });
    const originalShapeRef = useRef<Shape | null>(null);

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
            } else if (shape.type === 'line') {
                ctx.beginPath();
                ctx.moveTo(shape.startX, shape.startY);
                ctx.lineTo(shape.endX, shape.endY);
                ctx.stroke();
            }
        });

        // Draw selection if a shape is selected
        const selectedShape = shapes.find(s => s.id === selectedShapeId);
        if (selectedShape) {
            drawSelectionUI(ctx, selectedShape);
        }
    }

    const drawSelectionUI = (ctx: CanvasRenderingContext2D, shape: Shape) => {
        ctx.save();
        ctx.strokeStyle = '#4a90e2';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);

        let bounds: { x: number; y: number; width: number; height: number };
        if (shape.type === 'rect') {
            bounds = {
                x: shape.x,
                y: shape.y,
                width: shape.width,
                height: shape.height
            };
        } else if (shape.type === 'circle') {
            bounds = {
                x: shape.centerX - shape.radius,
                y: shape.centerY - shape.radius,
                width: shape.radius * 2,
                height: shape.radius * 2
            };
        } else { // line
            const minX = Math.min(shape.startX, shape.endX);
            const minY = Math.min(shape.startY, shape.endY);
            const maxX = Math.max(shape.startX, shape.endX);
            const maxY = Math.max(shape.startY, shape.endY);
            bounds = {
                x: minX,
                y: minY,
                width: maxX - minX,
                height: maxY - minY
            };
        }

        // Draw selection rectangle
        ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);

        // Draw resize handles
        ctx.setLineDash([]);
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#4a90e2';
        ctx.lineWidth = 1;

        const handleSize = 8;
        const handles: ResizeHandle[] = [
            { position: 'top-left', x: bounds.x, y: bounds.y },
            { position: 'top-right', x: bounds.x + bounds.width, y: bounds.y },
            { position: 'bottom-left', x: bounds.x, y: bounds.y + bounds.height },
            { position: 'bottom-right', x: bounds.x + bounds.width, y: bounds.y + bounds.height },
            { position: 'top', x: bounds.x + bounds.width / 2, y: bounds.y },
            { position: 'right', x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2 },
            { position: 'bottom', x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height },
            { position: 'left', x: bounds.x, y: bounds.y + bounds.height / 2 }
        ];

        handles.forEach(handle => {
            ctx.beginPath();
            ctx.rect(
                handle.x - handleSize / 2,
                handle.y - handleSize / 2,
                handleSize,
                handleSize
            );
            ctx.fill();
            ctx.stroke();
        });

        ctx.restore();
    }

    const hitTestShape = (x: number, y: number, shape: Shape): boolean => {
        if (shape.type === 'rect') {
            return x >= shape.x && x <= shape.x + shape.width &&
                   y >= shape.y && y <= shape.y + shape.height;
        } else if (shape.type === 'circle') {
            const dx = x - shape.centerX;
            const dy = y - shape.centerY;
            return Math.sqrt(dx * dx + dy * dy) <= shape.radius;
        } else { // line
            const lineWidth = 10; // Hit test tolerance for lines
            const dx = shape.endX - shape.startX;
            const dy = shape.endY - shape.startY;
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len === 0) return false;

            const t = ((x - shape.startX) * dx + (y - shape.startY) * dy) / (len * len);
            if (t < 0 || t > 1) return false;

            const projX = shape.startX + t * dx;
            const projY = shape.startY + t * dy;
            const distSq = Math.pow(x - projX, 2) + Math.pow(y - projY, 2);
            return distSq <= lineWidth * lineWidth;
        }
    }

    const hitTestHandle = (x: number, y: number, shape: Shape): string | null => {
        const handleSize = 8;
        let bounds: { x: number; y: number; width: number; height: number };
        
        if (shape.type === 'rect') {
            bounds = {
                x: shape.x,
                y: shape.y,
                width: shape.width,
                height: shape.height
            };
        } else if (shape.type === 'circle') {
            bounds = {
                x: shape.centerX - shape.radius,
                y: shape.centerY - shape.radius,
                width: shape.radius * 2,
                height: shape.radius * 2
            };
        } else {
            const minX = Math.min(shape.startX, shape.endX);
            const minY = Math.min(shape.startY, shape.endY);
            const maxX = Math.max(shape.startX, shape.endX);
            const maxY = Math.max(shape.startY, shape.endY);
            bounds = {
                x: minX,
                y: minY,
                width: maxX - minX,
                height: maxY - minY
            };
        }

        const handles: ResizeHandle[] = [
            { position: 'top-left', x: bounds.x, y: bounds.y },
            { position: 'top-right', x: bounds.x + bounds.width, y: bounds.y },
            { position: 'bottom-left', x: bounds.x, y: bounds.y + bounds.height },
            { position: 'bottom-right', x: bounds.x + bounds.width, y: bounds.y + bounds.height },
            { position: 'top', x: bounds.x + bounds.width / 2, y: bounds.y },
            { position: 'right', x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2 },
            { position: 'bottom', x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height },
            { position: 'left', x: bounds.x, y: bounds.y + bounds.height / 2 }
        ];

        for (const handle of handles) {
            if (Math.abs(x - handle.x) <= handleSize / 2 &&
                Math.abs(y - handle.y) <= handleSize / 2) {
                return handle.position;
            }
        }

        return null;
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
        } else if (shapeType === 'circle') {
            const radius = Math.sqrt(
                Math.pow(currentPos.x - startPos.x, 2) + 
                Math.pow(currentPos.y - startPos.y, 2)
            );
            ctx.beginPath();
            ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
            ctx.stroke();
        } else if (shapeType === 'line') {
            ctx.beginPath();
            ctx.moveTo(startPos.x, startPos.y);
            ctx.lineTo(currentPos.x, currentPos.y);
            ctx.stroke();
        }
    }

    // Add WebSocket and initial data loading effect
    useEffect(() => {
        // Load existing shapes
        getExistingShapes(canvasId).then(existingShapes => {
            setShapes(existingShapes);
        });

        // Setup WebSocket connection
        const ws = new WebSocket(`ws://localhost:8080/canvas/${canvasId}`);
        
        ws.onopen = () => {
            console.log('WebSocket Connected');
            setSocket(ws);
        };

        ws.onmessage = (event) => {
            try {
                const message: Shape | DeleteMessage = JSON.parse(event.data);
                if (message.type === 'delete') {
                    setShapes(prevShapes => prevShapes.filter(shape => shape.id !== message.id));
                    if (selectedShapeId === message.id) {
                        setSelectedShapeId(null);
                    }
                } else {
                    // Check if we already have this shape
                    setShapes(prevShapes => {
                        const existingIndex = prevShapes.findIndex(s => s.id === message.id);
                        if (existingIndex >= 0) {
                            // Replace existing shape
                            const newShapes = [...prevShapes];
                            newShapes[existingIndex] = message as Shape;
                            return newShapes;
                        } else {
                            // Add new shape
                            return [...prevShapes, message as Shape];
                        }
                    });
                }
            } catch (error) {
                console.error('Failed to parse WebSocket message:', error);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected');
            setSocket(null);
        };

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canvasId]);

    // Modify the shape addition logic to include backend persistence
    const addShape = async (newShape: Shape) => {
        try {
            // Save to database via HTTP server
            await axios.post(`/api/canvas/${canvasId}`, {
                message: JSON.stringify(newShape)
            });

            // Update local state
            setShapes(prevShapes => [...prevShapes, newShape]);

            // Broadcast to other clients via WebSocket server
            if (socket?.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify(newShape));
            }
        } catch (error) {
            console.error('Failed to save shape:', error);
        }
    };

    // Combine both useEffect hooks into one to ensure consistent ordering
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Canvas initialization and resize logic
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        clearCanvas(shapes, canvas, ctx);

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            clearCanvas(shapes, canvas, ctx);
        };
        
        // Mouse event handlers
        const handleMouseDown = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // First check if we're clicking a resize handle of the selected shape
            if (selectedShapeId) {
                const selectedShape = shapes.find(s => s.id === selectedShapeId);
                if (selectedShape) {
                    const handle = hitTestHandle(x, y, selectedShape);
                    if (handle) {
                        isResizingRef.current = true;
                        activeHandleRef.current = handle;
                        startPosRef.current = { x, y };
                        originalShapeRef.current = { ...selectedShape };
                        return;
                    }
                }
            }

            // If not resizing, check for shape selection
            let clickedShape: Shape | undefined;
            // Iterate in reverse to select top-most shape first
            for (let i = shapes.length - 1; i >= 0; i--) {
                if (hitTestShape(x, y, shapes[i])) {
                    clickedShape = shapes[i];
                    break;
                }
            }

            if (clickedShape) {
                setSelectedShapeId(clickedShape.id);
                return;
            }

            // If we clicked empty space, deselect and start drawing
            setSelectedShapeId(null);
            isDrawingRef.current = true;
            startPosRef.current = { x, y };
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const currentPos = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };

            if (isResizingRef.current && selectedShapeId && activeHandleRef.current) {
                const selectedShape = shapes.find(s => s.id === selectedShapeId);
                if (!selectedShape || !originalShapeRef.current) return;

                const dx = currentPos.x - startPosRef.current.x;
                const dy = currentPos.y - startPosRef.current.y;

                const updatedShapes = shapes.map(shape => {
                    if (shape.id !== selectedShapeId) return shape;

                    if (shape.type === 'rect' && originalShapeRef.current?.type === 'rect') {
                        const newShape = { ...shape };
                        const handle = activeHandleRef.current!;

                        switch (handle) {
                            case 'top-left':
                                newShape.width = originalShapeRef.current.width - dx;
                                newShape.height = originalShapeRef.current.height - dy;
                                newShape.x = originalShapeRef.current.x + dx;
                                newShape.y = originalShapeRef.current.y + dy;
                                break;
                            case 'top-right':
                                newShape.width = originalShapeRef.current.width + dx;
                                newShape.height = originalShapeRef.current.height - dy;
                                newShape.y = originalShapeRef.current.y + dy;
                                break;
                            case 'bottom-left':
                                newShape.width = originalShapeRef.current.width - dx;
                                newShape.height = originalShapeRef.current.height + dy;
                                newShape.x = originalShapeRef.current.x + dx;
                                break;
                            case 'bottom-right':
                                newShape.width = originalShapeRef.current.width + dx;
                                newShape.height = originalShapeRef.current.height + dy;
                                break;
                            case 'top':
                                newShape.height = originalShapeRef.current.height - dy;
                                newShape.y = originalShapeRef.current.y + dy;
                                break;
                            case 'right':
                                newShape.width = originalShapeRef.current.width + dx;
                                break;
                            case 'bottom':
                                newShape.height = originalShapeRef.current.height + dy;
                                break;
                            case 'left':
                                newShape.width = originalShapeRef.current.width - dx;
                                newShape.x = originalShapeRef.current.x + dx;
                                break;
                        }

                        // Ensure minimum size and flip if necessary
                        if (newShape.width < 0) {
                            newShape.width = Math.abs(newShape.width);
                            newShape.x = originalShapeRef.current.x + originalShapeRef.current.width - newShape.width;
                        }
                        if (newShape.height < 0) {
                            newShape.height = Math.abs(newShape.height);
                            newShape.y = originalShapeRef.current.y + originalShapeRef.current.height - newShape.height;
                        }

                        return newShape;
                    } else if (shape.type === 'circle' && originalShapeRef.current?.type === 'circle') {
                        const center = {
                            x: originalShapeRef.current.centerX,
                            y: originalShapeRef.current.centerY
                        };
                        
                        // For circles, all handles adjust the radius based on distance from center
                        const newRadius = Math.sqrt(
                            Math.pow(currentPos.x - center.x, 2) +
                            Math.pow(currentPos.y - center.y, 2)
                        );
                        
                        return {
                            ...shape,
                            radius: Math.max(newRadius, 1) // Ensure minimum radius
                        };
                    } else if (shape.type === 'line' && originalShapeRef.current?.type === 'line') {
                        const handle = activeHandleRef.current!;
                        const newShape = { ...shape };

                        if (handle === 'top-left' || handle === 'left') {
                            newShape.startX = currentPos.x;
                            newShape.startY = currentPos.y;
                        } else {
                            newShape.endX = currentPos.x;
                            newShape.endY = currentPos.y;
                        }

                        return newShape;
                    }

                    return shape;
                });

                setShapes(updatedShapes);
                clearCanvas(updatedShapes, canvas, ctx);
                return;
            }

            if (isDrawingRef.current) {
                clearCanvas(shapes, canvas, ctx);
                drawCurrentShape(ctx, startPosRef.current, currentPos, selectedShape);
            }
        };

        const handleMouseUp = async (e: MouseEvent) => {
            if (isResizingRef.current) {
                isResizingRef.current = false;
                activeHandleRef.current = null;
                originalShapeRef.current = null;

                // Update the resized shape on the server
                const resizedShape = shapes.find(s => s.id === selectedShapeId);
                if (resizedShape) {
                    try {
                        await axios.post(`/api/canvas/${canvasId}`, {
                            message: JSON.stringify(resizedShape)
                        });
                        if (socket?.readyState === WebSocket.OPEN) {
                            socket.send(JSON.stringify(resizedShape));
                        }
                    } catch (error) {
                        console.error('Failed to save resized shape:', error);
                    }
                }
                return;
            }

            if (!isDrawingRef.current) return;

            const rect = canvas.getBoundingClientRect();
            const currentPos = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };

            let newShape: Shape;
            const id = Date.now().toString();

            if (selectedShape === 'rect') {
                const x = Math.min(startPosRef.current.x, currentPos.x);
                const y = Math.min(startPosRef.current.y, currentPos.y);
                const width = Math.abs(currentPos.x - startPosRef.current.x);
                const height = Math.abs(currentPos.y - startPosRef.current.y);
                newShape = { id, type: 'rect', x, y, width, height };
            } else if (selectedShape === 'circle') {
                const radius = Math.sqrt(
                    Math.pow(currentPos.x - startPosRef.current.x, 2) + 
                    Math.pow(currentPos.y - startPosRef.current.y, 2)
                );
                newShape = {
                    id,
                    type: 'circle',
                    centerX: startPosRef.current.x,
                    centerY: startPosRef.current.y,
                    radius
                };
            } else {
                newShape = {
                    id,
                    type: 'line',
                    startX: startPosRef.current.x,
                    startY: startPosRef.current.y,
                    endX: currentPos.x,
                    endY: currentPos.y
                };
            }

            try {
                await addShape(newShape);
            } catch (error) {
                console.error('Failed to add shape:', error);
            }

            isDrawingRef.current = false;
        };

        // Add keyboard event handler for deletion
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedShapeId) {
                const updatedShapes = shapes.filter(shape => shape.id !== selectedShapeId);
                setShapes(updatedShapes);
                setSelectedShapeId(null);
                clearCanvas(updatedShapes, canvas, ctx);

                // Create a deletion message
                const deleteMessage: DeleteMessage = {
                    type: 'delete',
                    id: selectedShapeId
                };

                // Persist deletion to backend
                try {
                    axios.post(`/api/canvas/${canvasId}`, {
                        message: JSON.stringify(deleteMessage)
                    });
                } catch (error) {
                    console.error('Failed to persist shape deletion:', error);
                }

                // Notify other clients about the deletion
                if (socket?.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify(deleteMessage));
                }
            }
        };

        // Add all event listeners
        window.addEventListener('resize', handleResize);
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('keydown', handleKeyDown);

        // Cleanup function
        return () => {
            window.removeEventListener('resize', handleResize);
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('keydown', handleKeyDown);
        };
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shapes, selectedShape, selectedShapeId, socket, canvasId]);

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
                <button
                    onClick={() => setSelectedShape('line')}
                    style={{
                        backgroundColor: selectedShape === 'line' ? '#4a90e2' : '#2c2c2c',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s'
                    }}
                >
                    Line
                </button>
            </div>
        </div>
    );
};

export default CanvasPage;