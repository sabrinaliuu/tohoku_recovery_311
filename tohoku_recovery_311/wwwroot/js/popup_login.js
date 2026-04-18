// ** set popup for login user **

// load visit data from database
window.createPopupContent = async function (feature) {
    const attr = feature.graphic.attributes;
    const code = attr.code;

    // set div
    const div = document.createElement("div");
    div.innerHTML = `
        <div style="margin-bottom: 8px;">
            <b>Code:</b> ${attr.code}<br>
            <b>Category:</b> ${attr.category}<br>
        </div>
    `;

    // login or not
    if (typeof isAuthenticated === 'undefined' || !isAuthenticated) {
        return div;
    }

    // login: 
    const loading = document.createElement("div");
    loading.innerText = "Loading...";
    div.appendChild(loading);

    try {
        // get visit data
        const res = await fetch(`/UserVisits/Get?code=${code}`);
        const data = res.ok ? await res.json() : { visitCount: 0, record: "" };
        div.removeChild(loading);

        // add record to popup form
        const form = document.createElement("div");
        form.innerHTML = `
            <hr>
            <b>Visit Counts:</b> <input type="number" id="visitCount_${code}" class="popup-input" value="${data.visitCount || 0}"><br>
            <b>Records:</b> <br>
            <textarea id="record_${code}" class="popup-textarea">${data.record || ""}</textarea><br>
            <button class="round-btn" onclick="saveVisit('${code}')">Save</button>
        `;
        div.appendChild(form);

    } catch (err) {
        loading.innerText = "Failed to load visit data.";
        console.error(err);
    }

    return div;
};

// save new record
window.saveVisit = async function (id) {

    const popup = view.popup.container;
    const visitInput = popup.querySelector(`#visitCount_${id}`);
    const recordInput = popup.querySelector(`#record_${id}`);

    const df = {
        Code: id,
        VisitCount: parseInt(visitInput.value) || 0,
        Record: recordInput.value || ""
    };

    // post new record to database
    try { 
        const res = await fetch("/UserVisits/Save", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(df)
        });

        if (res.ok) {
            alert("Saved!");

            // update visitedSet
            if (df.VisitCount > 0) {
                visitedSet.add(id);
            } else {
                visitedSet.delete(id);
            }

            // update render
            if (window.updateMapRenderer) {
                window.updateMapRenderer();
            }
        }
    
    } catch (err) {
        console.error("Save failed:", err);
    }
    
}