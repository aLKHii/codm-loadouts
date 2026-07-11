"use strict";

/*=========================================================
 aLKHii
 script.js
 Part 1
=========================================================*/

const DATA_URL = "data/weapons.json";
const ADMIN_PASSWORD = "admin123";
const STORAGE_KEY = "alkhii_database";
const FAVORITES_KEY = "alkhii_favorites";
const COMPARE_KEY = "alkhii_compare";
const BACKUP_KEY = "alkhii_backup";
const SEASON_KEY = "alkhii_current_season";

let weapons = [];
let filteredWeapons = [];
let favorites = [];
let compareList = [];
let observer;

/*=========================================================
DOM
=========================================================*/

const weaponContainer = document.getElementById("weaponContainer");
const metaContainer = document.getElementById("metaContainer");
const updatesList = document.getElementById("updatesList");
const changelogList = document.getElementById("changelogList");

const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const sortSelect = document.getElementById("sortSelect");

const popup = document.getElementById("popup");
const popupImage = document.getElementById("popupImage");
const popupName = document.getElementById("popupName");
const popupCategory = document.getElementById("popupCategory");
const popupSeason = document.getElementById("popupSeason");
const popupBadge = document.getElementById("popupBadge");
const popupDescription = document.getElementById("popupDescription");
const popupUpdated = document.getElementById("popupUpdated");
const closePopup = document.getElementById("closePopup");

const progressBar = document.getElementById("progressBar");
const scrollTopButton = document.getElementById("scrollTop");

const comparisonContainer =
document.getElementById("comparisonContainer");

const adminLoginButton =
document.getElementById("adminLoginButton");

const adminPassword =
document.getElementById("adminPassword");

const adminPanel =
document.getElementById("adminPanel");

const adminWeapons =
document.getElementById("adminWeapons");

const year =
document.getElementById("year");

const menuToggle =
document.getElementById("menuToggle");

const navMenu =
document.getElementById("navMenu");

/*=========================================================
INITIALIZATION
=========================================================*/

document.addEventListener("DOMContentLoaded", init);

async function init(){

    year.textContent = new Date().getFullYear();

    loadFavorites();

    loadCompare();

    setupEvents();

    createSkeletons();

    await loadWeapons();

    renderEverything();

    initLazyLoading();

    registerServiceWorker();

}

/*=========================================================
LOAD DATABASE
=========================================================*/

async function loadWeapons(){

    const local =
    localStorage.getItem(STORAGE_KEY);

    if(local){

        weapons =
        JSON.parse(local);

        filteredWeapons =
        [...weapons];

        return;

    }

    try{

        const response =
        await fetch(DATA_URL);

        weapons =
        await response.json();

        filteredWeapons =
        [...weapons];

    }

    catch(e){

        console.error(e);

        weapons=[];

        filteredWeapons=[];

    }

}

/*=========================================================
SAVE DATABASE
=========================================================*/

function saveDatabase(){

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(weapons)

    );

}

/*=========================================================
RENDER
=========================================================*/

function renderEverything(){

    renderWeapons(filteredWeapons);

    renderMeta();

    renderUpdates();

    renderChangelog();

    renderComparison();

    renderAdmin();

}

/*=========================================================
WEAPON CARD
=========================================================*/

function renderWeapons(data){

    weaponContainer.innerHTML="";

    data.forEach(weapon=>{

        weaponContainer.appendChild(

            createWeaponCard(weapon)

        );

    });

}

/*=========================================================
CARD
=========================================================*/

function createWeaponCard(weapon){

    const card =
    document.createElement("article");

    card.className =
    "weapon-card fade-up";

    card.innerHTML=`

<div class="weapon-image">

<img
loading="lazy"
class="lazy-image"
src="${weapon.image}"
alt="${weapon.name}">

${weapon.meta
?
`<span class="weapon-badge">META</span>`
:
""}

${weapon.pinned
?
`<div class="weapon-pinned">📌</div>`
:
""}

</div>

<div class="weapon-content">

<div class="weapon-title">

<h3>${weapon.name}</h3>

</div>

<span class="weapon-category">

${weapon.category}

</span>

<p class="weapon-description">

${weapon.description}

</p>

<div class="weapon-meta">

<div>

<span>Season</span>

<strong>${weapon.season}</strong>

</div>

<div>

<span>Updated</span>

<strong>${weapon.updated}</strong>

</div>

</div>

<div class="weapon-actions">

<button
title="Favorite"
data-id="${weapon.id}"
class="favorite-btn">

${favorites.includes(weapon.id)
?
"❤"
:
"♡"}

</button>

<button
title="Compare"
data-id="${weapon.id}"
class="compare-btn">

⇄

</button>

<button
title="Share"
data-id="${weapon.id}"
class="share-btn">

⤴

</button>

<button
title="Copy Link"
data-id="${weapon.id}"
class="copy-btn">

🔗

</button>

</div>

<button
class="view-build"
data-id="${weapon.id}">

View Build

</button>

</div>

`;

    return card;

}

/*=========================================================
META
=========================================================*/

function renderMeta(){

    metaContainer.innerHTML="";

    const meta=

    weapons

    .filter(w=>w.meta)

    .slice(0,5);

    meta.forEach(weapon=>{

        metaContainer.appendChild(

            createWeaponCard(weapon)

        );

    });

}

/*=========================================================
LATEST UPDATES
=========================================================*/

function renderUpdates(){

    updatesList.innerHTML="";

    [...weapons]

    .sort((a,b)=>

        new Date(b.updated)-

        new Date(a.updated)

    )

    .slice(0,8)

    .forEach(w=>{

        const li=

        document.createElement("li");

        li.innerHTML=

        `<strong>${w.name}</strong> updated`;

        updatesList.appendChild(li);

    });

}

/*=========================================================
CHANGELOG
=========================================================*/

function renderChangelog(){

    changelogList.innerHTML="";

    [...weapons]

    .sort(

        (a,b)=>

        new Date(b.updated)-

        new Date(a.updated)

    )

    .forEach(w=>{

        const div=

        document.createElement("div");

        div.className=

        "changelog-item";

        div.innerHTML=`

<div class="changelog-date">

${w.updated}

</div>

<div class="changelog-title">

${w.name}

</div>

<div class="changelog-description">

${w.description}

</div>

`;

        changelogList.appendChild(div);

    });

}

/*=========================================================
EVENTS
=========================================================*/

function setupEvents(){

    searchInput.addEventListener(

        "input",

        applyFilters

    );

    categoryFilter.addEventListener(

        "change",

        applyFilters

    );

    sortSelect.addEventListener(

        "change",

        applyFilters

    );

    weaponContainer.addEventListener(

        "click",

        weaponClickHandler

    );

    metaContainer.addEventListener(

        "click",

        weaponClickHandler

    );

    closePopup.addEventListener(

        "click",

        closeBuildPopup

    );

    popup.addEventListener(

        "click",

        e=>{

            if(e.target===popup){

                closeBuildPopup();

            }

        }

    );

    window.addEventListener(

        "scroll",

        updateScrollUI

    );

    scrollTopButton.addEventListener(

        "click",

        ()=>{

            window.scrollTo({

                top:0,

                behavior:"smooth"

            });

        }

    );

    menuToggle.addEventListener(

        "click",

        ()=>{

            navMenu.classList.toggle("open");

        }

    );

    adminLoginButton.addEventListener(

        "click",

        adminLogin

    );

      }

/*=========================================================
SEARCH / FILTER / SORT
=========================================================*/

function applyFilters(){

    const keyword =
    searchInput.value
    .trim()
    .toLowerCase();

    const category =
    categoryFilter.value;

    filteredWeapons = weapons.filter(weapon=>{

        const matchName =
        weapon.name
        .toLowerCase()
        .includes(keyword);

        const matchCategory =
        weapon.category
        .toLowerCase()
        .includes(keyword);

        const categoryPass =
        category===""
        ||
        weapon.category===category;

        return (
            (matchName || matchCategory)
            &&
            categoryPass
        );

    });

    switch(sortSelect.value){

        case "az":

            filteredWeapons.sort(

                (a,b)=>

                a.name.localeCompare(b.name)

            );

        break;

        case "za":

            filteredWeapons.sort(

                (a,b)=>

                b.name.localeCompare(a.name)

            );

        break;

        case "popular":

            filteredWeapons.sort(

                (a,b)=>

                b.popularity-a.popularity

            );

        break;

        case "newest":

            filteredWeapons.sort(

                (a,b)=>

                new Date(b.updated)-

                new Date(a.updated)

            );

        break;

    }

    renderWeapons(filteredWeapons);

    initLazyLoading();

    revealAnimations();

}

/*=========================================================
CLICK HANDLER
=========================================================*/

function weaponClickHandler(e){

    const id =
    Number(
        e.target.dataset.id
    );

    if(!id) return;

    const weapon =
    weapons.find(

        w=>w.id===id

    );

    if(!weapon) return;

    if(

        e.target.classList.contains(

            "view-build"

        )

    ){

        incrementViews(weapon);

        openBuildPopup(weapon);

        return;

    }

    if(

        e.target.classList.contains(

            "favorite-btn"

        )

    ){

        toggleFavorite(id);

        return;

    }

    if(

        e.target.classList.contains(

            "compare-btn"

        )

    ){

        toggleCompare(id);

        return;

    }

    if(

        e.target.classList.contains(

            "share-btn"

        )

    ){

        shareWeapon(weapon);

        return;

    }

    if(

        e.target.classList.contains(

            "copy-btn"

        )

    ){

        copyBuildLink(weapon);

    }

}

/*=========================================================
POPUP
=========================================================*/

function openBuildPopup(weapon){

    popupImage.src =
    weapon.image;

    popupImage.alt =
    weapon.name;

    popupName.textContent =
    weapon.name;

    popupCategory.textContent =
    "Category: " +
    weapon.category;

    popupSeason.textContent =
    "Season: " +
    weapon.season;

    popupBadge.textContent =
    "Badge: " +
    weapon.badge;

    popupDescription.textContent =
    weapon.description;

    popupUpdated.textContent =
    "Updated: " +
    weapon.updated;

    popup.classList.remove(

        "hidden"

    );

    popup.classList.add(

        "active"

    );

    document.body.style.overflow=
    "hidden";

}

function closeBuildPopup(){

    popup.classList.remove(

        "active"

    );

    popup.classList.add(

        "hidden"

    );

    document.body.style.overflow=
    "";

}

/*=========================================================
FAVORITES
=========================================================*/

function loadFavorites(){

    favorites = JSON.parse(

        localStorage.getItem(

            FAVORITES_KEY

        ) || "[]"

    );

}

function saveFavorites(){

    localStorage.setItem(

        FAVORITES_KEY,

        JSON.stringify(

            favorites

        )

    );

}

function toggleFavorite(id){

    if(

        favorites.includes(id)

    ){

        favorites = favorites.filter(

            item=>item!==id

        );

    }

    else{

        favorites.push(id);

    }

    saveFavorites();

    renderWeapons(filteredWeapons);

    renderMeta();

    initLazyLoading();

}

/*=========================================================
VIEWS
=========================================================*/

function incrementViews(weapon){

    weapon.views =
    Number(

        weapon.views || 0

    ) + 1;

    saveDatabase();

}

/*=========================================================
COMPARE
=========================================================*/

function loadCompare(){

    compareList = JSON.parse(

        localStorage.getItem(

            COMPARE_KEY

        ) || "[]"

    );

}

function saveCompare(){

    localStorage.setItem(

        COMPARE_KEY,

        JSON.stringify(

            compareList

        )

    );

}

function toggleCompare(id){

    if(

        compareList.includes(id)

    ){

        compareList =

        compareList.filter(

            item=>item!==id

        );

    }

    else{

        if(compareList.length>=2){

            compareList.shift();

        }

        compareList.push(id);

    }

    saveCompare();

    renderComparison();

    renderWeapons(filteredWeapons);

    renderMeta();

}

function renderComparison(){

    comparisonContainer.innerHTML="";

    if(compareList.length===0){

        comparisonContainer.innerHTML=

        "<p>Select two weapons to compare.</p>";

        return;

    }

    compareList.forEach(id=>{

        const weapon=

        weapons.find(

            w=>w.id===id

        );

        if(!weapon) return;

        const card=

        document.createElement("div");

        card.className=

        "compare-card";

        card.innerHTML=`

<div class="compare-header">

<h3>${weapon.name}</h3>

<p>${weapon.category}</p>

</div>

<div class="compare-body">

<img
loading="lazy"
src="${weapon.image}"
alt="${weapon.name}">

<div class="compare-info">

<p>

<strong>Season:</strong>

${weapon.season}

</p>

<p>

<strong>Badge:</strong>

${weapon.badge}

</p>

<p>

${weapon.description}

</p>

<p>

Views:
${weapon.views||0}

</p>

</div>

</div>

`;

        comparisonContainer.appendChild(

            card

        );

    });

}

/*=========================================================
SHARE
=========================================================*/

async function shareWeapon(weapon){

    const url =

    location.origin+

    location.pathname+

    "#weapon-"+

    weapon.id;

      const title =
    weapon.name +
    " Build";

    const text =
    weapon.description;

    if(

        navigator.share

    ){

        try{

            await navigator.share({

                title,

                text,

                url

            });

        }

        catch(err){

            console.warn(err);

        }

    }

    else{

        copyText(url);

    }

}

/*=========================================================
COPY BUILD LINK
=========================================================*/

function copyBuildLink(weapon){

    const url =

        location.origin+

        location.pathname+

        "#weapon-"+

        weapon.id;

    copyText(url);

}

async function copyText(text){

    try{

        await navigator.clipboard.writeText(text);

        toast("Copied to clipboard");

    }

    catch(e){

        const input=

        document.createElement("input");

        input.value=text;

        document.body.appendChild(input);

        input.select();

        document.execCommand("copy");

        input.remove();

        toast("Copied to clipboard");

    }

}

/*=========================================================
TOAST
=========================================================*/

function toast(message){

    let el=

    document.getElementById("toast");

    if(!el){

        el=document.createElement("div");

        el.id="toast";

        Object.assign(el.style,{

            position:"fixed",

            bottom:"25px",

            left:"50%",

            transform:"translateX(-50%)",

            background:"#1d1d1d",

            color:"#fff",

            padding:"14px 22px",

            borderRadius:"12px",

            zIndex:"999999",

            opacity:"0",

            transition:"opacity .3s"

        });

        document.body.appendChild(el);

    }

    el.textContent=message;

    el.style.opacity="1";

    setTimeout(()=>{

        el.style.opacity="0";

    },1800);

}

/*=========================================================
ADMIN LOGIN
=========================================================*/

function adminLogin(){

    if(

        adminPassword.value===

        ADMIN_PASSWORD

    ){

        adminPanel.classList.remove(

            "hidden"

        );

        adminPassword.value="";

    }

    else{

        alert(

            "Invalid password."

        );

    }

}

/*=========================================================
ADMIN RENDER
=========================================================*/

function renderAdmin(){

    adminWeapons.innerHTML="";

    weapons.forEach(weapon=>{

        const card=

        document.createElement("div");

        card.className=

        "admin-card";

        card.innerHTML=`

<img
src="${weapon.image}"
alt="${weapon.name}">

<div class="admin-info">

<h3>${weapon.name}</h3>

<p>${weapon.category}</p>

<div class="admin-actions">

<button
data-action="edit"
data-id="${weapon.id}">

Edit

</button>

<button
data-action="delete"
data-id="${weapon.id}">

Delete

</button>

<button
data-action="pin"
data-id="${weapon.id}">

${weapon.pinned?"Unpin":"Pin"}

</button>

</div>

</div>

`;

        adminWeapons.appendChild(card);

    });

}

/*=========================================================
ADMIN EVENTS
=========================================================*/

adminWeapons.addEventListener(

    "click",

    e=>{

        const id=

        Number(

            e.target.dataset.id

        );

        const action=

        e.target.dataset.action;

        if(!id) return;

        if(action==="delete"){

            deleteWeapon(id);

        }

        if(action==="edit"){

            editWeapon(id);

        }

        if(action==="pin"){

            togglePin(id);

        }

    }

);

/*=========================================================
DELETE
=========================================================*/

function deleteWeapon(id){

    if(

        !confirm(

            "Delete weapon?"

        )

    ) return;

    weapons=

    weapons.filter(

        w=>w.id!==id

    );

    filteredWeapons=[...weapons];

    saveDatabase();

    renderEverything();

}

/*=========================================================
PIN
=========================================================*/

function togglePin(id){

    const weapon=

    weapons.find(

        w=>w.id===id

    );

    if(!weapon) return;

    weapon.pinned=

    !weapon.pinned;

    saveDatabase();

    renderEverything();

}

/*=========================================================
EDIT
=========================================================*/

function editWeapon(id){

    const weapon=

    weapons.find(

        w=>w.id===id

    );

    if(!weapon) return;

    const name=

    prompt(

        "Weapon Name",

        weapon.name

    );

    if(name===null) return;

    const description=

    prompt(

        "Description",

        weapon.description

    );

    if(description===null) return;

    const image=

    prompt(

        "Image Path",

        weapon.image

    );

    if(image===null) return;

    const badge=

    prompt(

        "Badge",

        weapon.badge

    );

    if(badge===null) return;

    const season=

    prompt(

        "Season",

        weapon.season

    );

    if(season===null) return;

    const category=

    prompt(

        "Category",

        weapon.category

    );

    if(category===null) return;

    weapon.name=name;

    weapon.description=description;

    weapon.image=image;

    weapon.badge=badge;

    weapon.season=season;

    weapon.category=category;

    weapon.updated=

    new Date()

    .toISOString()

    .split("T")[0];

    saveDatabase();

    renderEverything();

}

/*=========================================================
ADD WEAPON
=========================================================*/

document.getElementById(

    "addWeapon"

).addEventListener(

    "click",

    addWeapon

);

function addWeapon(){

    const name=

    prompt("Weapon Name");

    if(!name) return;

    const category=

    prompt("Category");

    if(!category) return;
     
    const image =
    prompt(
        "Screenshot Path",
        "images/weapons/"
    );

    if(image===null) return;

    const season =
    prompt(
        "Season",
        localStorage.getItem(SEASON_KEY) || "Season X"
    );

    if(season===null) return;

    const badge =
    prompt(
        "Badge",
        "META"
    );

    if(badge===null) return;

    const description =
    prompt(
        "Description"
    );

    if(description===null) return;

    const popularity =
    Number(
        prompt(
            "Popularity",
            "0"
        )
    ) || 0;

    const id =

        weapons.length

        ?

        Math.max(

            ...weapons.map(

                w=>w.id

            )

        ) + 1

        :

        1;

    weapons.push({

        id,

        name,

        category,

        image,

        season,

        badge,

        description,

        updated:new Date()
        .toISOString()
        .split("T")[0],

        popularity,

        pinned:false,

        meta:false,

        views:0,

        favorites:0

    });

    filteredWeapons=[...weapons];

    saveDatabase();

    renderEverything();

}

/*=========================================================
EXPORT JSON
=========================================================*/

document.getElementById(
    "exportJSON"
).addEventListener(
    "click",
    exportDatabase
);

function exportDatabase(){

    const blob =
    new Blob(

        [

            JSON.stringify(

                weapons,

                null,

                2

            )

        ],

        {

            type:

            "application/json"

        }

    );

    const url =
    URL.createObjectURL(blob);

    const link =
    document.createElement("a");

    link.href=url;

    link.download="weapons.json";

    link.click();

    URL.revokeObjectURL(url);

}

/*=========================================================
IMPORT JSON
=========================================================*/

document.getElementById(
    "importJSON"
).addEventListener(
    "click",
    importDatabase
);

function importDatabase(){

    const input=
    document.createElement("input");

    input.type="file";

    input.accept=".json";

    input.onchange=e=>{

        const file=
        e.target.files[0];

        if(!file) return;

        const reader=
        new FileReader();

        reader.onload=()=>{

            try{

                weapons=
                JSON.parse(

                    reader.result

                );

                filteredWeapons=
                [...weapons];

                saveDatabase();

                renderEverything();

                toast(
                    "Database imported."
                );

            }

            catch(err){

                alert(
                    "Invalid JSON."
                );

            }

        };

        reader.readAsText(file);

    };

    input.click();

}

/*=========================================================
BACKUP
=========================================================*/

document.getElementById(
    "backupDatabase"
).addEventListener(
    "click",
    backupDatabase
);

function backupDatabase(){

    localStorage.setItem(

        BACKUP_KEY,

        JSON.stringify(

            weapons

        )

    );

    toast(
        "Backup created."
    );

}

/*=========================================================
RESTORE
=========================================================*/

document.getElementById(
    "restoreDatabase"
).addEventListener(
    "click",
    restoreDatabase
);

function restoreDatabase(){

    const backup=

    localStorage.getItem(

        BACKUP_KEY

    );

    if(!backup){

        alert(
            "No backup found."
        );

        return;

    }

    weapons=
    JSON.parse(backup);

    filteredWeapons=[...weapons];

    saveDatabase();

    renderEverything();

    toast(
        "Backup restored."
    );

}

/*=========================================================
ONE CLICK SEASON UPDATE
=========================================================*/

document.getElementById(
    "seasonUpdate"
).addEventListener(
    "click",
    updateSeason
);

function updateSeason(){

    const season=

    prompt(

        "New Season"

    );

    if(!season) return;

    localStorage.setItem(

        SEASON_KEY,

        season

    );

    weapons.forEach(

        weapon=>{

            weapon.season=
            season;

            weapon.updated=
            new Date()

            .toISOString()

            .split("T")[0];

        }

    );

    saveDatabase();

    renderEverything();

    toast(
        "Season updated."
    );

}

/*=========================================================
SKELETON LOADING
=========================================================*/

function createSkeletons(){

    weaponContainer.innerHTML="";

    for(

        let i=0;

        i<8;

        i++

    ){

        const card=

        document.createElement("div");

        card.className=

        "weapon-card skeleton";

        card.style.height="420px";

        weaponContainer.appendChild(card);

    }

      }

 /*=========================================================
LAZY LOADING
=========================================================*/

function initLazyLoading(){

    if(observer){

        observer.disconnect();

    }

    observer = new IntersectionObserver(

        entries=>{

            entries.forEach(entry=>{

                if(!entry.isIntersecting){

                    return;

                }

                entry.target.classList.add(

                    "loaded"

                );

                observer.unobserve(

                    entry.target

                );

            });

        },

        {

            rootMargin:"100px",

            threshold:.1

        }

    );

    document

    .querySelectorAll(

        ".lazy-image"

    )

    .forEach(img=>{

        if(img.complete){

            img.classList.add(

                "loaded"

            );

        }

        else{

            img.addEventListener(

                "load",

                ()=>{

                    img.classList.add(

                        "loaded"

                    );

                },

                {

                    once:true

                }

            );

        }

        observer.observe(img);

    });

}

/*=========================================================
SCROLL UI
=========================================================*/

function updateScrollUI(){

    const top =

        document.documentElement.scrollTop ||

        document.body.scrollTop;

    const height =

        document.documentElement.scrollHeight -

        document.documentElement.clientHeight;

    const progress =

        height > 0

        ? (top / height) * 100

        : 0;

    progressBar.style.width =

        progress + "%";

    if(top > 400){

        scrollTopButton.classList.add(

            "show"

        );

    }

    else{

        scrollTopButton.classList.remove(

            "show"

        );

    }

    revealAnimations();

}

/*=========================================================
SCROLL ANIMATIONS
=========================================================*/

function revealAnimations(){

    document

    .querySelectorAll(

        ".fade-up,.fade-in"

    )

    .forEach(element=>{

        const rect =

        element.getBoundingClientRect();

        if(

            rect.top <

            window.innerHeight - 80

        ){

            element.classList.add(

                "visible"

            );

        }

    });

}

/*=========================================================
KEYBOARD SHORTCUTS
=========================================================*/

document.addEventListener(

    "keydown",

    event=>{

        const key =

        event.key.toLowerCase();

        if(

            key === "/"

        ){

            event.preventDefault();

            searchInput.focus();

        }

        if(

            key === "escape"

        ){

            closeBuildPopup();

        }

        if(

            key === "m"

            &&

            event.altKey

        ){

            navMenu.classList.toggle(

                "open"

            );

        }

        if(

            key === "t"

            &&

            event.altKey

        ){

            window.scrollTo({

                top:0,

                behavior:"smooth"

            });

        }

    }

);

/*=========================================================
PWA
=========================================================*/

function registerServiceWorker(){

    if(

        "serviceWorker"

        in

        navigator

    ){

        window.addEventListener(

            "load",

            ()=>{

                navigator

                .serviceWorker

                .register(

                    "service-worker.js"

                )

                .catch(

                    console.error

                );

            }

        );

    }

}

/*=========================================================
HASH SUPPORT
=========================================================*/

window.addEventListener(

    "load",

    ()=>{

        if(

            !location.hash.startsWith(

                "#weapon-"

            )

        ){

            return;

        }

        const id =

        Number(

            location.hash.replace(

                "#weapon-",

                ""

            )

        );

        const weapon =

        weapons.find(

            w=>w.id===id

        );

        if(

            weapon

        ){

            openBuildPopup(

                weapon

            );

        }

    }

);

/*=========================================================
AUTO SAVE
=========================================================*/

window.addEventListener(

    "beforeunload",

    ()=>{

        saveDatabase();

        saveFavorites();

        saveCompare();

    }

);

/*=========================================================
SMOOTH NAVIGATION
=========================================================*/

document

.querySelectorAll(

    'a[href^="#"]'

)

.forEach(link=>{

    link.addEventListener(

        "click",

        event=>{

            const target =

            document.querySelector(

                link.getAttribute(

                    "href"

                )

            );

            if(

                !target

            ){

                return;

            }

            event.preventDefault();

            target.scrollIntoView({

                behavior:"smooth",

                block:"start"

            });

            navMenu.classList.remove(

                "open"

            );

        }

    );

});

/*=========================================================
INITIAL VISIBILITY
=========================================================*/

requestAnimationFrame(

    ()=>{

        revealAnimations();

        updateScrollUI();

    }

);

/*=========================================================
END OF PART 5
=========================================================*/
