/**
 * TradeoffComparisonVisualization
 *
 * Shows a side-by-side comparison of tiles checked by different algorithms:
 * - Naive: All tiles in grid
 * - Bounding Box: Tiles in the bounding square
 * - Bounding Circle: Only tiles actually inside the circle
 */

import React, { useMemo } from 'react';
import { useVar } from '@/stores';

const COLORS = {
    checked: '#fbbf24',      // Amber - tiles being checked
    inside: '#7dd3fc',       // Light sky blue - tiles inside circle
    outside: '#f1f5f9',      // Light gray - tiles outside
    wasted: '#fecaca',       // Light red - wasted checks
    gridLine: '#e2e8f0',
    circleBorder: '#0ea5e9',
};

interface AlgorithmStats {
    name: string;
    tilesChecked: number;
    tilesInside: number;
    wastedChecks: number;
    efficiency: number;
}

export interface TradeoffComparisonVisualizationProps {
    radiusVar?: string;
    defaultRadius?: number;
    gridSize?: number;
    height?: number;
}

export const TradeoffComparisonVisualization = ({
    radiusVar,
    defaultRadius = 4,
    gridSize = 11,
    height = 320,
}: TradeoffComparisonVisualizationProps) => {
    const radius = useVar(radiusVar || '_unused_radius', defaultRadius) as number;

    const centerX = Math.floor(gridSize / 2);
    const centerY = Math.floor(gridSize / 2);

    // Calculate statistics for each algorithm
    const stats = useMemo((): AlgorithmStats[] => {
        // Count tiles inside circle
        let tilesInside = 0;
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                if (Math.sqrt(dx * dx + dy * dy) <= radius) {
                    tilesInside++;
                }
            }
        }

        // Bounding box dimensions
        const bbTop = Math.ceil(centerY - radius);
        const bbBottom = Math.floor(centerY + radius);
        const bbLeft = Math.ceil(centerX - radius);
        const bbRight = Math.floor(centerX + radius);
        const bbWidth = Math.max(0, bbRight - bbLeft + 1);
        const bbHeight = Math.max(0, bbBottom - bbTop + 1);
        const bbTiles = bbWidth * bbHeight;

        // Naive: check all tiles
        const naiveTiles = gridSize * gridSize;

        return [
            {
                name: 'Naive',
                tilesChecked: naiveTiles,
                tilesInside,
                wastedChecks: naiveTiles - tilesInside,
                efficiency: (tilesInside / naiveTiles) * 100,
            },
            {
                name: 'Bounding Box',
                tilesChecked: bbTiles,
                tilesInside,
                wastedChecks: bbTiles - tilesInside,
                efficiency: (tilesInside / bbTiles) * 100,
            },
            {
                name: 'Bounding Circle',
                tilesChecked: tilesInside,
                tilesInside,
                wastedChecks: 0,
                efficiency: 100,
            },
        ];
    }, [gridSize, centerX, centerY, radius]);

    // Grid rendering helpers
    const tileSize = (height - 60) / gridSize;
    const gridWidth = tileSize * gridSize;

    const renderMiniGrid = (algorithm: 'naive' | 'bbox' | 'bcircle', startX: number) => {
        const tiles = [];

        const bbTop = Math.ceil(centerY - radius);
        const bbBottom = Math.floor(centerY + radius);
        const bbLeft = Math.ceil(centerX - radius);
        const bbRight = Math.floor(centerX + radius);

        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const inside = distance <= radius;

                let inBBox = x >= bbLeft && x <= bbRight && y >= bbTop && y <= bbBottom;

                let fill = COLORS.outside;
                let opacity = 0.3;

                if (algorithm === 'naive') {
                    // Show all tiles as checked
                    fill = inside ? COLORS.inside : COLORS.wasted;
                    opacity = 0.7;
                } else if (algorithm === 'bbox') {
                    if (inBBox) {
                        fill = inside ? COLORS.inside : COLORS.wasted;
                        opacity = 0.7;
                    }
                } else if (algorithm === 'bcircle') {
                    if (inside) {
                        fill = COLORS.inside;
                        opacity = 0.7;
                    }
                }

                tiles.push(
                    <rect
                        key={`${algorithm}-${x}-${y}`}
                        x={startX + x * tileSize + 1}
                        y={y * tileSize + 1}
                        width={tileSize - 2}
                        height={tileSize - 2}
                        fill={fill}
                        opacity={opacity}
                        rx={1}
                    />
                );
            }
        }

        return tiles;
    };

    const totalWidth = gridWidth * 3 + 40;

    return (
        <div className="w-full">
            <svg
                viewBox={`0 0 ${totalWidth} ${height}`}
                className="w-full"
                style={{ height, maxHeight: height }}
            >
                <rect x={0} y={0} width={totalWidth} height={height} fill="white" />

                {/* Naive Algorithm */}
                <g>
                    {renderMiniGrid('naive', 0)}
                    <circle
                        cx={centerX * tileSize + tileSize / 2}
                        cy={centerY * tileSize + tileSize / 2}
                        r={radius * tileSize}
                        fill="none"
                        stroke={COLORS.circleBorder}
                        strokeWidth={1.5}
                        strokeDasharray="4 2"
                    />
                    <text
                        x={gridWidth / 2}
                        y={gridWidth + 20}
                        textAnchor="middle"
                        fontSize={12}
                        fontWeight="600"
                        fill="#374151"
                    >
                        Naive
                    </text>
                    <text
                        x={gridWidth / 2}
                        y={gridWidth + 36}
                        textAnchor="middle"
                        fontSize={10}
                        fill="#6b7280"
                    >
                        {stats[0].tilesChecked} checks ({stats[0].efficiency.toFixed(0)}% efficient)
                    </text>
                </g>

                {/* Bounding Box */}
                <g transform={`translate(${gridWidth + 20}, 0)`}>
                    {renderMiniGrid('bbox', 0)}
                    <circle
                        cx={centerX * tileSize + tileSize / 2}
                        cy={centerY * tileSize + tileSize / 2}
                        r={radius * tileSize}
                        fill="none"
                        stroke={COLORS.circleBorder}
                        strokeWidth={1.5}
                        strokeDasharray="4 2"
                    />
                    <text
                        x={gridWidth / 2}
                        y={gridWidth + 20}
                        textAnchor="middle"
                        fontSize={12}
                        fontWeight="600"
                        fill="#374151"
                    >
                        Bounding Box
                    </text>
                    <text
                        x={gridWidth / 2}
                        y={gridWidth + 36}
                        textAnchor="middle"
                        fontSize={10}
                        fill="#6b7280"
                    >
                        {stats[1].tilesChecked} checks ({stats[1].efficiency.toFixed(0)}% efficient)
                    </text>
                </g>

                {/* Bounding Circle */}
                <g transform={`translate(${(gridWidth + 20) * 2}, 0)`}>
                    {renderMiniGrid('bcircle', 0)}
                    <circle
                        cx={centerX * tileSize + tileSize / 2}
                        cy={centerY * tileSize + tileSize / 2}
                        r={radius * tileSize}
                        fill="none"
                        stroke={COLORS.circleBorder}
                        strokeWidth={1.5}
                        strokeDasharray="4 2"
                    />
                    <text
                        x={gridWidth / 2}
                        y={gridWidth + 20}
                        textAnchor="middle"
                        fontSize={12}
                        fontWeight="600"
                        fill="#374151"
                    >
                        Bounding Circle
                    </text>
                    <text
                        x={gridWidth / 2}
                        y={gridWidth + 36}
                        textAnchor="middle"
                        fontSize={10}
                        fill="#6b7280"
                    >
                        {stats[2].tilesChecked} checks ({stats[2].efficiency.toFixed(0)}% efficient)
                    </text>
                </g>

                {/* Legend */}
                <g transform={`translate(10, ${height - 18})`}>
                    <rect x={0} y={0} width={12} height={12} fill={COLORS.inside} rx={2} />
                    <text x={16} y={10} fontSize={10} fill="#374151">Inside (useful)</text>
                    <rect x={90} y={0} width={12} height={12} fill={COLORS.wasted} rx={2} />
                    <text x={106} y={10} fontSize={10} fill="#374151">Checked but outside (wasted)</text>
                    <rect x={260} y={0} width={12} height={12} fill={COLORS.outside} opacity={0.3} rx={2} />
                    <text x={276} y={10} fontSize={10} fill="#374151">Not checked</text>
                </g>
            </svg>
        </div>
    );
};

export default TradeoffComparisonVisualization;
