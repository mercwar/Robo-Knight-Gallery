// ===== CONFIG =====
const owner = "mercwar";
const repo  = "NEXUS";

let zIndexTop = 10;
let offset = 30;

// ===== WINDOW CONTROLS =====
function attachWindowControls(win, titleBar, content){
    const controls = document.createElement("div");
    controls.style.float="right";
    controls.style.display="flex";
    controls.style.gap="6px";

    const btn=(label,action)=>{
        const b=document.createElement("div");
        b.textContent=label;
        b.style.width="18px"; b.style.height="18px";
        b.style.lineHeight="18px"; b.style.textAlign="center";
        b.style.cursor="pointer"; b.style.fontWeight="bold";
        b.style.background="#c9a227"; b.style.color="#000";
        b.style.border="1px solid #3a2f0b";
        b.onmouseenter=()=>b.style.background="#f5d76e";
        b.onmouseleave=()=>b.style.background="#c9a227";
        b.onclick=e=>{ e.stopPropagation(); action(); };
        return b;
    };

    // CLOSE
    const closeBtn = btn("✖", ()=>win.remove());

    // MINIMIZE
    const minBtn = btn("—", ()=>{
        if(content.style.display==="none"){
            content.style.display="block";
            win.style.height = win.dataset.prevHeight || win.style.height;
        } else {
            win.dataset.prevHeight = win.style.height; // store current height
            content.style.display="none";
            win.style.height = "36px"; // just titlebar height
        }
    });

let maximized = false;
let prev = {};

const maxBtn = btn("⬜", () => {
    const win = content.parentElement;  // get the window div

    if (!maximized) {
        // store previous size/position
        prev = {
            position: win.style.position || "",
            left: win.style.left || "",
            top: win.style.top || "",
            width: win.style.width || "",
            height: win.style.height || "",
        };

        // maximize to full viewport
        win.style.position = "fixed";
        win.style.left = "0";
        win.style.top = "0";
        win.style.right = "0";
        win.style.bottom = "0";
        win.style.width = "100%";
        win.style.height = "100%";

        // content already flex:1 fills space
    } else {
        // restore original
        Object.assign(win.style, prev);
    }

    maximized = !maximized;
});

    controls.append(minBtn,maxBtn,closeBtn);
    titleBar.appendChild(controls);
}

// ===== DRAGGING =====
function makeDraggable(win, handle){
    let dx=0,dy=0;
    handle.onmousedown=e=>{
        e.preventDefault();
        dx = e.clientX - win.offsetLeft;
        dy = e.clientY - win.offsetTop;
        document.onmousemove=e2=>{
            win.style.left=(e2.clientX-dx)+"px";
            win.style.top=(e2.clientY-dy)+"px";
        };
        document.onmouseup=()=>{ document.onmousemove=null; document.onmouseup=null; };
    };
}

// ===== CREATE WINDOW =====
// ===== CREATE WINDOW (PATCHED FOR DIRECTORY WINDOWS) =====
function createWindow(title, isDirectory=false){
    const win=document.createElement("div"); 
    win.className="window";

    // Smaller default size for directories
    if(isDirectory){
        win.style.width="400px";
        win.style.height="300px";
    } else {
        win.style.width="480px";
        win.style.height="320px";
    }

    win.style.left=offset+"px"; 
    win.style.top=offset+"px";
    win.style.zIndex=++zIndexTop; 
    offset+=28;

    const bar=document.createElement("div"); 
    bar.className="titlebar"; 
    bar.textContent=title;

    const content=document.createElement("div"); 
    content.className="content"; 
    content.textContent="Loading…";

    const footer=document.createElement("div"); 
    footer.className="footer"; 
    footer.textContent="CYBORG LIVE";

    win.append(bar,content,footer);
    document.getElementById("desktop").appendChild(win);

    makeDraggable(win, bar);
    win.onclick=()=>win.style.zIndex=++zIndexTop;

    attachWindowControls(win, bar, content);

    return content;
}


// ===== OPEN DIRECTORY =====
// ===== OPEN DIRECTORY =====
function openDirectory(path,title){
    const content = createWindow("📁 "+title);
    const win = content.parentElement;
    win.classList.add("viewer-window");  // treat directory like a viewer window

    // Make scrollable
    content.style.flex = "1";
    content.style.overflow = "auto";
    content.style.minHeight = "0";   // necessary for flex scrolling

    fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`)
        .then(r=>r.json())
        .then(items=>{
            content.innerHTML="";
            items.sort((a,b)=>a.type.localeCompare(b.type));
            items.forEach(item=>{
                const row=document.createElement("div");
                row.className="entry";
                row.innerHTML=`<span class="icon">${item.type==="dir"?"📁":"📄"}</span><span>${item.name}</span>`;
                row.onclick=e=>{
                    e.stopPropagation();
                    if(item.type==="dir") openDirectory(item.path,item.name);
                    else openFile(item);
                };
                content.appendChild(row);
            });
        })
        .catch(()=>content.textContent="Directory load failed.");
}


// ===== FILE VIEWER =====
// ===== FILE VIEWER =====
function openFile(item){
    const ext = item.name.split(".").pop().toLowerCase();

    // Markdown
    if(ext==="md"){
        const content = createWindow("📝 "+item.name);
        const win = content.parentElement;
        win.classList.add("viewer-window");
        content.classList.add("viewer","md-viewer");

        // make scrollable
        content.style.flex = "1";
        content.style.overflow = "auto";
        content.style.minHeight = "0";

        fetch(item.download_url)
            .then(r=>r.text())
            .then(md=>{
                content.innerHTML = "";
                const wrapper = document.createElement("div");
                wrapper.className = "md-inner";
                wrapper.innerHTML = marked.parse(md);
                content.appendChild(wrapper);
            })
            .catch(()=>content.textContent="Markdown load failed.");
        return;
    }

    // HTML
    if(["html","htm"].includes(ext)){
        const content = createWindow("🌐 "+item.name);
        const win = content.parentElement;
        win.classList.add("viewer-window");

        content.style.flex = "1";
        content.style.overflow = "auto";
        content.style.minHeight = "0";

        const iframe = document.createElement("iframe");
        iframe.className="html-frame";
        iframe.src = item.html_url.replace("github.com","raw.githack.com").replace("/blob/","/");
        content.innerHTML="";
        content.appendChild(iframe);
        return;
    }

    // Default: text / pretty print
    const content = createWindow("📄 "+item.name);
    const win = content.parentElement;
    win.classList.add("viewer-window");  // treat like a viewer

    // WRAP inside scrollable container
    const wrapper = document.createElement("div");
    wrapper.className = "viewer md-inner";  // use md-inner styling for pretty-print
    wrapper.style.flex = "1";
    wrapper.style.overflow = "auto";
    wrapper.style.minHeight = "0";
    wrapper.style.background = "#000";      // dark background for text files
    wrapper.style.color = "#ffd700";       // gold text

    content.innerHTML = "";
    content.appendChild(wrapper);

    fetch(item.download_url)
        .then(r=>r.text())
        .then(data => {
            // Use <pre> for preserving formatting
            wrapper.innerHTML = `<pre>${data.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</pre>`;
        })
        .catch(()=>wrapper.textContent="File load failed.");
}


// ===== HTML / MD VIEWER =====
function openHtmlViewer(item){
    const content=createWindow("🌐 "+item.name);
    const win = content.parentElement;
    win.classList.add("viewer-window");

    content.style.flex = "1";
    content.style.overflow = "auto";
    content.style.minHeight = "0";

    const iframe=document.createElement("iframe");
    iframe.className="html-frame";
    iframe.src = item.html_url.replace("github.com","raw.githack.com").replace("/blob/","/");
    content.innerHTML=""; content.appendChild(iframe);
}

// ===== BOOT =====
openDirectory("CYBORG eV1.0","CYBORG eV1.0");
