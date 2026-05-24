const owner       = "mercwar";
const repo        = "Robo-Knight-Gallery";
const maxVersions = 12;
const imageExts   = ["jpg","jpeg","png","gif","webp","bmp"];

let zIndexTop = 10;
let offset    = 40;

function ghList(path=""){
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`;
    return fetch(url).then(r=>r.json());
}

function isImageFile(name){
    const ext = name.split(".").pop().toLowerCase();
    return imageExts.includes(ext);
}

function isVersionDir(name){
    const m = /^Version\s+(\d+)$/i.exec(name);
    if(!m) return false;
    const n = parseInt(m[1],10);
    return n >= 1 && n <= maxVersions;
}

function createWindow(title){
    const win=document.createElement("div");
    win.className="window";
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
    footer.textContent="CYBORG LIVE / RRU READY";

    win.append(bar,content,footer);
    document.getElementById("desktop").appendChild(win);

    win.addEventListener("mousedown", () => {
        win.style.zIndex = ++zIndexTop;
    });

    let dx=0,dy=0;
    bar.onmousedown=e=>{
        dx = e.clientX - win.offsetLeft;
        dy = e.clientY - win.offsetTop;
        document.onmousemove=e2=>{
            win.style.left=(e2.clientX-dx)+"px";
            win.style.top=(e2.clientY-dy)+"px";
        };
        document.onmouseup=()=>document.onmousemove=null;
    };

    const controls=document.createElement("div");
    controls.style.float="right";
    controls.style.display="flex";
    controls.style.gap="4px";

    const btn=(label,action)=>{
        const b=document.createElement("div");
        b.textContent=label;
        b.style.width="18px";
        b.style.height="18px";
        b.style.lineHeight="18px";
        b.style.textAlign="center";
        b.style.cursor="pointer";
        b.style.background="#c9a227";
        b.style.color="#000";
        b.style.border="1px solid #3a2f0b";
        b.onclick=e=>{ e.stopPropagation(); action(); };
        return b;
    };

    controls.append(
        btn("—", ()=>content.style.display = content.style.display==="none" ? "block" : "none"),
        btn("✖", ()=>win.remove())
    );

    bar.appendChild(controls);

    return content;
}

function openStartMenu(){
    const content = createWindow("AVIS – Versions");
    content.innerHTML = "Loading…";

    ghList("").then(items=>{
        const versions = items
            .filter(i => i.type==="dir" && isVersionDir(i.name))
            .sort((a,b)=>{
                const na = parseInt(a.name.split(" ")[1],10);
                const nb = parseInt(b.name.split(" ")[1],10);
                return na - nb;
            });

        content.innerHTML = "";

        versions.forEach(v=>{
            const row=document.createElement("div");
            row.className="entry";
            row.innerHTML=`<span class="icon">📁</span>${v.name}`;
            row.onclick=()=>openImageGallery(v.path, v.name);
            content.appendChild(row);
        });

        if(versions.length===0){
            content.textContent="No Version folders found.";
        }
    }).catch(()=>{
        content.textContent="Failed to load versions.";
    });
}

function openImageGallery(path,title){
    const content = createWindow("🖼 " + title);
    content.innerHTML="Loading…";

    ghList(path).then(items=>{
        const images = items.filter(i => i.type==="file" && isImageFile(i.name));

        if(images.length===0){
            content.textContent="No images in this Version.";
            return;
        }

        const grid=document.createElement("div");
        grid.style.display="grid";
        grid.style.gridTemplateColumns="repeat(auto-fill, 120px)";
        grid.style.gap="10px";

        images.forEach(imgItem=>{
            const thumb=document.createElement("img");
            thumb.src=imgItem.download_url;
            thumb.className="thumb";
            thumb.onclick=()=>openImageViewer(imgItem,title);
            grid.appendChild(thumb);
        });

        content.innerHTML="";
        content.appendChild(grid);
    }).catch(()=>{
        content.textContent="Failed to load images.";
    });
}

function openImageViewer(item, versionTitle){
    const content=createWindow(`🖼 ${versionTitle} / ${item.name}`);
    content.style.display="flex";
    content.style.alignItems="center";
    content.style.justifyContent="center";

    const img=document.createElement("img");
    img.src=item.download_url;
    img.className="viewer-img";

    content.innerHTML="";
    content.appendChild(img);
}

document.getElementById("startBtn").onclick = openStartMenu;
openStartMenu();
