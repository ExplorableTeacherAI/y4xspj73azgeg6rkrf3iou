/**
 * ConeSectorVisualization
 *
 * An interactive SVG visualization for exploring cone/sector fill algorithms on a grid.
 * Supports conservative (tile center) and permissive (any corner) modes.
 */

import React, { useMemo, useState, useCallback, useRef } from 'react';
import { useVar, useVariableStore } from '@/stores';

// Consistent color palette
const COLORS = {
    inside: '#7dd3fc',       // Light sky blue - tiles inside circle
    inSector: '#fbbf24',     // Amber - tiles inside sector
    outside: '#f1f5f9',      // Light gray - tiles outside
    circleBorder: '#0ea5e9',
    circleBorderHover: '#0284c7',
    sectorFill: '#fef3c7',   // Light yellow for sector area
    sectorBorder: '#f97316', // Orange for sector lines
    centerDot: '#ef4444',
    gridLine: '#e2e8f0',
};

// Normalize angle to [0, 360)
function normalizeAngle(angle: number): number {
    angle = angle % 360;
    return angle < 0 ? angle + 360 : angle;
}

// Check if an angle is within a sector (handling wraparound)
function isAngleInSector(angle: number, sectorCenter: number, sectorWidth: number): boolean {
    const halfWidth = sectorWidth / 2;
    const minAngle = normalizeAngle(sectorCenter - halfWidth);
    const maxAngle = normalizeAngle(sectorCenter + halfWidth);
    angle = normalizeAngle(angle);

    if (minAngle <= maxAngle) {
        return angle >= minAngle && angle <= maxAngle;
    } else {
        // Sector crosses 0°
        return angle >= minAngle || angle <= maxAngle;
    }
}

export interface ConeSectorVisualizationProps {
    radiusVar?: string;
    defaultRadius?: number;
    angleVar?: string;
    defaultAngle?: number;
    widthVar?: string;
    defaultWidth?: number;
    modeVar?: string;
    defaultMode?: 'conservative' | 'permissive';
    gridSize?: number;
    height?: number;
    minRadius?: number;
    maxRadius?: number;
    radiusStep?: number;
}

export const ConeSectorVisualization = ({
    radiusVar,
    defaultRadius = 5,
    angleVar,
    defaultAngle = 45,
    widthVar,
    defaultWidth = 30,
    modeVar,
    defaultMode = 'conservative',
    gridSize = 15,
    height = 400,
    minRadius = 1,
    maxRadius,
    radiusStep = 0.5,
}: ConeSectorVisualizationProps) => {
    const radius = useVar(radiusVar || '_unused_radius', defaultRadius) as number;
    const angle = useVar(angleVar || '_unused_angle', defaultAngle) as number;
    const sectorWidth = useVar(widthVar || '_unused_width', defaultWidth) as number;
    const mode = useVar(modeVar || '_unused_mode', defaultMode) as string;
    const setVar = useVariableStore(s => s.setVariable);

    const svgRef = useRef<SVGSVGElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    const centerX = Math.floor(gridSize / 2);
    const centerY = Math.floor(gridSize / 2);

    const tileSize = height / (gridSize + 1);
    const padding = tileSize / 2;
    const width = (gridSize + 1) * tileSize;

    const centerSvgX = padding + centerX * tileSize + tileSize / 2;
    const centerSvgY = padding + centerY * tileSize + tileSize / 2;

    const effectiveMaxRadius = maxRadius ?? Math.floor(gridSize / 2) - 0.5;

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

        let newRadius = distance / tileSize;
        newRadius = Math.round(newRadius / radiusStep) * radiusStep;
        return Math.max(minRadius, Math.min(effectiveMaxRadius, newRadius));
    }, [width, height, centerSvgX, centerSvgY, tileSize, radiusStep, minRadius, effectiveMaxRadius, radius]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        const newRadius = getRadiusFromEvent(e);
        if (radiusVar) setVar(radiusVar, newRadius);
    }, [getRadiusFromEvent, radiusVar, setVar]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging) return;
        const newRadius = getRadiusFromEvent(e);
        if (radiusVar) setVar(radiusVar, newRadius);
    }, [isDragging, getRadiusFromEvent, radiusVar, setVar]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

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

    // Calculate which tiles are inside the cone/sector
    const tiles = useMemo(() => {
        const result: Array<{
            x: number;
            y: number;
            distance: number;
            insideCircle: boolean;
            insideSector: boolean;
        }> = [];

        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const insideCircle = distance <= radius;

                let insideSector = false;

                if (insideCircle) {
                    if (mode === 'conservative') {
                        // Check tile center
                        const tileAngle = Math.atan2(-dy, dx) * (180 / Math.PI);
                        insideSector = isAngleInSector(tileAngle, angle, sectorWidth);
                    } else {
                        // Permissive: check all four corners
                        const corners = [
                            [x - 0.5 - centerX, y - 0.5 - centerY],
                            [x + 0.5 - centerX, y - 0.5 - centerY],
                            [x - 0.5 - centerX, y + 0.5 - centerY],
                            [x + 0.5 - centerX, y + 0.5 - centerY],
                        ];
                        for (const [cx, cy] of corners) {
                            const cornerAngle = Math.atan2(-cy, cx) * (180 / Math.PI);
                            if (isAngleInSector(cornerAngle, angle, sectorWidth)) {
                                insideSector = true;
                                break;
                            }
                        }
                    }
                }

                result.push({ x, y, distance, insideCircle, insideSector });
            }
        }

        return result;
    }, [gridSize, centerX, centerY, radius, angle, sectorWidth, mode]);

    // Sector arc path
    const sectorPath = useMemo(() => {
        const startAngle = (angle - sectorWidth / 2) * (Math.PI / 180);
        const endAngle = (angle + sectorWidth / 2) * (Math.PI / 180);
        const r = radius * tileSize;

        const x1 = centerSvgX + r * Math.cos(-startAngle);
        const y1 = centerSvgY + r * Math.sin(-startAngle);
        const x2 = centerSvgX + r * Math.cos(-endAngle);
        const y2 = centerSvgY + r * Math.sin(-endAngle);

        const largeArc = sectorWidth > 180 ? 1 : 0;

        return `M ${centerSvgX} ${centerSvgY} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 0 ${x2} ${y2} Z`;
    }, [centerSvgX, centerSvgY, radius, tileSize, angle, sectorWidth]);

    // Count tiles in sector
    const tilesInSector = tiles.filter(t => t.insideSector).length;

    return (
        <div className="relative">
            <svg
                ref={svgRef}
                viewBox={`0 0 ${width} ${height}`}
                className="w-full"
                style={{ height, maxHeight: height, cursor: isDragging ? 'grabbing' : 'default' }}
            >
                <rect x={0} y={0} width={width} height={height} fill="white" />

                {/* Grid lines */}
                {Array.from({ length: gridSize + 1 }).map((_, i) => (
                    <g key={`grid-${i}`}>
                        <line
                            x1={padding + i * tileSize}
                            y1={padding}
                            x2={padding + i * tileSize}
                            y2={padding + gridSize * tileSize}
                            stroke={COLORS.gridLine}
                            strokeWidth={0.5}
                        />
                        <line
                            x1={padding}
                            y1={padding + i * tileSize}
                            x2={padding + gridSize * tileSize}
                            y2={padding + i * tileSize}
                            stroke={COLORS.gridLine}
                            strokeWidth={0.5}
                        />
                    </g>
                ))}

                {/* Sector fill area (behind tiles) */}
                <path
                    d={sectorPath}
                    fill={COLORS.sectorFill}
                    opacity={0.4}
                />

                {/* Tiles */}
                {tiles.map((tile) => (
                    <rect
                        key={`tile-${tile.x}-${tile.y}`}
                        x={padding + tile.x * tileSize + 1}
                        y={padding + tile.y * tileSize + 1}
                        width={tileSize - 2}
                        height={tileSize - 2}
                        fill={
                            tile.insideSector
                                ? COLORS.inSector
                                : tile.insideCircle
                                ? COLORS.inside
                                : COLORS.outside
                        }
                        opacity={tile.insideCircle ? 0.8 : 0.5}
                        rx={2}
                        className="transition-all duration-200"
                    />
                ))}

                {/* Sector boundary lines */}
                {(() => {
                    const startAngle = (angle - sectorWidth / 2) * (Math.PI / 180);
                    const endAngle = (angle + sectorWidth / 2) * (Math.PI / 180);
                    const r = radius * tileSize;
                    return (
                        <>
                            <line
                                x1={centerSvgX}
                                y1={centerSvgY}
                                x2={centerSvgX + r * Math.cos(-startAngle)}
                                y2={centerSvgY + r * Math.sin(-startAngle)}
                                stroke={COLORS.sectorBorder}
                                strokeWidth={2}
                                strokeDasharray="4 2"
                            />
                            <line
                                x1={centerSvgX}
                                y1={centerSvgY}
                                x2={centerSvgX + r * Math.cos(-endAngle)}
                                y2={centerSvgY + r * Math.sin(-endAngle)}
                                stroke={COLORS.sectorBorder}
                                strokeWidth={2}
                                strokeDasharray="4 2"
                            />
                        </>
                    );
                })()}

                {/* Draggable circle boundary */}
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

                {/* Visible circle outline */}
                <circle
                    cx={centerSvgX}
                    cy={centerSvgY}
                    r={radius * tileSize}
                    fill="none"
                    stroke={isHovering || isDragging ? COLORS.circleBorderHover : COLORS.circleBorder}
                    strokeWidth={isHovering || isDragging ? 2.5 : 1.5}
                    strokeDasharray="6 3"
                    opacity={0.8}
                    style={{ pointerEvents: 'none' }}
                />

                {/* Drag handles */}
                {(isHovering || isDragging) && (
                    <>
                        {[0, 90, 180, 270].map((a) => {
                            const rad = (a * Math.PI) / 180;
                            const hx = centerSvgX + Math.cos(rad) * radius * tileSize;
                            const hy = centerSvgY + Math.sin(rad) * radius * tileSize;
                            return (
                                <circle
                                    key={a}
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

                {/* Center marker */}
                <circle
                    cx={centerSvgX}
                    cy={centerSvgY}
                    r={5}
                    fill={COLORS.centerDot}
                    style={{ pointerEvents: 'none' }}
                />

                {/* Angle direction indicator */}
                <line
                    x1={centerSvgX}
                    y1={centerSvgY}
                    x2={centerSvgX + (radius * 0.6) * tileSize * Math.cos(-angle * Math.PI / 180)}
                    y2={centerSvgY + (radius * 0.6) * tileSize * Math.sin(-angle * Math.PI / 180)}
                    stroke={COLORS.sectorBorder}
                    strokeWidth={3}
                    markerEnd="url(#arrowhead)"
                />
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill={COLORS.sectorBorder} />
                    </marker>
                </defs>

                {/* Labels */}
                <g transform={`translate(${centerSvgX + radius * tileSize * 0.7}, ${centerSvgY - radius * tileSize * 0.7})`} style={{ pointerEvents: 'none' }}>
                    <rect x={-22} y={-10} width={44} height={20} fill="white" rx={4} opacity={0.95} />
                    <text x={0} y={4} textAnchor="middle" fontSize={12} fontWeight="600" fill={COLORS.circleBorder}>
                        r = {radius}
                    </text>
                </g>
            </svg>

            {/* Info badges */}
            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-amber-200">
                <span className="text-sm font-medium text-amber-700">
                    {mode === 'conservative' ? 'Conservative' : 'Permissive'}
                </span>
            </div>
            <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-amber-200">
                <span className="text-sm font-medium text-amber-700">
                    {tilesInSector} tiles in sector
                </span>
            </div>
        </div>
    );
};

export default ConeSectorVisualization;
