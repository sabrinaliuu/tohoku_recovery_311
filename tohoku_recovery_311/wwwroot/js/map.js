require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/GeoJSONLayer",
    "esri/renderers/UniqueValueRenderer",
    "esri/renderers/HeatmapRenderer",
    "esri/widgets/Legend"
], function (Map, MapView, GeoJSONLayer, UniqueValueRenderer, HeatmapRenderer, Legend) {

    let layer;
    let layer_pref;
    window.visitedSet = new Set();
    const colorMap = { "0": "#D9D9D9", "1": "#F08080", "2": "#AFE1AF", "3": "#A7C7E7", "青森": "#F08080", "岩手": "#FDDA0D", "宮城": "#AFE1AF", "福島": "#A7C7E7", "All": "#999999" };
    let attributeCache = {}; // for storing layer attribute data

    // basemap
    const map = new Map({
        basemap: "topo-vector"
    });

    window.view = new MapView({
        container: "viewDiv",
        map: map,
        center: [139, 39],
        zoom: 7
    });


    view.highlightOptions = {
        color: [100, 100, 100, 0.5],
        haloOpacity: 0.8,
        fillOpacity: 0.3
    };


    // new prefecture layer
    layer_pref = new GeoJSONLayer({
        url: "/data/Prefectures2.geojson",
        outFields: ["name", "NUMPOINTS", "category_1", "category_2", "category_3"]
    });

    layer_pref.renderer = {
        type: "simple",
        symbol: {
            type: "simple-fill",
            color: [100, 100, 100, 0.2],
            outline: { color: "white", width: 1 }
        }
    };

    map.add(layer_pref);

    // --- handle POI layer ---
    async function loadPoints(geojson) {

        // add properties: visit record
        geojson.features.forEach(f => {
            const code = f.properties.code;
            f.properties.Visited = visitedSet.has(code) ? "1" : "0"; 
        });

        // let geojson transfer into blob
        const blob = new Blob([JSON.stringify(geojson)], { type: "application/json" });
        const blobUrl = URL.createObjectURL(blob);

        // set layer for heatmap
        layer_heatmap = new GeoJSONLayer({
            url: blobUrl,
            outFields: [] // Do not need any field
        });

        // init heatmap render
        layer_heatmap.renderer = {
            type: "heatmap",
            colorStops: [
                { color: "rgba(147, 147, 255, 0)", ratio: 0 },
                { color: "rgba(102, 179, 255, 0.8)", ratio: 0.25 },
                { color: "rgba(125, 255, 121, 0.8)", ratio: 0.5 },
                { color: "rgba(255, 225, 83, 0.8)", ratio: 0.75 },
                { color: "rgba(255, 81, 81, 0.8)", ratio: 1 }
            ],
            //maxDensity: 0.01
            legendOptions: 
            {
                minLabel: "Low",
                maxLabel: "High"
            }
            
        };
        map.add(layer_heatmap);

        // add legend for heatmap
        const legend = new Legend({
            view: view,
            layerInfos: [
                {
                    layer: layer_heatmap,
                    title: "Density of Facilities"
                }
            ]
        });
        view.ui.add(legend, "bottom-right");

        // set layer
        layer = new GeoJSONLayer({
            url: blobUrl,
            outFields: ["name", "prefecture", "category", "code"],
            popupTemplate: {
                title: "{name}",
                content: window.createPopupContent
            }
        });

        // init style
        layer.renderer = {
            type: "simple",
            symbol: createMarkerSymbol(colorMap["All"])
        };
        map.add(layer);

    }

    async function init() {

        // start to get visits and POI data at the same time
        const [visitRes, pointsRes] = await Promise.all([
            isAuthenticated ? fetch("/UserVisits/uservisits") : Promise.resolve(null),
            fetch("/data/311.geojson")
        ]);

        if (visitRes) {
            const data = await visitRes.json();
            window.visitedSet = new Set(data);
            $('#fieldSelect').append($('<option>', { value: "Visited", text: "Visited" }));
        }

        const geojson = await pointsRes.json();

        // cache POI data
        const fieldsToCache = ["prefecture", "category"];
        fieldsToCache.forEach(field => {
            const uniqueValues = [...new Set(
                geojson.features
                    .map(f => f.properties[field])
                    .filter(val => val !== null && val !== undefined)
            )];
            attributeCache[field.toLowerCase()] = uniqueValues;
        });

        await loadPoints(geojson);

        uniqueValuesContainer.innerHTML = ""; // clean Loading
        createCheckbox("All", "All"); // create init checkbox
    }
    init();


    view.when(() => {

        view.ui.move("zoom", "bottom-right");
        console.log("View is ready");

        // for layer_pref heatmap
        layer_pref.when(() => {
            const query = layer_pref.createQuery();
            query.outFields = ["name", "NUMPOINTS", "category_1", "category_2", "category_3"];
            layer_pref.queryFeatures(query).then((result) => {

                const labels = result.features.map(f => f.attributes.name);
                const values1 = result.features.map(f => f.attributes.category_1);
                const values2 = result.features.map(f => f.attributes.category_2);
                const values3 = result.features.map(f => f.attributes.category_3);

                if (typeof updateChartData === "function") {
                    updateChartData(labels, values1, values2, values3); // draw heatmap
                }
            })
        });
    });


    // Filter
    const fieldSelect = document.getElementById("fieldSelect");
    const uniqueValuesContainer = document.getElementById("uniqueValuesContainer");
    uniqueValuesContainer.classList.add("checkbox-wrapper-13");
    const prefectureOrder = ["青森", "岩手", "宮城", "福島"];

    // handle the change of the select -> change checkbox and render
    fieldSelect.addEventListener("change", function () {
        uniqueValuesContainer.innerHTML = "";
        const selectedField = this.value;
        const lowerField = selectedField.toLowerCase();

        // select == All (back to init)
        if (!selectedField) {
            createCheckbox("All", "All");
            updateRenderer();
            return;
        }

        // select == Visited
        if (selectedField === "Visited") {
            const visitedOptions = ["0", "1"];
            const labels = { "0": "Unvisited", "1": "Visited" };
            visitedOptions.forEach(val => {
                createCheckbox(val, labels[val]);
            });
            updateRenderer();
            return;
        }
        if (attributeCache[lowerField]) {
            const uniqueValues = attributeCache[lowerField].sort((a, b) => {
                const orderA = prefectureOrder.indexOf(a);
                const orderB = prefectureOrder.indexOf(b);
                return (orderA !== -1 && orderB !== -1) ? orderA - orderB : String(a).localeCompare(String(b));
            });

            uniqueValues.forEach(val => createCheckbox(val, val));
        } else {
            uniqueValuesContainer.innerHTML = "No data in cache";
        }
        updateRenderer();
    });

    // render layer based on selected field and checkbox
    function updateRenderer() {

        const fieldName = fieldSelect.value;
        const checkedValues = Array.from(
            uniqueValuesContainer.querySelectorAll("input[type='checkbox']:checked")
        ).map(cb => cb.value);

        // no checked -> hide all
        if (checkedValues.length === 0) {
            layer.renderer = {
                type: "simple",
                symbol: createMarkerSymbol([0, 0, 0, 0], 0)
            }; 
            return;
        }
        
        // All (init)
        if (!fieldName) {
            layer.renderer = {
                type: "simple",
                symbol: createMarkerSymbol(colorMap["All"])
            };
            return;
        }

        // Visited
        if (fieldName === "Visited") {
            const visitedCodes = Array.from(window.visitedSet).map(code => `'${code}'`).join(",");
            const uniqueValueInfos = checkedValues.map(val => ({
                value: val,
                label: val === "1" ? "Visited" : "Unvisited",
                symbol: createMarkerSymbol(colorMap[val])
            }));

            layer.renderer = {
                type: "unique-value",
                valueExpression: `
                    var visitedCodes = [${visitedCodes}];
                    if (IndexOf(visitedCodes, $feature.code) >= 0) {
                        return "1";
                    }
                    return "0";
                `,
                uniqueValueInfos: uniqueValueInfos,
                defaultSymbol: createMarkerSymbol([0, 0, 0, 0], 0)
            };
            return;
        }


        
        // others: get checked val -> get their colors -> as uniqueValueInfos
        const uniqueValueInfos = checkedValues.map(val => ({
            value: val,
            symbol: createMarkerSymbol(colorMap[val], 6)
        }));

        // renderer
        layer.renderer = {
            type: "unique-value",
            field: fieldName,
            uniqueValueInfos: uniqueValueInfos,
            defaultSymbol: createMarkerSymbol([0, 0, 0, 0], 0)
        };
        
        
    };
    window.updateMapRenderer = updateRenderer;

    // layer_heatmap: control
    const cbHeatmapLayer = document.querySelector("#heatmapLayer input");
    cbHeatmapLayer.addEventListener("change", () => {
        layer_heatmap.visible = cbHeatmapLayer.checked;
    });

    // layer_pref: control
    const cbPrefLayer = document.querySelector("#prefLayer input");
    cbPrefLayer.addEventListener("change", () => {
        layer_pref.visible = cbPrefLayer.checked;
    });
   
 
    // layer_pref: tooltip and highlight
    const tooltip = document.getElementById("tooltip");
    let highlight;
    view.on("pointer-move", async (event) => {

        const response = await view.hitTest(event);
        const results = response.results.filter(result => result.graphic.layer === layer_pref);

        if (highlight) {
            highlight.remove();
            highlight = null;
        }

        if (results.length > 0) {
            const graphic = results[0].graphic;
            const attrs = graphic.attributes;

            const name = attrs.name || "unknown";
            const count = attrs.NUMPOINTS !== undefined ? attrs.NUMPOINTS : 0;

            // set tooltip content and position
            tooltip.innerHTML = `<b>${name}</b><br>Counts: ${count}`;
            tooltip.style.display = "block";
            tooltip.style.left = (event.x ) + "px";
            tooltip.style.top = (event.y) + "px";
            view.container.style.cursor = "pointer";

            // highlight
            const layerView = await view.whenLayerView(layer_pref);
            highlight = layerView.highlight(graphic);

        } else {
            tooltip.style.display = "none";
            view.container.style.cursor = "default";
        }
    });

    // --- utils ---
    // create checkbox
    function createCheckbox(val, text) {
        const label = document.createElement("label");
        label.style.display = "flex";
        label.style.alignItems = "center";
        label.style.gap = "6px";

        const colorBox = document.createElement("span");
        colorBox.style.width = "12px";
        colorBox.style.height = "12px";
        colorBox.style.borderRadius = "50%";
        colorBox.style.backgroundColor = colorMap[val] || "#999";
        colorBox.style.border = "1px solid #797979";

        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.value = val;
        cb.checked = true;
        cb.addEventListener("change", updateRenderer);

        label.appendChild(cb);
        label.appendChild(colorBox);
        label.appendChild(document.createTextNode(" " + (text || val)));
        uniqueValuesContainer.appendChild(label);
    }

    // function for setting point style
    function createMarkerSymbol(color,size=6) {
        return {
            type: "simple-marker",
            color: color,
            size: size,
            outline: {
                color: "#797979",
                width: 0.5
            }
        };
    }
});

