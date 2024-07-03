const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

const rendererElement = document.getElementById('render-canvas');
rendererElement.replaceWith(renderer.domElement);

const mapSelector = document.getElementById('map-selector');

const checkRadii = document.getElementById('check-radii');
const checkCenters = document.getElementById('check-centers');
const checkFaces = document.getElementById('check-faces');
const checkEdges = document.getElementById('check-edges');
const checkBasisVertices = document.getElementById('check-basis-vertices');
const checkPortalVertices = document.getElementById('check-portal-vertices');
const checkBBox = document.getElementById('check-bbox');
const checkNumbers = document.getElementById('check-numbers');
const checkKDTree = document.getElementById('check-kdtree');
const checkAiGrid = document.getElementById('check-aigrid');
const checkAiGridShowAll = document.getElementById('check-aigrid-show-all');
const useOrderedEdgeColors = document.getElementById('check-use-ordered-edge-colors');
const highlightArea = document.getElementById('highlight-area');
const kdTreeDepth = document.getElementById('kd-tree-depth');
const airgEditor = document.getElementById('airg-editor');
const airgFileInput = document.getElementById('airg-file-input');
const airgSave = document.getElementById('airg-save');

const airgVminX = document.getElementById('airg-vmin-x');
const airgVminY = document.getElementById('airg-vmin-y');
const airgVminZ = document.getElementById('airg-vmin-z');
const airgVmaxX = document.getElementById('airg-vmax-x');
const airgVmaxY = document.getElementById('airg-vmax-y');
const airgVmaxZ = document.getElementById('airg-vmax-z');
const airgNGridWidth = document.getElementById('airg-nGridWidth');
const airgFGridSpacing = document.getElementById('airg-fGridSpacing');
const airgNVisibilityRange = document.getElementById('airg-nVisibilityRange');
const airgUpdate = document.getElementById("airg-update");
const airgHighVisibilityBitsBytes = document.getElementById("airg-mHighVisibilityBitsBytes");
const airgHighVisibilityBitsSize = document.getElementById("airg-mHighVisibilityBitsSize");
const airgLowVisibilityBitsBytes = document.getElementById("airg-mLowVisibilityBitsBytes");
const airgLowVisibilityBitsSize = document.getElementById("airg-mLowVisibilityBitsSize");
const airgNodeCount = document.getElementById("airg-mNodeCount");
const airgWaypointList = document.getElementById("airg-mWaypointList");
const airgDeadEndDataBytes = document.getElementById("airg-mDeadEndDataBytes");
const airgDeadEndDataSize = document.getElementById("airg-mDeadEndDataSize");
const airgVisibilityData = document.getElementById("airg-mPVisibilityDate");
const controls = new THREE.OrbitControls(camera, renderer.domElement);
let highlightedSurface = null;
let selectedMap = null;

async function exportToAirgJson() {
    const blob = new Blob([
        JSON.stringify(
            AIGrids["editor"]
        , null, 2)
    ], {
        type: "application/json"
    });
    const newHandle = await window.showSaveFilePicker({
        types: [{
            description: "Airg Json",
            accept: {
                "application/json": [ ".json" ]
            },
        }],
        id: "save-json-file-picker",
        excludeAcceptAllOption: true,
    });
    const writableStream = await newHandle.createWritable();
    await writableStream.write(blob);
    await writableStream.close();
}

function onFileSelected(event) {
    var selectedFile = event.target.files[0];
    var reader = new FileReader();
  
    reader.onload = function(event) {
        AIGrids["editor"] = JSON.parse(event.target.result);
        reRender();
    };
  
    reader.readAsText(selectedFile);
}

function updateAirgFromEditorValues() {
    AIGrids["editor"]["m_Properties"]["vMin"]["x"] = parseFloat(airgVminX.value);
    AIGrids["editor"]["m_Properties"]["vMin"]["y"] = parseFloat(airgVminY.value);
    AIGrids["editor"]["m_Properties"]["vMin"]["z"] = parseFloat(airgVminZ.value);
    AIGrids["editor"]["m_Properties"]["vMax"]["x"] = parseFloat(airgVmaxX.value);
    AIGrids["editor"]["m_Properties"]["vMax"]["y"] = parseFloat(airgVmaxY.value);
    AIGrids["editor"]["m_Properties"]["vMax"]["z"] = parseFloat(airgVmaxZ.value);
    AIGrids["editor"]["m_Properties"]["nGridWidth"] = parseInt(airgNGridWidth.value);
    AIGrids["editor"]["m_Properties"]["fGridSpacing"] = parseFloat(airgFGridSpacing.value);
    AIGrids["editor"]["m_Properties"]["nVisibilityRange"] = parseInt(airgNVisibilityRange.value);
    
    AIGrids["editor"]["m_HighVisibilityBits"]["m_aBytes"] = JSON.parse(airgHighVisibilityBitsBytes.value);
    AIGrids["editor"]["m_HighVisibilityBits"]["m_nSize"] = parseInt(airgHighVisibilityBitsSize.value);
    AIGrids["editor"]["m_LowVisibilityBits"]["m_aBytes"] = JSON.parse(airgLowVisibilityBitsBytes.value);
    AIGrids["editor"]["m_LowVisibilityBits"]["m_nSize"] = JSON.parse(airgLowVisibilityBitsSize.value);
    AIGrids["editor"]["m_nNodeCount"] = parseInt(airgNodeCount.value);
    AIGrids["editor"]["m_WaypointList"] = JSON.parse(airgWaypointList.value);
    AIGrids["editor"]["m_deadEndData"]["m_aBytes"] = JSON.parse(airgDeadEndDataBytes.value);
    AIGrids["editor"]["m_deadEndData"]["m_nSize"] = parseInt(airgDeadEndDataSize.value);
    AIGrids["editor"]["m_pVisibilityData"] = JSON.parse(airgVisibilityData.value);
    reRender();
}

function updateAirgEditor() {
    airgVminX.value = AIGrids["editor"]["m_Properties"]["vMin"]["x"];
    airgVminY.value = AIGrids["editor"]["m_Properties"]["vMin"]["y"];
    airgVminZ.value = AIGrids["editor"]["m_Properties"]["vMin"]["z"];
    airgVmaxX.value = AIGrids["editor"]["m_Properties"]["vMax"]["x"];
    airgVmaxY.value = AIGrids["editor"]["m_Properties"]["vMax"]["y"];
    airgVmaxZ.value = AIGrids["editor"]["m_Properties"]["vMax"]["z"];
    airgNGridWidth.value = AIGrids["editor"]["m_Properties"]["nGridWidth"];
    airgFGridSpacing.value = AIGrids["editor"]["m_Properties"]["fGridSpacing"];
    airgNVisibilityRange.value = AIGrids["editor"]["m_Properties"]["nVisibilityRange"];
    airgHighVisibilityBitsBytes.value = JSON.stringify(AIGrids["editor"]["m_HighVisibilityBits"]["m_aBytes"]);
    airgHighVisibilityBitsSize.value = AIGrids["editor"]["m_HighVisibilityBits"]["m_nSize"];
    airgLowVisibilityBitsBytes.value = JSON.stringify(AIGrids["editor"]["m_LowVisibilityBits"]["m_aBytes"]);
    airgLowVisibilityBitsSize.value = AIGrids["editor"]["m_LowVisibilityBits"]["m_nSize"];
    airgNodeCount.value = AIGrids["editor"]["m_nNodeCount"];
    airgWaypointList.value = JSON.stringify(AIGrids["editor"]["m_WaypointList"]);
    airgDeadEndDataBytes.value = JSON.stringify(AIGrids["editor"]["m_deadEndData"]["m_aBytes"]);
    airgDeadEndDataSize.value = AIGrids["editor"]["m_deadEndData"]["m_nSize"];
    airgVisibilityData.value = JSON.stringify(AIGrids["editor"]["m_pVisibilityData"]);
}

function renderTriangle(v1, v2, v3, color) {
    const geometry = new THREE.BufferGeometry();

    const vertices = [
        v1[1], v1[2], v1[0],
        v2[1], v2[2], v2[0],
        v3[1], v3[2], v3[0],
    ];

    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));

    const meshMaterial = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, opacity: 0.5, transparent: true, blending: THREE.AdditiveBlending });
    const mesh = new THREE.Mesh(geometry, meshMaterial);

    scene.add(mesh);
}

function renderFace(edges, color) {
    for (let i = 0; i < edges.length - 2; ++i) {
        renderTriangle(edges[0], edges[i + 1], edges[i + 2], color);
    }
}

function renderPortalVert(edges) {
    for (const edge of edges) {
        if (edge[3] !== 1) {
            continue;
        }
        
        const edgeColor = 0x0000ff;
        
        const geometry = new THREE.CircleGeometry(0.1, 5);
        const material = new THREE.MeshBasicMaterial({ color: edgeColor, side: THREE.DoubleSide });

        const circle = new THREE.Mesh(geometry, material);
        circle.position.set(edge[1], edge[2] + 0.01, edge[0]);
        circle.rotation.set(1.5708, 0, 0);

        scene.add(circle);
    }
}

function setLineSegmentColor(lineSegmentIndex, colors, hasAdjacentArea) {
    let lineSegmentColor; 
    if (hasAdjacentArea != 0) {
        lineSegmentColor = [0.0, 0.0, 1.0];
    } else {
        lineSegmentColor = [0.0, 1.0, 0.0];
    }
    if (lineSegmentIndex == 0) {
        colors[lineSegmentIndex * 6] = 1.0;
        colors[lineSegmentIndex * 6 + 1] = 1.0;
        colors[lineSegmentIndex * 6 + 2] = 1.0;
    } else {
        colors[lineSegmentIndex * 6] = lineSegmentColor[0];
        colors[lineSegmentIndex * 6 + 1] = lineSegmentColor[1];
        colors[lineSegmentIndex * 6 + 2] = lineSegmentColor[2];
    }
    colors[lineSegmentIndex * 6 + 3] = lineSegmentColor[0];
    colors[lineSegmentIndex * 6 + 4] = lineSegmentColor[1];
    colors[lineSegmentIndex * 6 + 5] = lineSegmentColor[2];
}

function renderText(number, x, y, z, color, fontsize) {
    const text = new THREE.TextSprite({
        alignment: 'center',
        color: color,
        fontFamily: 'Arial',
        fontSize: fontsize,
        text: number.toString(),
    });

    text.position.set(y, z + 0.16, x);

    scene.add(text);
}

function renderEdges(edges, showEdgeNumbers) {
    if (showEdgeNumbers) {
        let edgeIndex = 0;
        for (const edge of edges) {
            renderText(edgeIndex, edge[0], edge[1], edge[2], "#FFFFFF", 0.5);
            edgeIndex++;
        }
    }
        
    if (!useOrderedEdgeColors.checked) {
        const points = [];

        for (const edge of edges) {
            points.push(new THREE.Vector3(edge[1], edge[2], edge[0]));
        }

        points.push(new THREE.Vector3(edges[0][1], edges[0][2], edges[0][0]));

        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
        const line = new THREE.Line(geometry, lineMaterial);

        scene.add(line);
    } else {
        const points = [];
        const colors = new Float32Array((edges.length + 1) * 6);
        let edgeIndex = 0;
        let lineSegmentIndex = 0;

        for (const edge of edges) {
            points.push(new THREE.Vector3(edge[1], edge[2], edge[0]));
            setLineSegmentColor(lineSegmentIndex, colors, edge[4]);
            lineSegmentIndex++;
            if (edgeIndex != 0) {
                points.push(new THREE.Vector3(edge[1], edge[2], edge[0]));
            }
            edgeIndex++;
        }

        points.push(new THREE.Vector3(edges[0][1], edges[0][2], edges[0][0]));
        setLineSegmentColor(lineSegmentIndex, colors, 0);

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

        const lineMaterial = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors });
        lines = new THREE.Object3D();
	    line = new THREE.LineSegments( geometry,  lineMaterial);
        lines.add(line);
	    scene.add(lines);
    }
}

function renderSurfaceRadius(centerX, centerY, centerZ, maxRadius) {
    const geometry = new THREE.CircleGeometry(maxRadius, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide, opacity: 0.3, transparent: true });

    const circle = new THREE.Mesh(geometry, material);
    circle.position.set(centerY, centerZ - 0.01, centerX);
    circle.rotation.set(1.5708, 0, 0);

    scene.add(circle);
}

function renderSurfaceCenter(centerX, centerY, centerZ) {
    const geometry = new THREE.CircleGeometry(0.1, 5);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });

    const circle = new THREE.Mesh(geometry, material);
    circle.position.set(centerY, centerZ + 0.01, centerX);
    circle.rotation.set(1.5708, 0, 0);

    scene.add(circle);
}

function renderBasisVert(faceIdx, vertex) {
    const geometry = new THREE.CircleGeometry(0.1, 5);
    const material = new THREE.MeshBasicMaterial({ color: 0xff00ff, side: THREE.DoubleSide });

    const circle = new THREE.Mesh(geometry, material);
    circle.position.set(vertex[1], vertex[2] + 0.01, vertex[0]);
    circle.rotation.set(1.5708, 0, 0);

    scene.add(circle);

    const text = new THREE.TextSprite({
        alignment: 'center',
        color: '#000000',
        fontFamily: 'Arial',
        fontSize: 0.12,
        text: faceIdx.toString(),
    });

    text.position.set(vertex[1], vertex[2] + 0.05, vertex[0]);

    scene.add(text);
}

function setHighlightedArea() {
    const index = parseInt(highlightArea.value);
    highlightedSurface = Areas[selectedMap][index];
}

function renderSurface(i, surface) {
    const centerX = surface[0];
    const centerY = surface[1];
    const centerZ = surface[2];
    const maxRadius = surface[3];

    const isSteps = surface[4] === 8;
    const vertexIndex = surface[5];
    const vertices = surface[6];

    if (checkRadii.checked) {
        renderSurfaceRadius(centerX, centerY, centerZ, maxRadius);
    }

    let faceColor = 0x00FF00;

    if (isSteps) {
        faceColor = 0xFF69B4;
    }

    if (parseInt(highlightArea.value) == i) {
        faceColor = 0xFF0000;
    }

    if (checkFaces.checked) {
        renderFace(vertices, faceColor);
    }
    
    if (checkEdges.checked) {
        renderEdges(vertices, parseInt(highlightArea.value) == i);
    }

    if (checkBasisVertices.checked) {
        renderBasisVert(i, vertices[vertexIndex]);
    }

    if (checkPortalVertices.checked) {
        renderPortalVert(vertices);
    }

    if (checkCenters.checked) {
        renderSurfaceCenter(centerX, centerY, centerZ);
    }

    if (checkNumbers.checked) {
        renderText(i, centerX, centerY, centerZ, "#FFFFFF", 0.5);
    }
}

function renderBBox(unk) {
    const box = new THREE.Box3(new THREE.Vector3(unk[1], unk[2] + 0.01, unk[0]), new THREE.Vector3(unk[4], unk[5] + 0.01, unk[3]));

    const helper = new THREE.Box3Helper(box, 0xff00ff);
    scene.add(helper);
}

function getSplitAxisColor(splitAxis) {
    let color;
    if (splitAxis == 0) {
        color = 0x000080;
    } else if (splitAxis == 1) {
        color = 0x008000;
    } else {
        color = 0x800000;
    }
    return color;
}

function renderBBoxWithColor(color, bbox) {
    const box = new THREE.Box3(new THREE.Vector3(bbox[1], bbox[2] + 0.01, bbox[0]), new THREE.Vector3(bbox[4], bbox[5] + 0.01, bbox[3]));
    const helper = new THREE.Box3Helper(box, color);
    scene.add(helper);
}

function renderLine(sx, sy, sz, ex, ey, ez, color) {
    const points = [];
    points.push(new THREE.Vector3(sy, sz, sx), new THREE.Vector3(ey, ez, ex));
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const lineMaterial = new THREE.LineBasicMaterial({ color:color });
    const line = new THREE.Line(geometry, lineMaterial);

    scene.add(line);
}

function renderAxes() {
        const axes = [["X", [1,0,0]], ["Y", [0,1,0]], ["Z", [0,0,1]]]
        let color = 0x0000ff;
        for (const axis of axes) {
            const points = [];
            points.push(new THREE.Vector3(0, 0, 0), new THREE.Vector3(axis[1][1], axis[1][2], axis[1][0]));
            
            const geometry = new THREE.BufferGeometry().setFromPoints(points);

            const lineMaterial = new THREE.LineBasicMaterial({ color:color });
            const line = new THREE.Line(geometry, lineMaterial);

            scene.add(line);
            color *= 256;
            renderText(axis[0], axis[1][0], axis[1][1], axis[1][2], "#FFFFFF", 0.5);
        }

}

function dist(x0, y0, z0, x1, y1, z1){
    let deltaX = x1 - x0;
    let deltaY = y1 - y0;
    let deltaZ = z1 - z0;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);;
}

function renderAiGrid() {
    console.log("Rendering AI Grid")
    const airg = AIGrids["editor"];
    const p = airg["m_Properties"];
    const aiGridBBox = [p.vMin["x"], p.vMin["y"], p.vMin["z"], p.vMax["x"], p.vMax["y"], p.vMax["z"]];
    renderBBox(aiGridBBox);
    
    let cx;
    let cy;
    let cz;
    let maxRadius;
    if (highlightedSurface != null) {
        cx = highlightedSurface[0];
        cy = highlightedSurface[1];
        cz = highlightedSurface[2];
        maxRadius = highlightedSurface[3];
    }
    for (let i = 0; i < airg["m_WaypointList"].length; ++i) {
        const waypoint = airg["m_WaypointList"][i];
        const pos = waypoint["vPos"];
        if ((highlightedSurface != null && dist(pos["x"], pos["y"], pos["z"], cx, cy, cz) <= maxRadius) ||
    checkAiGridShowAll.checked) {
            renderText(i, pos["x"], pos["y"], pos["z"], "#aaaaaa", 0.1);
        }
        for (let j = 0; j < 8; ++j) {
            let n = waypoint["nNeighbor" + j];
            if (n != 65535) {
                const nWaypoint = airg["m_WaypointList"][n];
                const npos = nWaypoint["vPos"];
                renderLine(pos["x"], pos["y"], pos["z"], npos["x"], npos["y"], npos["z"], 0xFF0000);
            }
        }
    }

}

controls.update();

function animate() {
    requestAnimationFrame(animate);

    controls.update();

    renderer.render(scene, camera);
}

animate();

function resetCamera() {
    selectedMap = mapSelector.value;
    camera.position.set(-40, 50, 80);
}

function reRender() {
    // Clear the scene.
    while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }

    console.log('Rendering ' + selectedMap);

    if (checkBBox.checked) {
        renderBBox(Areas[selectedMap][0]);
    }

    for (let i = 1; i < Areas[selectedMap].length; ++i) {
        const surface = Areas[selectedMap][i];
        renderSurface(i, surface);
    }

    airgEditor.style.visibility = checkAiGrid.checked ? "visible" : "hidden";
    if (checkAiGrid.checked) {
        renderAiGrid();
        updateAirgEditor();
    }

    
    let maxDepth = -1;
    for (const [depth, bboxes] of Object.entries(KDTree[selectedMap])) {
        maxDepth = Math.max(maxDepth, depth);
    }
    kdTreeDepth.min = -1;
    kdTreeDepth.max = maxDepth;

    if (checkKDTree.checked) {
        
        for (const [depth, bboxes] of Object.entries(KDTree[selectedMap]))
        {
            if (kdTreeDepth.value == -1 || kdTreeDepth.value == depth) {
                let bboxIndex = 0;
                for (const bbox of bboxes) {
                    const color = getSplitAxisColor(bbox[6]);
                    renderBBoxWithColor(color, bbox);
                    bboxIndex++;
                }
            }
        }
    }
    renderAxes();
}

let hasSelection = false;

for (const mapName in Areas) {
    const optionElement = document.createElement('option');
    optionElement.innerHTML = mapName;

    if (!hasSelection) {
        optionElement.selected = true;
        hasSelection = true;
    }

    mapSelector.appendChild(optionElement);
}

resetCamera();
reRender();

mapSelector.addEventListener('change', () => { resetCamera(); reRender()});
checkRadii.addEventListener('change', () => reRender());
useOrderedEdgeColors.addEventListener('change', () => reRender());
highlightArea.addEventListener('input', () => { setHighlightedArea(); reRender()});
kdTreeDepth.addEventListener('input', () => reRender());
checkCenters.addEventListener('change', () => reRender());
checkFaces.addEventListener('change', () => reRender());
checkEdges.addEventListener('change', () => reRender());
checkBasisVertices.addEventListener('change', () => reRender());
checkPortalVertices.addEventListener('change', () => reRender());
checkBBox.addEventListener('change', () => reRender());
checkNumbers.addEventListener('change', () => reRender());
checkKDTree.addEventListener('change', () => reRender());
checkAiGrid.addEventListener('change', () => reRender());
checkAiGridShowAll.addEventListener('change', () => reRender());
airgFileInput.addEventListener('change', () => onFileSelected(event));
airgUpdate.addEventListener('click', () => updateAirgFromEditorValues());
airgSave.addEventListener('click', exportToAirgJson);
