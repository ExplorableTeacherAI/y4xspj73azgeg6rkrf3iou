import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout, SplitLayout } from "@/components/layouts";
import {
    EditableH1,
    EditableH2,
    EditableH3,
    EditableParagraph,
    InlineScrubbleNumber,
    InlineTooltip,
    InlineFormula,
    InlineFeedback,
    InlineClozeInput,
    InlineClozeChoice,
    InlineLinkedHighlight,
    InlineSpotColor,
} from "@/components/atoms";
import { FormulaBlock } from "@/components/molecules/formula/FormulaBlock";
import { CircleGridVisualization } from "@/components/visualizations/CircleGridVisualization";

// Initialize variables and their colors from this file's variable definitions
import { useVariableStore, initializeVariableColors } from "@/stores";
import {
    getDefaultValues,
    variableDefinitions,
    getVariableInfo,
    numberPropsFromDefinition,
    clozePropsFromDefinition,
    choicePropsFromDefinition,
} from "./variables";

useVariableStore.getState().initialize(getDefaultValues());
initializeVariableColors(variableDefinitions);

// ============================================================================
// SECTION 1: INTRODUCTION
// ============================================================================
const introBlocks: ReactElement[] = [
    <StackLayout key="layout-intro-title" maxWidth="xl">
        <Block id="intro-title" padding="lg">
            <EditableH1 id="h1-intro-title" blockId="intro-title">
                Circle Fill on a Grid
            </EditableH1>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-intro-hook" maxWidth="xl">
        <Block id="intro-hook" padding="sm">
            <EditableParagraph id="para-intro-hook" blockId="intro-hook">
                Imagine a player standing in a field. They can toss a ball to any tile within a certain distance. Which tiles can they reach? This deceptively simple question leads us into the elegant mathematics of filling circles on discrete grids.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-intro-visualization" ratio="1:1" gap="lg" align="center">
        <Block id="intro-explanation" padding="sm">
            <EditableParagraph id="para-intro-explanation" blockId="intro-explanation">
                A circle with radius{" "}
                <InlineScrubbleNumber
                    id="scrubble-intro-radius"
                    varName="introRadius"
                    {...numberPropsFromDefinition(getVariableInfo("introRadius"))}
                />{" "}
                captures all tiles whose center lies within that distance from the origin. The boundary tiles form a distinctive staircase pattern, an artifact of mapping continuous geometry onto a discrete grid.
            </EditableParagraph>
        </Block>
        <Block id="intro-grid" padding="sm" hasVisualization>
            <CircleGridVisualization
                mode="fill"
                radiusVar="introRadius"
                gridSize={11}
                height={350}
            />
        </Block>
    </SplitLayout>,

    <StackLayout key="layout-intro-question" maxWidth="xl">
        <Block id="intro-question" padding="md">
            <EditableParagraph id="para-intro-question" blockId="intro-question">
                How can we implement this efficiently? We will explore three progressively optimized approaches: a naive distance test, bounding box optimization, and the elegant bounding circle technique using the Pythagorean theorem.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];

// ============================================================================
// SECTION 2: DISTANCE TEST
// ============================================================================
const distanceTestBlocks: ReactElement[] = [
    <StackLayout key="layout-distance-title" maxWidth="xl">
        <Block id="distance-title" padding="lg">
            <EditableH2 id="h2-distance-title" blockId="distance-title">
                1. Distance Test
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-distance-intro" maxWidth="xl">
        <Block id="distance-intro" padding="sm">
            <EditableParagraph id="para-distance-intro" blockId="distance-intro">
                A circle is defined as all points at a given distance from the center. A filled circle includes all points at that distance or less. We can check each tile by computing its{" "}
                <InlineTooltip
                    id="tooltip-euclidean"
                    tooltip="The straight-line distance between two points, calculated using the Pythagorean theorem."
                    color="#0ea5e9"
                >
                    Euclidean distance
                </InlineTooltip>{" "}
                from the center and comparing it against the radius.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-distance-visualization" ratio="1:1" gap="lg" align="center">
        <Block id="distance-grid" padding="sm" hasVisualization>
            <CircleGridVisualization
                mode="distance"
                radiusVar="distanceRadius"
                showDistances={true}
                gridSize={11}
                height={380}
            />
        </Block>
        <Block id="distance-explanation" padding="sm">
            <EditableParagraph id="para-distance-explanation" blockId="distance-explanation">
                Each tile displays its distance from the center. With radius{" "}
                <InlineScrubbleNumber
                    id="scrubble-distance-radius"
                    varName="distanceRadius"
                    {...numberPropsFromDefinition(getVariableInfo("distanceRadius"))}
                />
                , every tile with distance ≤{" "}
                <InlineScrubbleNumber
                    id="scrubble-distance-radius-display"
                    varName="distanceRadius"
                    readonly
                    {...numberPropsFromDefinition(getVariableInfo("distanceRadius"))}
                />{" "}
                is colored blue. Notice how tiles near the boundary have distances very close to the radius value.
            </EditableParagraph>
        </Block>
    </SplitLayout>,

    <StackLayout key="layout-distance-formula" maxWidth="xl">
        <Block id="distance-formula" padding="md">
            <FormulaBlock
                latex="\text{distance} = \sqrt{dx^2 + dy^2}"
                colorMap={{ dx: "#22c55e", dy: "#f97316" }}
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-distance-code-explanation" maxWidth="xl">
        <Block id="distance-code-explanation" padding="sm">
            <EditableParagraph id="para-distance-code-explanation" blockId="distance-code-explanation">
                The algorithm iterates over every tile in the grid and applies this distance test. If{" "}
                <InlineFormula latex="\sqrt{dx^2 + dy^2} \leq r" />, the tile is inside the circle. This approach is simple and works for any grid size, but it checks every tile regardless of whether it could possibly be inside the circle.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-distance-optimization" maxWidth="xl">
        <Block id="distance-optimization" padding="sm">
            <EditableH3 id="h3-distance-optimization" blockId="distance-optimization">
                Avoiding the Square Root
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-distance-sqrt-explanation" maxWidth="xl">
        <Block id="distance-sqrt-explanation" padding="sm">
            <EditableParagraph id="para-distance-sqrt-explanation" blockId="distance-sqrt-explanation">
                Computing square roots is expensive. Fortunately, we can avoid it entirely. The condition{" "}
                <InlineFormula latex="\text{distance} \leq r" /> is true exactly when{" "}
                <InlineFormula latex="\text{distance}^2 \leq r^2" /> is true, since both values are non-negative. This lets us compare{" "}
                <InlineFormula latex="dx^2 + dy^2" /> directly against{" "}
                <InlineFormula latex="r^2" />.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-distance-formula-optimized" maxWidth="xl">
        <Block id="distance-formula-optimized" padding="md">
            <FormulaBlock
                latex="\text{distance\_squared} = dx^2 + dy^2 \leq r^2"
                colorMap={{ dx: "#22c55e", dy: "#f97316", r: "#0ea5e9" }}
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-distance-assessment" maxWidth="xl">
        <Block id="distance-assessment" padding="md">
            <EditableParagraph id="para-distance-assessment" blockId="distance-assessment">
                In a 4-way grid, an interior cell has exactly{" "}
                <InlineFeedback
                    varName="answer_neighbors"
                    correctValue="4"
                    successMessage="Correct!"
                    failureMessage="Not quite"
                    hint="Count the directions: up, down, left, right"
                >
                    <InlineClozeInput
                        varName="answer_neighbors"
                        correctAnswer="4"
                        {...clozePropsFromDefinition(getVariableInfo("answer_neighbors"))}
                    />
                </InlineFeedback>{" "}
                neighbors.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];

// ============================================================================
// SECTION 3: BOUNDING BOX
// ============================================================================
const boundingBoxBlocks: ReactElement[] = [
    <StackLayout key="layout-bbox-title" maxWidth="xl">
        <Block id="bbox-title" padding="lg">
            <EditableH2 id="h2-bbox-title" blockId="bbox-title">
                2. Bounding Box Optimization
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-bbox-intro" maxWidth="xl">
        <Block id="bbox-intro" padding="sm">
            <EditableParagraph id="para-bbox-intro" blockId="bbox-intro">
                The naive approach checks every tile in the grid. But a circle with radius 3 in a 100×100 grid will only touch about 37 tiles. We waste time checking the other 9,963. The solution? Check only the tiles that could possibly be inside the circle.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-bbox-visualization" ratio="1:1" gap="lg" align="center">
        <Block id="bbox-explanation" padding="sm">
            <EditableParagraph id="para-bbox-explanation" blockId="bbox-explanation">
                The{" "}
                <InlineLinkedHighlight
                    varName="highlightElement"
                    highlightId="boundingBox"
                    color="#0ea5e9"
                >
                    bounding box
                </InlineLinkedHighlight>{" "}
                is the smallest rectangle that completely contains the circle. With radius{" "}
                <InlineScrubbleNumber
                    id="scrubble-bbox-radius"
                    varName="boundingBoxRadius"
                    {...numberPropsFromDefinition(getVariableInfo("boundingBoxRadius"))}
                />
                , we only check tiles from{" "}
                <InlineSpotColor varName="boundingBoxRadius" color="#0ea5e9">
                    left
                </InlineSpotColor>{" "}
                to{" "}
                <InlineSpotColor varName="boundingBoxRadius" color="#0ea5e9">
                    right
                </InlineSpotColor>{" "}
                and{" "}
                <InlineSpotColor varName="boundingBoxRadius" color="#0ea5e9">
                    top
                </InlineSpotColor>{" "}
                to{" "}
                <InlineSpotColor varName="boundingBoxRadius" color="#0ea5e9">
                    bottom
                </InlineSpotColor>
                .
            </EditableParagraph>
        </Block>
        <Block id="bbox-grid" padding="sm" hasVisualization>
            <CircleGridVisualization
                mode="boundingBox"
                radiusVar="boundingBoxRadius"
                showBoundingBox={true}
                showDistances={true}
                gridSize={11}
                height={380}
            />
        </Block>
    </SplitLayout>,

    <StackLayout key="layout-bbox-formula" maxWidth="xl">
        <Block id="bbox-formula" padding="md">
            <FormulaBlock
                latex="\begin{aligned}
\text{top} &= \lceil \text{center}_y - r \rceil \\
\text{bottom} &= \lfloor \text{center}_y + r \rfloor \\
\text{left} &= \lceil \text{center}_x - r \rceil \\
\text{right} &= \lfloor \text{center}_x + r \rfloor
\end{aligned}"
                colorMap={{ r: "#0ea5e9" }}
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-bbox-code-explanation" maxWidth="xl">
        <Block id="bbox-code-explanation" padding="sm">
            <EditableParagraph id="para-bbox-code-explanation" blockId="bbox-code-explanation">
                We use ceiling and floor functions to snap to tile boundaries. The ceiling function rounds up (for left and top edges), while floor rounds down (for right and bottom edges). Now we iterate only over this smaller region, applying the distance test to each tile. This is a significant optimization with minimal code change.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-bbox-assessment" maxWidth="xl">
        <Block id="bbox-assessment" padding="md">
            <EditableParagraph id="para-bbox-assessment" blockId="bbox-assessment">
                A circle with radius 3.5 centered on a tile has a bounding box of 7×7 ={" "}
                <InlineFeedback
                    varName="answer_bounding_box_tiles"
                    correctValue="49"
                    successMessage="Correct! The box spans from -3 to +3 in each direction"
                    failureMessage="Think about the ceiling and floor"
                    hint="The box goes from ceil(-3.5) to floor(3.5), which is -3 to 3"
                >
                    <InlineClozeInput
                        varName="answer_bounding_box_tiles"
                        correctAnswer="49"
                        {...clozePropsFromDefinition(getVariableInfo("answer_bounding_box_tiles"))}
                    />
                </InlineFeedback>{" "}
                tiles to check.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];

// ============================================================================
// SECTION 4: BOUNDING CIRCLE
// ============================================================================
const boundingCircleBlocks: ReactElement[] = [
    <StackLayout key="layout-bcircle-title" maxWidth="xl">
        <Block id="bcircle-title" padding="lg">
            <EditableH2 id="h2-bcircle-title" blockId="bcircle-title">
                3. Bounding Circle with Pythagorean Theorem
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-bcircle-intro" maxWidth="xl">
        <Block id="bcircle-intro" padding="sm">
            <EditableParagraph id="para-bcircle-intro" blockId="bcircle-intro">
                The bounding box still checks tiles in the corners that cannot possibly be inside the circle. We can do better by calculating the exact left and right boundaries for each row using the Pythagorean theorem.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-bcircle-visualization" ratio="1:1" gap="lg" align="center">
        <Block id="bcircle-grid" padding="sm" hasVisualization>
            <CircleGridVisualization
                mode="boundingCircle"
                radiusVar="boundingCircleRadius"
                selectedRowVar="selectedRow"
                gridSize={15}
                height={400}
            />
        </Block>
        <Block id="bcircle-explanation" padding="sm">
            <EditableParagraph id="para-bcircle-explanation" blockId="bcircle-explanation">
                For each row at vertical offset{" "}
                <InlineSpotColor varName="selectedRow" color="#f97316">
                    dy
                </InlineSpotColor>{" "}
                ={" "}
                <InlineScrubbleNumber
                    id="scrubble-selected-row"
                    varName="selectedRow"
                    {...numberPropsFromDefinition(getVariableInfo("selectedRow"))}
                />
                {" "}from the center, we form a right triangle. The radius{" "}
                <InlineScrubbleNumber
                    id="scrubble-bcircle-radius"
                    varName="boundingCircleRadius"
                    {...numberPropsFromDefinition(getVariableInfo("boundingCircleRadius"))}
                />{" "}
                is the hypotenuse. The vertical distance{" "}
                <InlineSpotColor varName="selectedRow" color="#f97316">
                    dy
                </InlineSpotColor>{" "}
                is one leg. The horizontal half-width{" "}
                <InlineSpotColor varName="boundingCircleRadius" color="#22c55e">
                    dx
                </InlineSpotColor>{" "}
                is the other leg.
            </EditableParagraph>
        </Block>
    </SplitLayout>,

    <StackLayout key="layout-bcircle-formula" maxWidth="xl">
        <Block id="bcircle-formula" padding="md">
            <FormulaBlock
                latex="dx = \sqrt{r^2 - dy^2}"
                colorMap={{ dx: "#22c55e", dy: "#f97316", r: "#0ea5e9" }}
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-bcircle-derivation" maxWidth="xl">
        <Block id="bcircle-derivation" padding="sm">
            <EditableParagraph id="para-bcircle-derivation" blockId="bcircle-derivation">
                This elegant formula directly gives us the horizontal extent of the circle at each row. The left tile is at{" "}
                <InlineFormula latex="\lceil \text{center}_x - dx \rceil" /> and the right tile is at{" "}
                <InlineFormula latex="\lfloor \text{center}_x + dx \rfloor" />. We fill all tiles in between without any distance check, because every tile in this range is guaranteed to be inside the circle.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-bcircle-advantage" maxWidth="xl">
        <Block id="bcircle-advantage" padding="sm">
            <EditableParagraph id="para-bcircle-advantage" blockId="bcircle-advantage">
                The bounding circle approach eliminates the per-tile distance test entirely. Each row requires only one square root operation to compute dx. For large circles, this is significantly faster than checking every tile in the bounding box. However, the code is slightly more complex, so for small circles the bounding box approach may be preferable.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];

// ============================================================================
// SECTION 5: CIRCLE OUTLINES
// ============================================================================
const outlineBlocks: ReactElement[] = [
    <StackLayout key="layout-outline-title" maxWidth="xl">
        <Block id="outline-title" padding="lg">
            <EditableH2 id="h2-outline-title" blockId="outline-title">
                4. Circle Outlines
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-outline-intro" maxWidth="xl">
        <Block id="outline-intro" padding="sm">
            <EditableParagraph id="para-outline-intro" blockId="outline-intro">
                Sometimes we want to draw only the outline of a circle, not fill it. A naive approach draws the left and right boundary tiles for each row, but this leaves gaps at the top and bottom where the circle is nearly horizontal.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-outline-visualization" ratio="1:1" gap="lg" align="center">
        <Block id="outline-explanation" padding="sm">
            <EditableParagraph id="para-outline-explanation" blockId="outline-explanation">
                The solution uses 8-fold symmetry. For each value of r from 0 to{" "}
                <InlineFormula latex="r \cdot \sqrt{0.5}" />, we calculate d using the Pythagorean theorem. Then we draw 8 tiles at once: one in each octant of the circle. With radius{" "}
                <InlineScrubbleNumber
                    id="scrubble-outline-radius"
                    varName="outlineRadius"
                    {...numberPropsFromDefinition(getVariableInfo("outlineRadius"))}
                />
                , each iteration places 8 tiles simultaneously.
            </EditableParagraph>
        </Block>
        <Block id="outline-grid" padding="sm" hasVisualization>
            <CircleGridVisualization
                mode="outline"
                radiusVar="outlineRadius"
                showSymmetry={true}
                gridSize={15}
                height={400}
            />
        </Block>
    </SplitLayout>,

    <StackLayout key="layout-outline-symmetry-explanation" maxWidth="xl">
        <Block id="outline-symmetry-explanation" padding="sm">
            <EditableParagraph id="para-outline-symmetry-explanation" blockId="outline-symmetry-explanation">
                The 8 colors represent the 8 symmetric positions. For each step r, we compute d and place tiles at: (center ± d, center ± r) and (center ± r, center ± d). This exploits the circle's rotational and reflective symmetry. Some tiles may be drawn more than once at the boundaries (when r = 0 or r = d), but for most applications this is acceptable.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-outline-assessment" maxWidth="xl">
        <Block id="outline-assessment" padding="md">
            <EditableParagraph id="para-outline-assessment" blockId="outline-assessment">
                The 8-fold symmetry algorithm draws{" "}
                <InlineFeedback
                    varName="answer_outline_tiles"
                    correctValue="8"
                    successMessage="Exactly! One tile in each octant"
                    failureMessage="Think about the symmetry"
                    hint="The circle has 8 symmetric octants"
                >
                    <InlineClozeInput
                        varName="answer_outline_tiles"
                        correctAnswer="8"
                        {...clozePropsFromDefinition(getVariableInfo("answer_outline_tiles"))}
                    />
                </InlineFeedback>{" "}
                tiles per iteration.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];

// ============================================================================
// SECTION 6: AESTHETICS
// ============================================================================
const aestheticsBlocks: ReactElement[] = [
    <StackLayout key="layout-aesthetics-title" maxWidth="xl">
        <Block id="aesthetics-title" padding="lg">
            <EditableH2 id="h2-aesthetics-title" blockId="aesthetics-title">
                5. Aesthetics and Practical Tips
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-aesthetics-intro" maxWidth="xl">
        <Block id="aesthetics-intro" padding="sm">
            <EditableParagraph id="para-aesthetics-intro" blockId="aesthetics-intro">
                Not all radii produce equally pleasing circles. A curious observation: circles look noticeably better when the radius is a half-integer (1.5, 2.5, 3.5) rather than a whole number (1.0, 2.0, 3.0).
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-aesthetics-comparison" ratio="1:1" gap="lg" align="center">
        <Block id="aesthetics-grid-a" padding="sm" hasVisualization>
            <div className="text-center mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                    Radius = <InlineScrubbleNumber
                        id="scrubble-aesthetics-a"
                        varName="aestheticRadiusA"
                        {...numberPropsFromDefinition(getVariableInfo("aestheticRadiusA"))}
                    />
                </span>
            </div>
            <CircleGridVisualization
                mode="fill"
                radiusVar="aestheticRadiusA"
                gridSize={11}
                height={280}
            />
        </Block>
        <Block id="aesthetics-grid-b" padding="sm" hasVisualization>
            <div className="text-center mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                    Radius = <InlineScrubbleNumber
                        id="scrubble-aesthetics-b"
                        varName="aestheticRadiusB"
                        {...numberPropsFromDefinition(getVariableInfo("aestheticRadiusB"))}
                    />
                </span>
            </div>
            <CircleGridVisualization
                mode="fill"
                radiusVar="aestheticRadiusB"
                gridSize={11}
                height={280}
            />
        </Block>
    </SplitLayout>,

    <StackLayout key="layout-aesthetics-explanation" maxWidth="xl">
        <Block id="aesthetics-explanation" padding="sm">
            <EditableParagraph id="para-aesthetics-explanation" blockId="aesthetics-explanation">
                When the radius is a half-integer, the circle boundary falls exactly between tiles, creating cleaner edges. With whole-number radii, the boundary passes through tile centers, leading to more ambiguous inclusion decisions. For best results, the sides of the circle should align with tile boundaries rather than passing through tile centers.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-aesthetics-vertex-centering" maxWidth="xl">
        <Block id="aesthetics-vertex-centering" padding="sm">
            <EditableH3 id="h3-aesthetics-vertex-centering" blockId="aesthetics-vertex-centering">
                Vertex vs. Tile Centering
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-aesthetics-vertex-explanation" maxWidth="xl">
        <Block id="aesthetics-vertex-explanation" padding="sm">
            <EditableParagraph id="para-aesthetics-vertex-explanation" blockId="aesthetics-vertex-explanation">
                An alternative approach centers the circle on a vertex (grid intersection) rather than a tile center. This works well with whole-number radii and can produce symmetric results. The choice depends on your application: tile-centered circles are more intuitive for game mechanics, while vertex-centered circles may look better visually.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-movable-center-title" maxWidth="xl">
        <Block id="movable-center-title" padding="sm">
            <EditableH3 id="h3-movable-center-title" blockId="movable-center-title">
                Non-Integer Centers
            </EditableH3>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-movable-center" ratio="1:1" gap="lg" align="center">
        <Block id="movable-center-explanation" padding="sm">
            <EditableParagraph id="para-movable-center-explanation" blockId="movable-center-explanation">
                The circle fill algorithm also works when the center is not on a tile. With center at ({" "}
                <InlineScrubbleNumber
                    id="scrubble-center-x"
                    varName="centerX"
                    {...numberPropsFromDefinition(getVariableInfo("centerX"))}
                />
                ,{" "}
                <InlineScrubbleNumber
                    id="scrubble-center-y"
                    varName="centerY"
                    {...numberPropsFromDefinition(getVariableInfo("centerY"))}
                />
                ) and radius 3.5, the algorithm correctly identifies which tiles are inside. However, circles with non-integer centers tend to look less symmetric.
            </EditableParagraph>
        </Block>
        <Block id="movable-center-grid" padding="sm" hasVisualization>
            <CircleGridVisualization
                mode="movableCenter"
                radiusVar="introRadius"
                centerXVar="centerX"
                centerYVar="centerY"
                gridSize={17}
                height={340}
            />
        </Block>
    </SplitLayout>,
];

// ============================================================================
// SECTION 7: SUMMARY
// ============================================================================
const summaryBlocks: ReactElement[] = [
    <StackLayout key="layout-summary-title" maxWidth="xl">
        <Block id="summary-title" padding="lg">
            <EditableH2 id="h2-summary-title" blockId="summary-title">
                Summary
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-summary-content" maxWidth="xl">
        <Block id="summary-content" padding="sm">
            <EditableParagraph id="para-summary-content" blockId="summary-content">
                We explored three approaches to filling circles on a grid, each building on the last. The distance test provides a simple baseline. The bounding box dramatically reduces the search space with minimal code changes. The bounding circle eliminates per-tile distance checks entirely using the Pythagorean theorem. For outlines, 8-fold symmetry lets us draw complete circles efficiently. Choose the approach that best balances code complexity against performance needs for your specific use case.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-summary-assessment" maxWidth="xl">
        <Block id="summary-assessment" padding="md">
            <EditableParagraph id="para-summary-assessment" blockId="summary-assessment">
                Why can we replace the distance comparison with a squared comparison?{" "}
                <InlineFeedback
                    varName="answer_sqrt_optimization"
                    correctValue="All of the above"
                    successMessage="Exactly right! All three reasons make this optimization valid and worthwhile"
                    failureMessage="Think about all the factors"
                    hint="Consider both mathematical validity and computational benefits"
                >
                    <InlineClozeChoice
                        varName="answer_sqrt_optimization"
                        correctAnswer="All of the above"
                        options={["Both values are always positive", "sqrt is expensive to compute", "It gives the same comparison result", "All of the above"]}
                        {...choicePropsFromDefinition(getVariableInfo("answer_sqrt_optimization"))}
                    />
                </InlineFeedback>
            </EditableParagraph>
        </Block>
    </StackLayout>,
];

// ============================================================================
// EXPORT ALL BLOCKS
// ============================================================================
export const blocks: ReactElement[] = [
    ...introBlocks,
    ...distanceTestBlocks,
    ...boundingBoxBlocks,
    ...boundingCircleBlocks,
    ...outlineBlocks,
    ...aestheticsBlocks,
    ...summaryBlocks,
];
