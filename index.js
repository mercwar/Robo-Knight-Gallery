const owner       = "mercwar";
const repo        = "Robo-Knight-Gallery";
const maxVersions = 12;
const imageExts   = ["jpg","jpeg","png","gif","webp","bmp"];

let currentVersion = null;
let files = [];
let page  = 1;
const pageSize = 5;   // ONLY SHOW 7 IMAGES

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
    const n = parseInt(m[1], 10);
    return n >= 1 && n <= maxVersions;
}

function buildVersionBar(){
    const bar = document.getElementById("versionBar");
    bar.textContent = "Loading versions…";

    ghList("").then(items=>{
        const versions = items
            .filter(i => i.type==="dir" && isVersionDir(i.name))
            .sort((a,b)=>{
                const na = parseInt(a.name.split(" ")[1],10);
                const nb = parseInt(b.name.split(" ")[1],10);
                return na - nb;
            });

        bar.textContent = "";
        versions.forEach(v=>{
            const btn = document.createElement("button");
            btn.textContent = v.name;
            btn.onclick = () => {
                currentVersion = v;
                page = 1;
                document.querySelectorAll("#versionBar button").forEach(b=>b.classList.remove("active"));
                btn.classList.add("active");
                loadImages();
            };
            bar.appendChild(btn);
        });

        if(versions[0]){
            bar.querySelector("button").click();
        }
    });
}

function loadImages(){
    if(!currentVersion) return;
    ghList(currentVersion.path).then(items=>{
        files = items.filter(i => i.type==="file" && isImageFile(i.name));
        page = 1;
        renderGrid();
    });
}

function renderGrid(){
    const grid = document.getElementById("grid");
    grid.innerHTML = "";

    const start = (page-1)*pageSize;
    const end   = start + pageSize;
    const pageFiles = files.slice(start,end);

    pageFiles.forEach(item=>{
        const img = document.createElement("img");
        img.src = item.download_url;
        img.className = "thumb";
        img.onclick = () => openLightbox(item.download_url);
        grid.appendChild(img);
    });

    const totalPages = Math.max(1, Math.ceil(files.length/pageSize));
    document.getElementById("pageInfo").textContent = `${page} OF ${totalPages}`;
}

function openLightbox(src){
    const lb = document.getElementById("lightbox");
    document.getElementById("lbImg").src = src;
    lb.style.display = "flex";
}

document.getElementById("lightbox").onclick = () => {
    document.getElementById("lightbox").style.display = "none";
};

document.getElementById("prevBtn").onclick = () => {
    if(page>1){ page--; renderGrid(); }
};
document.getElementById("nextBtn").onclick = () => {
    if(page < Math.ceil(files.length/pageSize)){ page++; renderGrid(); }
};

buildVersionBar();
