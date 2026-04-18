// ** for ui events **
// control panel

// --- toggle panel ---
// if btn clicked, panel will expand 
function togglePanel(btnId, panelId) {
    const btn = document.getElementById(btnId);
    const panel = document.getElementById(panelId);
    btn.onclick = () => {
        if (panel.style.display !== "block") {
            panel.style.display = "block";
        } else {
            panel.style.display = "none";
        }
    };
}
togglePanel("aboutToggle", "aboutPanel");
togglePanel("leftToggle", "leftPanel");

// --- drag panel ---
function initDraggablePanels() {
    const panels = document.querySelectorAll(".panel");
    panels.forEach(panel => {
        const header = panel.querySelector(".panel-header");
        if (!header) return;
        let isDragging = false;
        let startX, startY;
        let origX, origY;

        header.addEventListener("mousedown", (e) => { // after clicking the panel-header
            if (e.target.classList.contains("close-btn")) return;
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            const rect = panel.getBoundingClientRect()
            origX = rect.left;
            origY = rect.top;
            panel.style.transition = "none";
        });

        document.addEventListener("mousemove", (e) => { // when dragging -> panel move
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            panel.style.left = origX + dx + "px";
            panel.style.top = origY + dy + "px";
        });

        document.addEventListener("mouseup", () => { // stop to drag

            if (!isDragging) return;

            isDragging = false;
            panel.style.transition = "all 0.3s ease";

        });

    });

}
initDraggablePanels();

// --- close panel ---
window.closePanel = function (id) {
    const panel = document.getElementById(id);
    if (panel) {
        panel.style.display = "none";
    }
}

// --- chart ---
let myChart = null;
function updateChartData(labels, values1, values2, values3) {

    xValues = labels;
    yValues = [1, 2, 3];
    zValues = [values1, values2, values3];

    // Create the text for popups
    var text = zValues.map(function (zValues, i) {
        return zValues.map(function (value, j) {
            return ` Category: ${yValues[i]}<br> Prefecture: ${xValues[j]}<br> Counts: ${value} `
        });
    });
    // set layout for heatmap
    const layout = {
        title: "",
        xaxis: { title: "" },
        yaxis: { title: "Category" },
        autosize: true,
        margin: { t: 5, r: 0, b: 25, l: 35 }
    };

    const config = {
        responsive: true
    };
    // plot the heatmap
    Plotly.newPlot("myChart", [{
        x: xValues,
        y: yValues,
        z: zValues,
        type: "heatmap",
        colorscale: "Pinkyl",
        text: text,
        hoverinfo: 'text',
    }], layout, config);
}