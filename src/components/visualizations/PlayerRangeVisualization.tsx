/**
 * PlayerRangeVisualization
 *
 * A game-style visualization showing a player icon at the center with an
 * adjustable "throw range" circle. Tiles within range glow green, tiles
 * outside are dimmed. Creates an engaging game-like feel.
 *
 * The boundary circle is draggable to adjust the radius interactively.
 */

import React, { useMemo, useState, useCallback, useRef } from 'react';
import { useVar, useVariableStore } from '@/stores';

// Consistent color palette matching CircleGridVisualization
const COLORS = {
    // Primary colors - matching CircleGridVisualization
    inside: '#0ea5e9',       // Sky blue - tiles inside circle
    insideGlow: '#0ea5e9',   // Matching glow for consistency
    outside: '#f1f5f9',      // Light gray - matching CircleGridVisualization
    outsideDim: '#e2e8f0',   // Dimmed gray

    // Circle and radius
    circleBorder: '#0ea5e9',
    circleBorderHover: '#0284c7',
    centerDot: '#ef4444',    // Red center marker

    // Player (game-style elements)
    player: '#3b82f6',
    playerHead: '#fbbf24',
    playerBodyStroke: '#1d4ed8',
    playerHeadStroke: '#f59e0b',

    // Grid
    gridLine: '#e2e8f0',
    gridPattern: '#4ade80',
    gridPatternDot: '#22c55e',
};

export interface PlayerRangeVisualizationProps {
    /** Variable name for radius */
    radiusVar?: string;
    /** Default radius if no variable */
    defaultRadius?: number;
    /** Grid size (tiles from center in each direction) */
    gridSize?: number;
    /** Height of the visualization */
    height?: number;
    /** Minimum radius */
    minRadius?: number;
    /** Maximum radius */
    maxRadius?: number;
    /** Radius step */
    radiusStep?: number;
}

export const PlayerRangeVisualization = ({
    radiusVar,
    defaultRadius = 3.5,
    gridSize = 11,
    height = 350,
    minRadius = 0.5,
    maxRadius = 6,
    radiusStep = 0.5,
}: PlayerRangeVisualizationProps) => {
    const radius = useVar(radiusVar || '_unused_radius', defaultRadius) as number;
    const setVar = useVariableStore(s => s.setVariable);
    const svgRef = useRef<SVGSVGElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    // Calculate center
    const centerX = Math.floor(gridSize / 2);
    const centerY = Math.floor(gridSize / 2);

    // Calculate tile size based on grid size and height
    const tileSize = height / (gridSize + 1);
    const padding = tileSize / 2;
    const width = (gridSize + 1) * tileSize;

    // Center coordinates in SVG space
    const centerSvgX = padding + centerX * tileSize + tileSize / 2;
    const centerSvgY = padding + centerY * tileSize + tileSize / 2;

    // Convert mouse position to radius
    const getRadiusFromEvent = useCallback((e: MouseEvent | React.MouseEvent) => {
        if (!svgRef.current) return radius;

        const svg = svgRef.current;
        const rect = svg.getBoundingClientRect();
        const scaleX = width / rect.width;
        const scaleY = height / rect.height;

        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;

        const dx = mouseX - centerSvgX;
        const dy = mouseY - centerSvgY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Convert pixel distance to tile units
        let newRadius = distance / tileSize;

        // Snap to step
        newRadius = Math.round(newRadius / radiusStep) * radiusStep;

        // Clamp to bounds
        return Math.max(minRadius, Math.min(maxRadius, newRadius));
    }, [width, height, centerSvgX, centerSvgY, tileSize, radiusStep, minRadius, maxRadius, radius]);

    // Mouse handlers for dragging
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);

        const newRadius = getRadiusFromEvent(e);
        if (radiusVar) {
            setVar(radiusVar, newRadius);
        }
    }, [getRadiusFromEvent, radiusVar, setVar]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging) return;

        const newRadius = getRadiusFromEvent(e);
        if (radiusVar) {
            setVar(radiusVar, newRadius);
        }
    }, [isDragging, getRadiusFromEvent, radiusVar, setVar]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Attach global mouse listeners when dragging
    React.useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    // Calculate which tiles are inside the circle
    const tiles = useMemo(() => {
        const result: Array<{
            x: number;
            y: number;
            distance: number;
            inside: boolean;
        }> = [];

        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const inside = distance <= radius;

                result.push({ x, y, distance, inside });
            }
        }

        return result;
    }, [gridSize, centerX, centerY, radius]);

    // Count tiles in range
    const tilesInRange = tiles.filter(t => t.inside).length;

    return (
        <div className="relative">
            <svg
                ref={svgRef}
                viewBox={`0 0 ${width} ${height}`}
                className="w-full"
                style={{ height, maxHeight: height, cursor: isDragging ? 'grabbing' : 'default' }}
            >
                {/* Background - grass-like field */}
                <defs>
                    <pattern id="grass-pattern" patternUnits="userSpaceOnUse" width="20" height="20">
                        <rect width="20" height="20" fill={COLORS.gridPattern} opacity="0.15" />
                        <circle cx="5" cy="5" r="1" fill={COLORS.gridPatternDot} opacity="0.2" />
                        <circle cx="15" cy="15" r="1" fill={COLORS.gridPatternDot} opacity="0.2" />
                    </pattern>
                </defs>
                <rect x={0} y={0} width={width} height={height} fill="white" />
                <rect x={padding} y={padding} width={gridSize * tileSize} height={gridSize * tileSize} fill="url(#grass-pattern)" />

                {/* Grid lines - subtle */}
                {Array.from({ length: gridSize + 1 }).map((_, i) => (
                    <g key={`grid-${i}`}>
                        <line
                            x1={padding + i * tileSize}
                            y1={padding}
                            x2={padding + i * tileSize}
                            y2={padding + gridSize * tileSize}
                            stroke={COLORS.gridLine}
                            strokeWidth={0.5}
                            opacity={0.5}
                        />
                        <line
                            x1={padding}
                            y1={padding + i * tileSize}
                            x2={padding + gridSize * tileSize}
                            y2={padding + i * tileSize}
                            stroke={COLORS.gridLine}
                            strokeWidth={0.5}
                            opacity={0.5}
                        />
                    </g>
                ))}

                {/* Tiles - matching CircleGridVisualization colors */}
                {tiles.map((tile) => {
                    const isCenter = tile.x === centerX && tile.y === centerY;

                    if (isCenter) return null; // Don't draw tile under player

                    return (
                        <g key={`tile-${tile.x}-${tile.y}`}>
                            <rect
                                x={padding + tile.x * tileSize + 2}
                                y={padding + tile.y * tileSize + 2}
                                width={tileSize - 4}
                                height={tileSize - 4}
                                fill={tile.inside ? COLORS.inside : COLORS.outside}
                                opacity={tile.inside ? 0.8 : 0.5}
                                rx={3}
                                className="transition-all duration-300"
                            />
                            {/* Glow effect for in-range tiles */}
                            {tile.inside && (
                                <rect
                                    x={padding + tile.x * tileSize + 2}
                                    y={padding + tile.y * tileSize + 2}
                                    width={tileSize - 4}
                                    height={tileSize - 4}
                                    fill="none"
                                    stroke={COLORS.insideGlow}
                                    strokeWidth={1.5}
                                    rx={3}
                                    opacity={0.8}
                                    className="transition-all duration-300"
                                />
                            )}
                        </g>
                    );
                })}

                {/* Range circle - draggable boundary */}
                {/* Invisible wider stroke for easier grabbing */}
                <circle
                    cx={centerSvgX}
                    cy={centerSvgY}
                    r={radius * tileSize}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={20}
                    style={{ cursor: 'grab' }}
                    onMouseDown={handleMouseDown}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                />
                {/* Visible dashed outline */}
                <circle
                    cx={centerSvgX}
                    cy={centerSvgY}
                    r={radius * tileSize}
                    fill="none"
                    stroke={isHovering || isDragging ? COLORS.circleBorderHover : COLORS.circleBorder}
                    strokeWidth={isHovering || isDragging ? 2.5 : 1.5}
                    strokeDasharray="6 3"
                    opacity={0.8}
                    style={{ cursor: 'grab', pointerEvents: 'none' }}
                    className="transition-all duration-150"
                />
                {/* Drag handle indicators on the circle */}
                {(isHovering || isDragging) && (
                    <>
                        {[0, 90, 180, 270].map((angle) => {
                            const rad = (angle * Math.PI) / 180;
                            const hx = centerSvgX + Math.cos(rad) * radius * tileSize;
                            const hy = centerSvgY + Math.sin(rad) * radius * tileSize;
                            return (
                                <circle
                                    key={angle}
                                    cx={hx}
                                    cy={hy}
                                    r={5}
                                    fill={COLORS.circleBorderHover}
                                    stroke="white"
                                    strokeWidth={2}
                                    style={{ pointerEvents: 'none' }}
                                />
                            );
                        })}
                    </>
                )}

                {/* Inner glow for range */}
                <circle
                    cx={centerSvgX}
                    cy={centerSvgY}
                    r={radius * tileSize}
                    fill="url(#range-glow)"
                    opacity={0.1}
                    style={{ pointerEvents: 'none' }}
                />
                <defs>
                    <radialGradient id="range-glow">
                        <stop offset="0%" stopColor={COLORS.inside} stopOpacity="0.3" />
                        <stop offset="70%" stopColor={COLORS.inside} stopOpacity="0.1" />
                        <stop offset="100%" stopColor={COLORS.inside} stopOpacity="0" />
                    </radialGradient>
                </defs>

                {/* Player icon at center */}
                <g transform={`translate(${centerSvgX}, ${centerSvgY})`} style={{ pointerEvents: 'none' }}>
                    {/* Player shadow */}
                    <ellipse
                        cx={0}
                        cy={8}
                        rx={10}
                        ry={4}
                        fill="#000"
                        opacity={0.2}
                    />
                    {/* Player body */}
                    <circle
                        cx={0}
                        cy={-2}
                        r={12}
                        fill={COLORS.player}
                        stroke={COLORS.playerBodyStroke}
                        strokeWidth={2}
                    />
                    {/* Player head */}
                    <circle
                        cx={0}
                        cy={-14}
                        r={7}
                        fill={COLORS.playerHead}
                        stroke={COLORS.playerHeadStroke}
                        strokeWidth={1.5}
                    />
                    {/* Eyes */}
                    <circle cx={-2} cy={-15} r={1.2} fill="#1f2937" />
                    <circle cx={2} cy={-15} r={1.2} fill="#1f2937" />
                    {/* Smile */}
                    <path
                        d="M -2 -12 Q 0 -10 2 -12"
                        fill="none"
                        stroke="#1f2937"
                        strokeWidth={1}
                        strokeLinecap="round"
                    />
                </g>

                {/* Radius label */}
                <g transform={`translate(${centerSvgX + radius * tileSize * 0.7}, ${centerSvgY - radius * tileSize * 0.7})`} style={{ pointerEvents: 'none' }}>
                    <rect
                        x={-22}
                        y={-10}
                        width={44}
                        height={20}
                        fill="white"
                        rx={4}
                        opacity={0.95}
                    />
                    <text
                        x={0}
                        y={4}
                        textAnchor="middle"
                        fontSize={12}
                        fontWeight="600"
                        fill={COLORS.circleBorder}
                    >
                        r = {radius}
                    </text>
                </g>
            </svg>

            {/* Tile count indicator */}
            <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-sky-200">
                <span className="text-sm font-medium text-sky-700">
                    {tilesInRange} tiles in range
                </span>
            </div>
        </div>
    );
};

export default PlayerRangeVisualization;
