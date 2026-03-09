/**
 * CircleGridVisualization
 *
 * An interactive SVG visualization for exploring circle fill algorithms on a grid.
 * Supports multiple modes: basic fill, distance display, bounding box, bounding circle, outlines.
 */

import { useMemo } from 'react';
import { useVar } from '@/stores';

export type CircleGridMode =
    | 'fill'           // Basic circle fill
    | 'distance'       // Show distances from center
    | 'boundingBox'    // Show bounding box optimization
    | 'boundingCircle' // Show bounding circle with Pythagorean triangle
    | 'outline'        // Show circle outline algorithm
    | 'comparison'     // Side-by-side comparison
    | 'movableCenter'; // Center can be moved

export interface CircleGridProps {
    /** Visualization mode */
    mode?: CircleGridMode;
    /** Variable name for radius */
    radiusVar?: string;
    /** Default radius if no variable */
    defaultRadius?: number;
    /** Grid size (tiles from center in each direction) */
    gridSize?: number;
    /** Show distance values on tiles */
    showDistances?: boolean;
    /** Variable name for showing distances toggle */
    showDistancesVar?: string;
    /** Show bounding box */
    showBoundingBox?: boolean;
    /** Variable name for bounding box toggle */
    showBoundingBoxVar?: string;
    /** Variable name for selected row (bounding circle mode) */
    selectedRowVar?: string;
    /** Default selected row */
    defaultSelectedRow?: number;
    /** Variable name for outline step */
    outlineStepVar?: string;
    /** Show 8-fold symmetry */
    showSymmetry?: boolean;
    /** Variable name for symmetry toggle */
    showSymmetryVar?: string;
    /** Variable name for center X (movable center mode) */
    centerXVar?: string;
    /** Variable name for center Y (movable center mode) */
    centerYVar?: string;
    /** Default center X */
    defaultCenterX?: number;
    /** Default center Y */
    defaultCenterY?: number;
    /** Height of the visualization */
    height?: number;
    /** Highlight variable name for linked highlighting */
    highlightVarName?: string;
}

export const CircleGridVisualization = ({
    mode = 'fill',
    radiusVar,
    defaultRadius = 3.5,
    gridSize = 9,
    showDistances: showDistancesProp = false,
    showDistancesVar,
    showBoundingBox: showBoundingBoxProp = false,
    showBoundingBoxVar,
    selectedRowVar,
    defaultSelectedRow = 0,
    outlineStepVar,
    showSymmetry: showSymmetryProp = false,
    showSymmetryVar,
    centerXVar,
    centerYVar,
    defaultCenterX,
    defaultCenterY,
    height = 400,
    highlightVarName,
}: CircleGridProps) => {
    // Get values from store
    const radius = useVar(radiusVar || '_unused_radius', defaultRadius) as number;
    const showDistancesFromVar = useVar(showDistancesVar || '_unused_dist', showDistancesProp) as boolean;
    const showBoundingBoxFromVar = useVar(showBoundingBoxVar || '_unused_bb', showBoundingBoxProp) as boolean;
    const selectedRow = useVar(selectedRowVar || '_unused_row', defaultSelectedRow) as number;
    const outlineStep = useVar(outlineStepVar || '_unused_step', 0) as number;
    const showSymmetryFromVar = useVar(showSymmetryVar || '_unused_sym', showSymmetryProp) as boolean;
    const centerXFromVar = useVar(centerXVar || '_unused_cx', defaultCenterX ?? gridSize / 2) as number;
    const centerYFromVar = useVar(centerYVar || '_unused_cy', defaultCenterY ?? gridSize / 2) as number;
    const highlightedId = useVar(highlightVarName || '_unused_hl', '') as string;

    const showDistances = showDistancesVar ? showDistancesFromVar : showDistancesProp;
    const showBoundingBox = showBoundingBoxVar ? showBoundingBoxFromVar : showBoundingBoxProp;
    const showSymmetry = showSymmetryVar ? showSymmetryFromVar : showSymmetryProp;

    // Calculate center based on mode
    const centerX = mode === 'movableCenter' ? centerXFromVar : Math.floor(gridSize / 2);
    const centerY = mode === 'movableCenter' ? centerYFromVar : Math.floor(gridSize / 2);

    // Calculate tile size based on grid size and height
    const tileSize = height / (gridSize + 1);
    const padding = tileSize / 2;
    const width = (gridSize + 1) * tileSize;

    // Calculate which tiles are inside the circle
    const tiles = useMemo(() => {
        const result: Array<{
            x: number;
            y: number;
            distance: number;
            inside: boolean;
            inBoundingBox: boolean;
            isOutline: boolean;
            symmetryGroup?: number;
        }> = [];

        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const inside = distance <= radius;

                // Check if in bounding box
                const inBoundingBox =
                    x >= Math.ceil(centerX - radius) &&
                    x <= Math.floor(centerX + radius) &&
                    y >= Math.ceil(centerY - radius) &&
                    y <= Math.floor(centerY + radius);

                // For outline mode, determine if this is an edge tile
                let isOutline = false;
                if (mode === 'outline' && inside) {
                    // Check if any neighbor is outside
                    const neighbors = [
                        [x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]
                    ];
                    for (const [nx, ny] of neighbors) {
                        const ndx = nx - centerX;
                        const ndy = ny - centerY;
                        const nDist = Math.sqrt(ndx * ndx + ndy * ndy);
                        if (nDist > radius) {
                            isOutline = true;
                            break;
                        }
                    }
                }

                result.push({ x, y, distance, inside, inBoundingBox, isOutline });
            }
        }

        return result;
    }, [gridSize, centerX, centerY, radius, mode]);

    // Calculate bounding box bounds
    const boundingBox = useMemo(() => {
        const top = Math.ceil(centerY - radius);
        const bottom = Math.floor(centerY + radius);
        const left = Math.ceil(centerX - radius);
        const right = Math.floor(centerX + radius);
        return { top, bottom, left, right };
    }, [centerX, centerY, radius]);

    // Calculate Pythagorean triangle for bounding circle mode
    const pythagoreanTriangle = useMemo(() => {
        if (mode !== 'boundingCircle') return null;

        const dy = selectedRow;
        const dx = Math.sqrt(Math.max(0, radius * radius - dy * dy));

        return {
            dy,
            dx,
            radius,
            leftX: centerX - dx,
            rightX: centerX + dx,
            rowY: centerY + dy,
        };
    }, [mode, selectedRow, radius, centerX, centerY]);

    // Calculate outline tiles using the 8-fold symmetry algorithm
    const outlineTiles = useMemo(() => {
        if (mode !== 'outline') return [];

        const tiles: Array<{ x: number; y: number; group: number }> = [];
        const maxR = Math.floor(radius * Math.sqrt(0.5));

        for (let r = 0; r <= maxR; r++) {
            const d = Math.floor(Math.sqrt(radius * radius - r * r));

            // 8 tiles for each r value
            tiles.push(
                { x: centerX - d, y: centerY + r, group: 0 },
                { x: centerX + d, y: centerY + r, group: 1 },
                { x: centerX - d, y: centerY - r, group: 2 },
                { x: centerX + d, y: centerY - r, group: 3 },
                { x: centerX + r, y: centerY - d, group: 4 },
                { x: centerX + r, y: centerY + d, group: 5 },
                { x: centerX - r, y: centerY - d, group: 6 },
                { x: centerX - r, y: centerY + d, group: 7 }
            );
        }

        return tiles;
    }, [mode, radius, centerX, centerY]);

    // Get tile color based on state
    const getTileColor = (tile: typeof tiles[0]) => {
        if (mode === 'outline') {
            const outlineTile = outlineTiles.find(t => t.x === tile.x && t.y === tile.y);
            if (outlineTile) {
                if (showSymmetry) {
                    const colors = [
                        '#3b82f6', '#ef4444', '#22c55e', '#f59e0b',
                        '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
                    ];
                    return colors[outlineTile.group % 8];
                }
                return '#3b82f6';
            }
            return '#f1f5f9';
        }

        if (!tile.inside) {
            if (mode === 'boundingBox' && showBoundingBox && tile.inBoundingBox) {
                return '#fef3c7'; // Light yellow for bounding box tiles outside circle
            }
            return '#f1f5f9'; // Light gray for outside
        }

        return '#3b82f6'; // Blue for inside
    };

    // Get tile opacity
    const getTileOpacity = (tile: typeof tiles[0]) => {
        if (mode === 'boundingBox' && !tile.inBoundingBox && !tile.inside) {
            return 0.3; // Dim tiles outside bounding box
        }
        return 1;
    };

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full"
            style={{ height, maxHeight: height }}
        >
            {/* Background */}
            <rect x={0} y={0} width={width} height={height} fill="white" />

            {/* Grid lines */}
            {Array.from({ length: gridSize + 1 }).map((_, i) => (
                <g key={`grid-${i}`}>
                    <line
                        x1={padding + i * tileSize}
                        y1={padding}
                        x2={padding + i * tileSize}
                        y2={padding + gridSize * tileSize}
                        stroke="#e2e8f0"
                        strokeWidth={0.5}
                    />
                    <line
                        x1={padding}
                        y1={padding + i * tileSize}
                        x2={padding + gridSize * tileSize}
                        y2={padding + i * tileSize}
                        stroke="#e2e8f0"
                        strokeWidth={0.5}
                    />
                </g>
            ))}

            {/* Tiles */}
            {tiles.map((tile) => (
                <g key={`tile-${tile.x}-${tile.y}`}>
                    <rect
                        x={padding + tile.x * tileSize + 1}
                        y={padding + tile.y * tileSize + 1}
                        width={tileSize - 2}
                        height={tileSize - 2}
                        fill={getTileColor(tile)}
                        opacity={getTileOpacity(tile)}
                        rx={2}
                        className="transition-all duration-200"
                    />
                    {/* Distance label */}
                    {(showDistances || mode === 'distance') && (
                        <text
                            x={padding + tile.x * tileSize + tileSize / 2}
                            y={padding + tile.y * tileSize + tileSize / 2}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize={tileSize > 35 ? 10 : 8}
                            fill={tile.inside ? 'white' : '#64748b'}
                            fontFamily="ui-monospace, monospace"
                        >
                            {tile.distance.toFixed(1)}
                        </text>
                    )}
                </g>
            ))}

            {/* Bounding box overlay */}
            {mode === 'boundingBox' && showBoundingBox && (
                <>
                    {/* Left label */}
                    <text
                        x={padding + boundingBox.left * tileSize}
                        y={padding - 8}
                        textAnchor="middle"
                        fontSize={11}
                        fill="#0ea5e9"
                        fontWeight="600"
                    >
                        left
                    </text>
                    {/* Right label */}
                    <text
                        x={padding + (boundingBox.right + 1) * tileSize}
                        y={padding - 8}
                        textAnchor="middle"
                        fontSize={11}
                        fill="#0ea5e9"
                        fontWeight="600"
                    >
                        right
                    </text>
                    {/* Top label */}
                    <text
                        x={padding - 8}
                        y={padding + boundingBox.top * tileSize + tileSize / 2}
                        textAnchor="end"
                        dominantBaseline="middle"
                        fontSize={11}
                        fill="#0ea5e9"
                        fontWeight="600"
                    >
                        top
                    </text>
                    {/* Bottom label */}
                    <text
                        x={padding - 8}
                        y={padding + (boundingBox.bottom + 1) * tileSize - tileSize / 2}
                        textAnchor="end"
                        dominantBaseline="middle"
                        fontSize={11}
                        fill="#0ea5e9"
                        fontWeight="600"
                    >
                        bottom
                    </text>
                    {/* Bounding box outline */}
                    <rect
                        x={padding + boundingBox.left * tileSize}
                        y={padding + boundingBox.top * tileSize}
                        width={(boundingBox.right - boundingBox.left + 1) * tileSize}
                        height={(boundingBox.bottom - boundingBox.top + 1) * tileSize}
                        fill="none"
                        stroke="#0ea5e9"
                        strokeWidth={2}
                        strokeDasharray="4 2"
                    />
                </>
            )}

            {/* Pythagorean triangle for bounding circle mode */}
            {mode === 'boundingCircle' && pythagoreanTriangle && (
                <>
                    {/* Vertical line (dy) */}
                    <line
                        x1={padding + centerX * tileSize + tileSize / 2}
                        y1={padding + centerY * tileSize + tileSize / 2}
                        x2={padding + centerX * tileSize + tileSize / 2}
                        y2={padding + pythagoreanTriangle.rowY * tileSize + tileSize / 2}
                        stroke="#f97316"
                        strokeWidth={2}
                    />
                    {/* Horizontal line (dx) */}
                    <line
                        x1={padding + centerX * tileSize + tileSize / 2}
                        y1={padding + pythagoreanTriangle.rowY * tileSize + tileSize / 2}
                        x2={padding + pythagoreanTriangle.rightX * tileSize + tileSize / 2}
                        y2={padding + pythagoreanTriangle.rowY * tileSize + tileSize / 2}
                        stroke="#22c55e"
                        strokeWidth={2}
                    />
                    {/* Hypotenuse (radius) */}
                    <line
                        x1={padding + centerX * tileSize + tileSize / 2}
                        y1={padding + centerY * tileSize + tileSize / 2}
                        x2={padding + pythagoreanTriangle.rightX * tileSize + tileSize / 2}
                        y2={padding + pythagoreanTriangle.rowY * tileSize + tileSize / 2}
                        stroke="#3b82f6"
                        strokeWidth={2}
                    />
                    {/* Labels */}
                    <text
                        x={padding + centerX * tileSize + tileSize / 2 - 15}
                        y={padding + (centerY + pythagoreanTriangle.dy / 2) * tileSize + tileSize / 2}
                        fontSize={12}
                        fill="#f97316"
                        fontWeight="600"
                    >
                        dy
                    </text>
                    <text
                        x={padding + (centerX + pythagoreanTriangle.dx / 2) * tileSize + tileSize / 2}
                        y={padding + pythagoreanTriangle.rowY * tileSize + tileSize / 2 + 18}
                        fontSize={12}
                        fill="#22c55e"
                        fontWeight="600"
                        textAnchor="middle"
                    >
                        dx = {pythagoreanTriangle.dx.toFixed(1)}
                    </text>
                    {/* Row highlight */}
                    <rect
                        x={padding + Math.floor(pythagoreanTriangle.leftX) * tileSize}
                        y={padding + pythagoreanTriangle.rowY * tileSize}
                        width={(Math.floor(pythagoreanTriangle.rightX) - Math.floor(pythagoreanTriangle.leftX) + 1) * tileSize}
                        height={tileSize}
                        fill="none"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                    />
                    {/* Left/Right labels */}
                    <text
                        x={padding + Math.floor(pythagoreanTriangle.leftX) * tileSize + tileSize / 2}
                        y={padding + pythagoreanTriangle.rowY * tileSize - 5}
                        textAnchor="middle"
                        fontSize={11}
                        fill="#8b5cf6"
                        fontWeight="600"
                    >
                        left
                    </text>
                    <text
                        x={padding + Math.floor(pythagoreanTriangle.rightX) * tileSize + tileSize / 2}
                        y={padding + pythagoreanTriangle.rowY * tileSize - 5}
                        textAnchor="middle"
                        fontSize={11}
                        fill="#8b5cf6"
                        fontWeight="600"
                    >
                        right
                    </text>
                </>
            )}

            {/* Circle outline */}
            <circle
                cx={padding + centerX * tileSize + tileSize / 2}
                cy={padding + centerY * tileSize + tileSize / 2}
                r={radius * tileSize}
                fill="none"
                stroke="#0ea5e9"
                strokeWidth={1.5}
                strokeDasharray="4 2"
                opacity={0.7}
            />

            {/* Center marker */}
            <circle
                cx={padding + centerX * tileSize + tileSize / 2}
                cy={padding + centerY * tileSize + tileSize / 2}
                r={4}
                fill="#ef4444"
            />

            {/* Radius label */}
            <text
                x={padding + centerX * tileSize + tileSize / 2 + radius * tileSize / 2}
                y={padding + centerY * tileSize + tileSize / 2 - 8}
                textAnchor="middle"
                fontSize={12}
                fill="#0ea5e9"
                fontWeight="600"
            >
                r = {radius}
            </text>
        </svg>
    );
};

export default CircleGridVisualization;
