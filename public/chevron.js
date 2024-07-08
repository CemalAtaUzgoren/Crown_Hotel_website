//show nav bar on mobile view
function toggleNav () {
    let links = document.querySelector(".mainNav");
    links.classList.toggle("showNav");
}

let chevron = document.querySelector("#chevron");
chevron.addEventListener('click', toggleNav);