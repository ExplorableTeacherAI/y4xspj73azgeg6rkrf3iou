/**
 * PlayerRangeVisualization
 *
 * A game-style visualization showing a player icon at the center with an
 * adjustable "throw range" circle. Tiles within range glow green, tiles
 * outside are dimmed. Creates an engaging game-like feel.
 */

import { useMemo } from 'react';
import { useVar } from '@/stores';

export interface PlayerRangeVisualizationProps {
    /** Variable name for radius */
    radiusVar?: string;
    /** Default radius if no variable */
    defaultRadius?: number;
    /** Grid size (tiles from center in each direction) */
    gridSize?: number;
    /** Height of the visualization */
    height?: number;
}

export const PlayerRangeVisualization = ({
    radiusVar,
    defaultRadius = 3.5,
    gridSize = 11,
    height = 350,
}: PlayerRangeVisualizationProps) => {
    const radius = useVar(radiusVar || '_unused_radius', defaultRadius) as number;

    // Calculate center
    const centerX = Math.floor(gridSize / 2);
    const centerY = Math.floor(gridSize / 2);

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
                viewBox={`0 0 ${width} ${height}`}
                className="w-full"
                style={{ height, maxHeight: height }}
            >
                {/* Background - grass-like field */}
                <defs>
                    <pattern id="grass-pattern" patternUnits="userSpaceOnUse" width="20" height="20">
                        <rect width="20" height="20" fill="#4ade80" opacity="0.15" />
                        <circle cx="5" cy="5" r="1" fill="#22c55e" opacity="0.2" />
                        <circle cx="15" cy="15" r="1" fill="#22c55e" opacity="0.2" />
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
                            stroke="#d1d5db"
                            strokeWidth={0.5}
                            opacity={0.5}
                        />
                        <line
                            x1={padding}
                            y1={padding + i * tileSize}
                            x2={padding + gridSize * tileSize}
                            y2={padding + i * tileSize}
                            stroke="#d1d5db"
                            strokeWidth={0.5}
                            opacity={0.5}
                        />
                    </g>
                ))}

                {/* Tiles - glowing green for in-range, dimmed for out-of-range */}
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
                                fill={tile.inside ? '#22c55e' : '#94a3b8'}
                                opacity={tile.inside ? 0.6 : 0.15}
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
                                    stroke="#22c55e"
                                    strokeWidth={1.5}
                                    rx={3}
                                    opacity={0.8}
                                    className="transition-all duration-300"
                                />
                            )}
                        </g>
                    );
                })}

                {/* Range circle - dashed outline */}
                <circle
                    cx={padding + centerX * tileSize + tileSize / 2}
                    cy={padding + centerY * tileSize + tileSize / 2}
                    r={radius * tileSize}
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth={2}
                    strokeDasharray="8 4"
                    opacity={0.8}
                />

                {/* Inner glow for range */}
                <circle
                    cx={padding + centerX * tileSize + tileSize / 2}
                    cy={padding + centerY * tileSize + tileSize / 2}
                    r={radius * tileSize}
                    fill="url(#range-glow)"
                    opacity={0.1}
                />
                <defs>
                    <radialGradient id="range-glow">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
                        <stop offset="70%" stopColor="#22c55e" stopOpacity="0.1" />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                    </radialGradient>
                </defs>

                {/* Player icon at center */}
                <g transform={`translate(${padding + centerX * tileSize + tileSize / 2}, ${padding + centerY * tileSize + tileSize / 2})`}>
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
                        fill="#3b82f6"
                        stroke="#1d4ed8"
                        strokeWidth={2}
                    />
                    {/* Player head */}
                    <circle
                        cx={0}
                        cy={-14}
                        r={7}
                        fill="#fbbf24"
                        stroke="#f59e0b"
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
                <g transform={`translate(${padding + centerX * tileSize + tileSize / 2 + radius * tileSize * 0.7}, ${padding + centerY * tileSize + tileSize / 2 - radius * tileSize * 0.7})`}>
                    <rect
                        x={-24}
                        y={-10}
                        width={48}
                        height={20}
                        fill="white"
                        rx={4}
                        opacity={0.9}
                    />
                    <text
                        x={0}
                        y={4}
                        textAnchor="middle"
                        fontSize={12}
                        fontWeight="600"
                        fill="#16a34a"
                    >
                        r = {radius}
                    </text>
                </g>
            </svg>

            {/* Tile count indicator */}
            <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-green-200">
                <span className="text-sm font-medium text-green-700">
                    {tilesInRange} tiles in range
                </span>
            </div>
        </div>
    );
};

export default PlayerRangeVisualization;
