const mybtn = document.getElementById("btn");
const mytxt = document.getElementById("txt");
const reposPerPageSelect = document.getElementById("reposPerPage");
const repoDiv = document.getElementById("repoDiv");
const paginationDiv = document.getElementById("pagination");

let currentPage = 1;
let totalPages = 1;
let totalRepos = 0;
let reposPerPage = 9;

for (let i = 1; i <= 100; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.text = i;
    reposPerPageSelect.appendChild(option);
}

reposPerPageSelect.value = 9;

mytxt.value = "rajtilak16";

mybtn.addEventListener("click", () => {
    currentPage = 1;
    reposPerPage = reposPerPageSelect.value;
    fetchTotalRepos();
    userDetails()
});

reposPerPageSelect.addEventListener("change", () => {
    currentPage = 1;
    reposPerPage = reposPerPageSelect.value;
    fetchRepos();
});


async function fetchTotalRepos() {
    const username = mytxt.value;
    const url = `https://api.github.com/users/${username}/repos?per_page=1`;
     try {
      
        const res = await fetch(url);
        const linkHeader = res.headers.get("Link");

        if (linkHeader) {
            totalPages = Number(linkHeader.split(',').find(s => s.includes('rel="last"'))?.split('&page=')[1]?.split('>')[0]) || 1;
        }

        const totalReposUrl = `https://api.github.com/users/${username}`;
        const totalReposRes = await fetch(totalReposUrl);
        const userData = await totalReposRes.json();
        totalRepos = userData.public_repos;

        if (reposPerPage > totalRepos) {
            alert(`You have ${totalRepos} repositories. Please select a value less than or equal to ${totalRepos}.`);
            return;
        }

        fetchRepos();
    } catch (error) {
        console.log("Error occurred while fetching total repos", error);
    }
}

async function fetchRepos() {
    const username = mytxt.value;
    const url = `https://api.github.com/users/${username}/repos?page=${currentPage}&per_page=${reposPerPage}`;

    try {
        repoDiv.innerHTML = '<div class="loader"></div>';
        const res = await fetch(url);
        const data = await res.json();
        repoDiv.innerHTML = "";
        paginationDiv.innerHTML = "";

        if (Array.isArray(data)) {
            data.forEach(repo => {
                const repoCard = document.createElement("div");
                repoCard.classList.add("repo-card");
                repoCard.innerHTML = `
                <div style="text-align: center; text-decoration: underline;">
                    <div class="one" style="font-size: 20px; font-weight: 700px">
                        <h3>${repo.name}</h3>
                    </div>
                    <div class="two">
                        <p>${repo.description || "No description available"}</p>
                    </div>
                    <div class="three">
                        <p><span class="top">Topics:</span> ${repo.languages ? Object.keys(repo.languages).join(", ") || "Not specified" : "Not specified"}</p>
                    </div>
                </div>
                `;
                repoDiv.appendChild(repoCard);
            });

    
const maxVisiblePages = 5;

let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
}

if (currentPage > 1) {
    const prevLink = createPageLink("Previous", currentPage - 1);
    paginationDiv.appendChild(prevLink);
}

for (let i = startPage; i <= endPage; i++) {
    const pageLink = createPageLink(i, i);
    if (i === currentPage) {
        pageLink.classList.add("active"); 
    }
    paginationDiv.appendChild(pageLink);
}

if (currentPage < totalPages) {
    const nextLink = createPageLink("Next", currentPage + 1);
    paginationDiv.appendChild(nextLink);
}
        } else {
            console.log("Invalid data format received:", data);
        }
    } catch (error) {
        console.log("Error occurred", error);
    } finally {
        const loader = document.querySelector('.loader');
        if (loader) {
            loader.style.display = "none";
        }
    }
}

function createPageLink(text, page) {
    const pageLink = document.createElement("a");
    pageLink.classList.add("page-link");
    pageLink.textContent = text;
    pageLink.addEventListener("click", () => {
        currentPage = page;
        fetchRepos();
    });
    return pageLink;
}

async function userDetails(){
    const username = mytxt.value;
    const userUrl = `https://api.github.com/users/${username}`;
    try{
        const repoRes = await fetch(userUrl);
        const userData = await repoRes.json();
        console.log(userData);
        displayUserDetails(userData)
    }
    catch(error){
       console.log(error)
    }
}

function displayUserDetails(userData) {
    const detailsDiv = document.querySelector('.details');
    detailsDiv.innerHTML = `
    <div class="innerDetails">
    <div class="topDiv" style="display: flex">
        <div class="picDiv" style="padding: 20px">
        <img src="${userData.avatar_url}" alt="User Image" style="width: 100px; height: 100px; border-radius: 50%;">
        </div>
        <div class="dataDiv" style="display: flex; flex-direction: column; align-items: center; justify-content: center">
        <h2>${userData.name}</h2>
        <p class="txt">${userData.bio || "No description available"}</p>
        </div>
    </div>
    <div class="github_link" style="text-align: center">
        <p class="txt"><a href="${userData.html_url}" target="_blank"><i class="fas fa-link"></i> https://github.com/${userData.login}</a></p>
        </div>
    </div>
    `;
}

fetchTotalRepos();
userDetails()
