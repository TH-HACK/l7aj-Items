let hasRun = false;
const webpsPerPage = 200;
let itemData;
let gl_ob47_added_itemData;
let gl_ob46_added_itemData;
let totalPages;
let currentPage = 1;
let cdn_img_json;
let pngs_json_list;
const bodyElement = document.body;
const extra_set = document.getElementById("extra_set")
extra_set.classList.remove("collapsed2");
extra_set.classList.add("expanded2");
const notFoundText = () => document.getElementById('not_found_text');

// Fetch data from multiple JSON files concurrently using Promise.all
Promise.all([
  // Fetching 'cdn.json' and parsing it as JSON
  fetch('assets/cdn.json').then(response => response.json()),
  // Fetching 'pngs.json' and parsing it as JSON
  fetch('https://cdn.jsdelivr.net/gh/jinix6/ff-resources@refs/heads/main/pngs/300x300/list.json').then(response => response.json()),
  // Fetching 'itemData.json' and parsing it as JSON
  fetch('assets/itemData.json').then(response => response.json()),
  // Fetching 'ob47_added_itemData.json' and parsing it as JSON
  fetch('assets/ob47_added_itemData.json').then(response => response.json()),

  fetch('assets/ob46_added_itemData.json').then(response => response.json())
])
  .then(([cdnData, pngsData, itemDatar, ob47_added_itemData, ob46_added_itemData]) => {
    // Assign the fetched data to global variables for further use
    cdn_img_json = cdnData.reduce((map, obj) => Object.assign(map, obj), {});
    pngs_json_list = pngsData; // Contains data from 'pngs.json'
    itemData = itemDatar; // Contains data from 'itemData.json'
    gl_ob47_added_itemData = ob47_added_itemData; // Contains data from 'ob47_added_itemData.json'
    gl_ob46_added_itemData = ob46_added_itemData;
    // Display the first page of data, passing itemDatar and an empty string as arguments
    displayPage(1, '', itemDatar);
    // Execute additional logic based on URL parameters or other conditions
    check_parameter();
  })
  .catch(error => {
    // Log any errors encountered during the fetch or processing
    console.error('Error fetching data:', error);
  });




const encrypt = (longUrl) => {
  const encodedUrl = btoa(longUrl);
  return encodedUrl;
};
const decrypt = function(shortUrl) {
  return atob(shortUrl);
};

function addParameterWithoutRefresh(param, value) {
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.set(param, value);
  const newUrl = `${window.location.origin}${window.location.pathname}?${urlParams.toString()}`;
  history.pushState({ path: newUrl }, '', newUrl);
}

function getUrlWithoutParameters() {
  const newUrl = `${window.location.origin}${window.location.pathname}`;
  return newUrl;
}

function check_parameter() {
  if (!hasRun) {
    const urlParams = new URLSearchParams(window.location.search);
    const icon = urlParams.get('icon');
    if (icon !== null) {
      const input = document.getElementById('input_d');
      input.value = decrypt(icon);
      search(decrypt(icon));
    } else {}
    hasRun = true;
  }
}

function updateUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('icon') && urlParams.get('icon') === '') {
    urlParams.delete('icon');
    const newUrl = `${window.location.origin}${window.location.pathname}?${urlParams.toString()}`;
    history.pushState({ path: newUrl }, '', newUrl);
  }
}

function Share_tg() {
  var iconName = document.getElementById('dialog_tittle_pp').textContent.replace("Icon Name: ", "");  
  var url = getUrlWithoutParameters() + "?icon=" + encrypt(iconName);
  var message = "Title: `" + document.getElementById('dialog_tittle').textContent + "`\nID: `" + document.getElementById('dialog_tittle_p').textContent.replace("Id: ", "") + "`\nIcon Name: `" + iconName + "`\n\nView: " + url;
  window.open("https://t.me/share/url?url=" + encodeURIComponent(message) + "&text=");
}
function filterWebpsBySearch(webps, searchTerm) {
  return webps.filter(webp =>
    webp.toLowerCase().includes(searchTerm.toLowerCase())
  );
}

function filterItemsBySearch(items, searchTerm) {
  return items.filter(item =>
    Object.keys(item).some(key =>
      item[key].toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
}

async function displayPage(pageNumber, searchTerm, webps) {
  current_data = webps;
  const filteredItems = filterItemsBySearch(webps, searchTerm);
  const startIdx = (pageNumber - 1) * webpsPerPage;
  const endIdx = Math.min(startIdx + webpsPerPage, filteredItems.length);
  const webpGallery = document.getElementById('webpGallery');
  const fragment = document.createDocumentFragment(); // Use DocumentFragment for batch DOM updates
  webpGallery.innerHTML = ''; // Clear existing content
  for (let i = startIdx; i < endIdx; i++) {
    const item = filteredItems[i];
    const image = document.createElement("img");
    image.className = "image p-3 bounce-click ";
    image.loading = "lazy";
    image.id ="list_item_img"
    // Determine image source
    let imgSrc = "https://cdn.jsdelivr.net/gh/jinix6/ff-resources@refs/heads/main/pngs/300x300/UI_EPFP_unknown.png"
    if (pngs_json_list?.includes(item.icon + ".png")) {
      imgSrc = `https://cdn.jsdelivr.net/gh/jinix6/ff-resources@refs/heads/main/pngs/300x300/${item.icon}.png`;
    } else {
      const keyToFind = item.itemID.toString();
      const value = cdn_img_json[item.itemID.toString()] ?? null;
      if (value) imgSrc = value;
    }
    
    

    
    image.src = imgSrc;
    // Apply background color if description matches
    if (item.description === "Didn't have an ID and description.") {
      image.style.background = '#607D8B';
    }
    // Add click event listener
    image.addEventListener('click', () => show_item_info(item, imgSrc, image, fragment));
    // Append image to fragment
    fragment.appendChild(image);
  }
  webpGallery.appendChild(fragment); // Add all images at once
  totalPages = Math.ceil(filteredItems.length / webpsPerPage);
  renderPagination(searchTerm, webps); // Render pagination
  updateUrl(); // Update URL
}
function show_item_info(data, imgSrc, sharedElement, page1) {
  const targetElement = document.getElementById('cardimage');
  targetElement.src = '';
  targetElement.src = imgSrc;
  const page2 = document.getElementById('container_dialog');
  const page2_bg = document.getElementById('mainnnnn_bg');
  const { icon, description, description2, itemID } = data;
  const itemDetail = description2 ? `${description} - ${description2}` : description;
  ["mainnnnn_bg", "dialog_main_bg"].forEach(id => {document.getElementById(id).style.animation = "fadeIn 250ms 1 forwards";});
  const dialog_tittle = document.getElementById('dialog_tittle');
  const dialog_tittle_p = document.getElementById('dialog_tittle_p');
  const dialog_tittle_pp = document.getElementById('dialog_tittle_pp');
  dialog_tittle.textContent = itemDetail;
  dialog_tittle_p.textContent = `Id: ${itemID}`;
  dialog_tittle_pp.textContent = `Icon Name: ${icon}`;
  [dialog_tittle, dialog_tittle_p, dialog_tittle_pp].forEach((element, index) => {
    setTimeout(() => {
      element.classList.add("slide-top");
      element.classList.remove("slide-bottom");
    }, index * 200);
  });
  sharedElement.classList.add("touch-none")
  // Get the position and size of the shared element
  const startRect = sharedElement.getBoundingClientRect();
  const endRect = targetElement.getBoundingClientRect();
  // Clone the shared element
  const clone = sharedElement.cloneNode(true);
  document.body.appendChild(clone);
  // Style the clone to match the shared element
  gsap.set(clone, {
    position: 'absolute',
    top: startRect.top + window.scrollY,
    left: startRect.left + window.scrollX,
    width: startRect.width,
    height: startRect.height,
    zIndex: 10,
  });
  // Animate the clone to the target element's position and size
  gsap.to(clone, {
    duration: 0.5,
    top: endRect.top + window.scrollY,
    left: endRect.left + window.scrollX,
    width: endRect.width,
    height: endRect.height,
    ease: 'power2.inOut',
    onComplete: () => {
    },
  });
  document.getElementById("hide_dialg_btn").addEventListener('click', () => {
    sharedElement.classList.remove("touch-none");
    [dialog_tittle, dialog_tittle_p, dialog_tittle_pp].forEach((element, index) => {
    setTimeout(() => {
      element.classList.remove("slide-top");
      element.classList.add("slide-bottom");
      }, index * 100);
      });
    setTimeout(() =>{
      ["dialog_main_bg", "mainnnnn_bg"].forEach(id => document.getElementById(id).style.animation = "fadeOut 300ms 1 forwards");}, 250)
    gsap.to(clone, {
      duration: 0.5,
      top: startRect.top + window.scrollY,
      left: startRect.left + window.scrollX,
      width: startRect.width,
      height: startRect.height,
      ease: 'power2.inOut',
      onComplete: () => {
        clone.remove();
      },});
  })};


async function generate_pagination_numbers() {
  const pagination_Numbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pagination_Numbers.push(i);
  }
  return pagination_Numbers;
}

async function renderPagination(searchTerm, webps) {
  const paginationNumbers = await generate_pagination_numbers();
  const pagi73hd = document.getElementById("pagi73hd");
  if (paginationNumbers.length === 0) {
    pagi73hd.style.visibility = "hidden";
    if (!notFoundText()) {
      const notFoundText = document.createElement('h1');
      notFoundText.id = 'not_found_text';
      notFoundText.className = 'transition-all duration-100 ease-in-out mt-[10vh] font-black select-none space-mono-regular text-zinc-500 rotate-90 text-[1000%] w-[100vw] text-center whitespace-nowrap';
      notFoundText.innerText = 'NOT FOUND';
      document.getElementById("container").appendChild(notFoundText);
    }
  } else {
    pagi73hd.style.visibility = "visible";
    if (notFoundText()) {
      notFoundText().remove();
    }
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    paginationNumbers.forEach((pageNumber) => {
      const pageButton = document.createElement("button");
      pageButton.className = "px-[8%] bg-white border border-2 border-[#737373] bounce-click select-none rounded-full text-center space-mono-regular font-medium uppercase text-black disabled:pointer-events-none disabled:shadow-none";
      if (pageNumber === currentPage) {
        pageButton.classList.remove("bg-white", "text-black", "border", "border-2", "border-[#737373]");
        pageButton.classList.add("text-white", "bg-[#2B2B2B]");
      }
      pageButton.textContent = pageNumber;
      pageButton.addEventListener('click', async () => {
        await goToPage(pageNumber, searchTerm, webps);
      });
      pagination.appendChild(pageButton);
    });
  }
}

async function goToPage(pageNumber, searchTerm, webps) {
  if (pageNumber >= 1 && pageNumber <= totalPages) {
    currentPage = pageNumber;
    currentSearchTerm = searchTerm;
    await displayPage(currentPage, currentSearchTerm, webps);
  }
}
function search() {
  const keyword = document.getElementById("input_d").value
  addParameterWithoutRefresh('icon', encrypt(keyword));
  displayPage(1, keyword, current_data);
}

// Event listener to run the function when the DOM content is fully loaded
document.addEventListener('DOMContentLoaded', (event) => {
  // Add click event listener to the element with id "edge_btn"
  document.getElementById("edge_btn").addEventListener('click', () => {
    // Check if the body element has the class "collapsed"
    if (bodyElement.classList.contains("collapsed")) {
      // If it's collapsed, expand it by changing classes
      bodyElement.classList.remove("collapsed");
      extra_set.classList.add("expanded2");
      ["extra_set", "edge_bg"].forEach(id => {
        document.getElementById(id).style.animation = "fadeOut 250ms 1 forwards";
      });
    } else { // If the body is already expanded, collapse it
      ["extra_set", "edge_bg"].forEach(id => document.getElementById(id).style.animation = "fadeIn 250ms 1 forwards");
      bodyElement.classList.add("collapsed");
      extra_set.classList.remove("expanded2");
      extra_set.classList.add("collapsed2");

    }
  });
});
document.addEventListener('DOMContentLoaded', (event) => {
  document.getElementById("edge_bg").addEventListener('click', () => {
    bodyElement.classList.remove("collapsed");
    extra_set.classList.add("expanded2");
    ["extra_set", "edge_bg"].forEach(id => {
      document.getElementById(id).style.animation = "fadeOut 250ms 1 forwards";
    });
  });
});

// Define an object containing key-value pairs for link identifiers and their corresponding URLs
const links = {
  clgroup: "https://t.me/freefirecraftlandgroup", // Telegram group for Craftland
  clprogroup: "https://t.me/ffcsharezone", // Telegram group for sharing zone
  tg: "https://t.me/Crystal_Person", // Telegram link for a person
  gt: "https://github.com/jinix6" // GitHub profile link
  clprogroup1:"https://youtube.com/@l7aj.1m?si=l2LIIT2O5YnOkEEK" // link youtube l7aj
};
// Iterate over the entries of the 'links' object
Object.entries(links).forEach(([t, e]) => {
  // For each entry, add a 'click' event listener to the element with the corresponding ID
  document.getElementById(t).addEventListener("click", () => {
    // On click, open the associated URL in a new browser tab/window
    window.open(e);
  });
});


let current_data;
let all_tag_id = document.getElementById("AllItem_btn");
let ob46_tag_id = document.getElementById("Ob46Item_btn");
let ob47_tag_id = document.getElementById("Ob47Item_btn");
all_tag_id.classList.add("text-white", "bg-black");
[ob47_tag_id, ob46_tag_id].forEach(el => el.classList.add("text-black", "bg-white"));
function setData(element) {
  if (element.textContent === "ALL") {
    [ob47_tag_id, ob46_tag_id].forEach(el => el.classList.remove("text-white", "bg-black"));
    element.classList.add("text-white", "bg-black");
    displayPage(1, '', itemData)
  } else if (element.textContent === "OB46") {
    [ob47_tag_id, all_tag_id].forEach(el => el.classList.remove("text-white", "bg-black"));
    element.classList.add("text-white", "bg-black");
    displayPage(1, '', gl_ob46_added_itemData)
  } else if (element.textContent === "OB47") {
    [all_tag_id, ob46_tag_id].forEach(el => el.classList.remove("text-white", "bg-black"));
    element.classList.add("text-white", "bg-black");
    displayPage(1, '', gl_ob47_added_itemData)
  }
  const el = document.getElementById("webpGallery");
  el.classList.remove("slide-top");
  void el.offsetWidth;
  el.classList.add("slide-top");
}


 // Add Enter key listener to the input field
 document.getElementById('input_d').addEventListener('keydown', function(event) {
   if (event.key === 'Enter') { // Check if Enter key is pressed
     search(); // Call the search function
   }
 });
