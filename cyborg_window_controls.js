/* =========================================
   CYBORG WINDOW CONTROLS
   Robo-Knight Edition
   ========================================= */

function attachWindowControls(win, titleBar, content) {
    // Controls container
    const controls = document.createElement("div");
    controls.style.float = "right";
    controls.style.display = "flex";
    controls.style.gap = "6px";

    const btn = (label, action) => {
        const b = document.createElement("div");
        b.textContent = label;
        b.style.width = "18px";
        b.style.height = "18px";
        b.style.lineHeight = "18px";
        b.style.textAlign = "center";
        b.style.cursor = "pointer";
        b.style.fontWeight = "bold";
        b.style.background = "#c9a227";
        b.style.color = "#000";
        b.style.border = "1px solid #3a2f0b";
        b.onmouseenter = () => b.style.background = "#f5d76e";
        b.onmouseleave = () => b.style.background = "#c9a227";
        b.onclick = e => {
            e.stopPropagation();
            action();
        };
        return b;
    };

    /* Close */
    const closeBtn = btn("✖", () => win.remove());

    /* Minimize */
    const minBtn = btn("—", () => {
        content.style.display =
            content.style.display === "none" ? "block" : "none";
    });

    /* Maximize */
    let maximized = false;
    let prev = {};

    const maxBtn = btn("⬜", () => {
        if (!maximized) {
            prev = {
                left: win.style.left,
                top: win.style.top,
                width: win.style.width,
                height: win.style.height
            };
            win.style.left = "0";
            win.style.top = "0";
            win.style.width = "100vw";
            win.style.height = "100vh";
            content.style.height = "calc(100vh - 52px)";
        } else {
            Object.assign(win.style, prev);
            content.style.height = "";
        }
        maximized = !maximized;
    });

    controls.append(minBtn, maxBtn, closeBtn);
    titleBar.appendChild(controls);
}