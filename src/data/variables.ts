/**
 * Variables Configuration
 * =======================
 * 
 * CENTRAL PLACE TO DEFINE ALL SHARED VARIABLES
 * 
 * This file defines all variables that can be shared across sections.
 * AI agents should read this file to understand what variables are available.
 * 
 * USAGE:
 * 1. Define variables here with their default values and metadata
 * 2. Use them in any section with: const x = useVar('variableName', defaultValue)
 * 3. Update them with: setVar('variableName', newValue)
 */

import { type VarValue } from '@/stores';

/**
 * Variable definition with metadata
 */
export interface VariableDefinition {
    /** Default value */
    defaultValue: VarValue;
    /** Human-readable label */
    label?: string;
    /** Description for AI agents */
    description?: string;
    /** Variable type hint */
    type?: 'number' | 'text' | 'boolean' | 'select' | 'array' | 'object' | 'spotColor' | 'linkedHighlight';
    /** Unit (e.g., 'Hz', '°', 'm/s') - for numbers */
    unit?: string;
    /** Minimum value (for number sliders) */
    min?: number;
    /** Maximum value (for number sliders) */
    max?: number;
    /** Step increment (for number sliders) */
    step?: number;
    /** Display color for InlineScrubbleNumber / InlineSpotColor (e.g. '#D81B60') */
    color?: string;
    /** Options for 'select' type variables */
    options?: string[];
    /** Placeholder text for text inputs */
    placeholder?: string;
    /** Correct answer for cloze input validation */
    correctAnswer?: string;
    /** Whether cloze matching is case sensitive */
    caseSensitive?: boolean;
    /** Background color for inline components */
    bgColor?: string;
    /** Schema hint for object types (for AI agents) */
    schema?: string;
}

/**
 * =====================================================
 * 🎯 DEFINE YOUR VARIABLES HERE
 * =====================================================
 * 
 * SUPPORTED TYPES:
 * 
 * 1. NUMBER (slider):
 *    { defaultValue: 5, type: 'number', min: 0, max: 10, step: 1 }
 * 
 * 2. TEXT (free text):
 *    { defaultValue: 'Hello', type: 'text', placeholder: 'Enter text...' }
 * 
 * 3. SELECT (dropdown):
 *    { defaultValue: 'sine', type: 'select', options: ['sine', 'cosine', 'tangent'] }
 * 
 * 4. BOOLEAN (toggle):
 *    { defaultValue: true, type: 'boolean' }
 * 
 * 5. ARRAY (list of numbers):
 *    { defaultValue: [1, 2, 3], type: 'array' }
 * 
 * 6. OBJECT (complex data):
 *    { defaultValue: { x: 5, y: 10 }, type: 'object', schema: '{ x: number, y: number }' }
 */
export const variableDefinitions: Record<string, VariableDefinition> = {
    // ========================================
    // CIRCLE FILL ON A GRID - LESSON VARIABLES
    // ========================================

    // ─────────────────────────────────────────
    // SECTION 1: Introduction
    // ─────────────────────────────────────────
    introRadius: {
        defaultValue: 3.5,
        type: 'number',
        label: 'Circle Radius',
        description: 'Radius of the circle for the intro visualization',
        min: 0.5,
        max: 6,
        step: 0.5,
        color: '#0ea5e9',
    },

    // ─────────────────────────────────────────
    // SECTION 2: Distance Test
    // ─────────────────────────────────────────
    distanceRadius: {
        defaultValue: 3.5,
        type: 'number',
        label: 'Circle Radius',
        description: 'Radius for distance test visualization',
        min: 1,
        max: 6,
        step: 0.5,
        color: '#0ea5e9',
    },
    showDistances: {
        defaultValue: true,
        type: 'boolean',
        label: 'Show Distances',
        description: 'Toggle to show distance values on tiles',
    },
    highlightElement: {
        defaultValue: '',
        type: 'linkedHighlight',
        label: 'Highlight Element',
        description: 'Currently highlighted element in the grid',
        color: '#f97316',
    },

    // ─────────────────────────────────────────
    // SECTION 3: Bounding Box
    // ─────────────────────────────────────────
    boundingBoxRadius: {
        defaultValue: 3.5,
        type: 'number',
        label: 'Bounding Box Radius',
        description: 'Radius for bounding box visualization',
        min: 1,
        max: 5,
        step: 0.5,
        color: '#0ea5e9',
    },
    showBoundingBox: {
        defaultValue: true,
        type: 'boolean',
        label: 'Show Bounding Box',
        description: 'Toggle to show the bounding box',
    },

    // ─────────────────────────────────────────
    // SECTION 4: Bounding Circle
    // ─────────────────────────────────────────
    boundingCircleRadius: {
        defaultValue: 6.5,
        type: 'number',
        label: 'Bounding Circle Radius',
        description: 'Radius for bounding circle visualization',
        min: 2,
        max: 8,
        step: 0.5,
        color: '#0ea5e9',
    },
    selectedRow: {
        defaultValue: 4,
        type: 'number',
        label: 'Selected Row',
        description: 'Row offset from center for Pythagorean triangle',
        min: 0,
        max: 6,
        step: 1,
        color: '#f97316',
    },

    // ─────────────────────────────────────────
    // SECTION 5: Circle Outlines
    // ─────────────────────────────────────────
    outlineRadius: {
        defaultValue: 6.5,
        type: 'number',
        label: 'Outline Radius',
        description: 'Radius for circle outline visualization',
        min: 2,
        max: 8,
        step: 0.5,
        color: '#0ea5e9',
    },
    outlineStep: {
        defaultValue: 3,
        type: 'number',
        label: 'Outline Step',
        description: 'Current step in the outline algorithm',
        min: 0,
        max: 5,
        step: 1,
        color: '#8b5cf6',
    },
    showSymmetry: {
        defaultValue: false,
        type: 'boolean',
        label: 'Show Symmetry',
        description: 'Toggle to show 8-fold symmetry',
    },

    // ─────────────────────────────────────────
    // SECTION 6: Aesthetics
    // ─────────────────────────────────────────
    aestheticRadiusA: {
        defaultValue: 4.0,
        type: 'number',
        label: 'Radius A',
        description: 'First radius for comparison (integer)',
        min: 1,
        max: 6,
        step: 1,
        color: '#ef4444',
    },
    aestheticRadiusB: {
        defaultValue: 4.5,
        type: 'number',
        label: 'Radius B',
        description: 'Second radius for comparison (half-integer)',
        min: 1.5,
        max: 6.5,
        step: 1,
        color: '#22c55e',
    },
    centerOnVertex: {
        defaultValue: false,
        type: 'boolean',
        label: 'Center on Vertex',
        description: 'Toggle to center circle on vertex instead of tile',
    },
    centerX: {
        defaultValue: 8,
        type: 'number',
        label: 'Center X',
        description: 'X coordinate of the circle center',
        min: 5,
        max: 12,
        step: 0.1,
        color: '#3b82f6',
    },
    centerY: {
        defaultValue: 4,
        type: 'number',
        label: 'Center Y',
        description: 'Y coordinate of the circle center',
        min: 2,
        max: 7,
        step: 0.1,
        color: '#8b5cf6',
    },

    // ─────────────────────────────────────────
    // ASSESSMENT QUESTIONS
    // ─────────────────────────────────────────
    answer_neighbors: {
        defaultValue: '',
        type: 'text',
        label: 'Number of Neighbors',
        description: 'Answer for grid neighbor count question',
        correctAnswer: '4',
        placeholder: '?',
        color: '#3B82F6',
    },
    answer_distance_formula: {
        defaultValue: '',
        type: 'text',
        label: 'Distance Formula',
        description: 'Answer for distance squared formula',
        correctAnswer: 'dx*dx + dy*dy',
        placeholder: '???',
        color: '#3B82F6',
        caseSensitive: false,
    },
    answer_bounding_box_tiles: {
        defaultValue: '',
        type: 'text',
        label: 'Bounding Box Tiles',
        description: 'Answer for bounding box tile count',
        correctAnswer: '49',
        placeholder: '?',
        color: '#3B82F6',
    },
    answer_sqrt_optimization: {
        defaultValue: '',
        type: 'select',
        label: 'Square Root Optimization',
        description: 'Why we can avoid sqrt',
        options: ['Both values are always positive', 'sqrt is expensive to compute', 'It gives the same comparison result', 'All of the above'],
        correctAnswer: 'All of the above',
        color: '#8b5cf6',
    },
    answer_outline_tiles: {
        defaultValue: '',
        type: 'text',
        label: 'Outline Tiles',
        description: 'How many tiles drawn per iteration',
        correctAnswer: '8',
        placeholder: '?',
        color: '#3B82F6',
    },

    // ─────────────────────────────────────────
    // SECTION 7: Cones / Sectors
    // ─────────────────────────────────────────
    coneAngle: {
        defaultValue: 45,
        type: 'number',
        label: 'Cone Angle',
        description: 'Direction angle of the cone in degrees',
        min: 0,
        max: 360,
        step: 15,
        unit: '°',
        color: '#f97316',
    },
    coneWidth: {
        defaultValue: 30,
        type: 'number',
        label: 'Cone Width',
        description: 'Angular width of the cone in degrees',
        min: 10,
        max: 180,
        step: 10,
        unit: '°',
        color: '#8b5cf6',
    },
    coneRadius: {
        defaultValue: 5,
        type: 'number',
        label: 'Cone Radius',
        description: 'Radius of the cone/sector',
        min: 2,
        max: 7,
        step: 0.5,
        color: '#0ea5e9',
    },
    coneMode: {
        defaultValue: 'conservative',
        type: 'select',
        label: 'Cone Mode',
        description: 'Conservative checks tile center, permissive checks all corners',
        options: ['conservative', 'permissive'],
        color: '#22c55e',
    },

    // ─────────────────────────────────────────
    // SECTION 8: Tradeoff Comparison
    // ─────────────────────────────────────────
    comparisonRadius: {
        defaultValue: 4,
        type: 'number',
        label: 'Comparison Radius',
        description: 'Radius for tradeoff comparison visualization',
        min: 2,
        max: 8,
        step: 1,
        color: '#0ea5e9',
    },
};

/**
 * Get all variable names (for AI agents to discover)
 */
export const getVariableNames = (): string[] => {
    return Object.keys(variableDefinitions);
};

/**
 * Get a variable's default value
 */
export const getDefaultValue = (name: string): VarValue => {
    return variableDefinitions[name]?.defaultValue ?? 0;
};

/**
 * Get a variable's metadata
 */
export const getVariableInfo = (name: string): VariableDefinition | undefined => {
    return variableDefinitions[name];
};

/**
 * Get all default values as a record (for initialization)
 */
export const getDefaultValues = (): Record<string, VarValue> => {
    const defaults: Record<string, VarValue> = {};
    for (const [name, def] of Object.entries(variableDefinitions)) {
        defaults[name] = def.defaultValue;
    }
    return defaults;
};

/**
 * Get number props for InlineScrubbleNumber from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx, or getExampleVariableInfo(name) in exampleBlocks.tsx.
 */
export function numberPropsFromDefinition(def: VariableDefinition | undefined): {
    defaultValue?: number;
    min?: number;
    max?: number;
    step?: number;
    color?: string;
} {
    if (!def || def.type !== 'number') return {};
    return {
        defaultValue: def.defaultValue as number,
        min: def.min,
        max: def.max,
        step: def.step,
        ...(def.color ? { color: def.color } : {}),
    };
}

/**
 * Get cloze input props for InlineClozeInput from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx, or getExampleVariableInfo(name) in exampleBlocks.tsx.
 */
/**
 * Get cloze choice props for InlineClozeChoice from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx.
 */
export function choicePropsFromDefinition(def: VariableDefinition | undefined): {
    placeholder?: string;
    color?: string;
    bgColor?: string;
} {
    if (!def || def.type !== 'select') return {};
    return {
        ...(def.placeholder ? { placeholder: def.placeholder } : {}),
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

/**
 * Get toggle props for InlineToggle from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx.
 */
export function togglePropsFromDefinition(def: VariableDefinition | undefined): {
    color?: string;
    bgColor?: string;
} {
    if (!def || def.type !== 'select') return {};
    return {
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

export function clozePropsFromDefinition(def: VariableDefinition | undefined): {
    placeholder?: string;
    color?: string;
    bgColor?: string;
    caseSensitive?: boolean;
} {
    if (!def || def.type !== 'text') return {};
    return {
        ...(def.placeholder ? { placeholder: def.placeholder } : {}),
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
        ...(def.caseSensitive !== undefined ? { caseSensitive: def.caseSensitive } : {}),
    };
}

/**
 * Get spot-color props for InlineSpotColor from a variable definition.
 * Extracts the `color` field.
 *
 * @example
 * <InlineSpotColor
 *     varName="radius"
 *     {...spotColorPropsFromDefinition(getVariableInfo('radius'))}
 * >
 *     radius
 * </InlineSpotColor>
 */
export function spotColorPropsFromDefinition(def: VariableDefinition | undefined): {
    color: string;
} {
    return {
        color: def?.color ?? '#8B5CF6',
    };
}

/**
 * Get linked-highlight props for InlineLinkedHighlight from a variable definition.
 * Extracts the `color` and `bgColor` fields.
 *
 * @example
 * <InlineLinkedHighlight
 *     varName="activeHighlight"
 *     highlightId="radius"
 *     {...linkedHighlightPropsFromDefinition(getVariableInfo('activeHighlight'))}
 * >
 *     radius
 * </InlineLinkedHighlight>
 */
export function linkedHighlightPropsFromDefinition(def: VariableDefinition | undefined): {
    color?: string;
    bgColor?: string;
} {
    return {
        ...(def?.color ? { color: def.color } : {}),
        ...(def?.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

/**
 * Build the `variables` prop for FormulaBlock from variable definitions.
 *
 * Takes an array of variable names and returns the config map expected by
 * `<FormulaBlock variables={...} />`.
 *
 * @example
 * import { scrubVarsFromDefinitions } from './variables';
 *
 * <FormulaBlock
 *     latex="\scrub{mass} \times \scrub{accel}"
 *     variables={scrubVarsFromDefinitions(['mass', 'accel'])}
 * />
 */
export function scrubVarsFromDefinitions(
    varNames: string[],
): Record<string, { min?: number; max?: number; step?: number; color?: string }> {
    const result: Record<string, { min?: number; max?: number; step?: number; color?: string }> = {};
    for (const name of varNames) {
        const def = variableDefinitions[name];
        if (!def) continue;
        result[name] = {
            ...(def.min !== undefined ? { min: def.min } : {}),
            ...(def.max !== undefined ? { max: def.max } : {}),
            ...(def.step !== undefined ? { step: def.step } : {}),
            ...(def.color ? { color: def.color } : {}),
        };
    }
    return result;
}
