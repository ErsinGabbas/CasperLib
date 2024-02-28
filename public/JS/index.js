localStorage.setItem("marcdownTheme", "dark");

let bookContainer = document.querySelector(".search");
let searchBooks = document.getElementById("search-box");

const getBooks = async (book) => {
  const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${book}`
  );
  return await response.json();
};

const API_KEY = '5e0e8afe62mshdb3e5e8d2b47bb8p1bc37djsn7cd8a82f7ad3';

fetch('https://deep-translate1.p.rapidapi.com/language/translate/v2', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-RapidAPI-Key': API_KEY,
    'X-RapidAPI-Host': 'deep-translate1.p.rapidapi.com'
  },
  body: JSON.stringify({
    q: 'Hello, world!',
    source: 'en',
    target: 'ru'
  })
})
    .then(response => response.json())
    .then(data => {
      console.log(data);
    })
    .catch(error => {
      console.error('Error:', error);
    });

const translateText = async (text, sourceLang, targetLang) => {
  try {
    const response = await fetch('https://deep-translate1.p.rapidapi.com/language/translate/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': 'deep-translate1.p.rapidapi.com'
      },
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang
      })
    });

    if (!response.ok) {
      throw new Error('Failed to translate text');
    }

    const data = await response.json();
    return data.data.translations[0].translatedText;
  } catch (error) {
    console.error('Error translating text:', error);
    throw error;
  }
};

translateText('Hello, world!', 'en', 'es')
    .then(translatedText => {
      console.log('Translated text:', translatedText);
    })
    .catch(error => {
      console.error('Translation error:', error);
    });

async function translate(text) {
  try {
    const response = await fetch('/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: text }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error: ', error);
  }
}

const extractThumbnail = ({ imageLinks }) => {
  const DEFAULT_THUMBNAIL = "public/icons/logo.svg";
  if (!imageLinks || !imageLinks.thumbnail) {
    return DEFAULT_THUMBNAIL;
  }
  return imageLinks.thumbnail.replace("http://", "https://");
};

const drawChartBook = async (subject, startIndex = 0) => {
  let cbookContainer = document.querySelector(`.${subject}`);
  if (!cbookContainer) {
    console.error(`Element with class '${subject}' not found`);
    return;
  }
  cbookContainer.innerHTML = `<div class='prompt'><div class="loader"></div></div>`;
  const cdata = await getBooks(
      `subject:${subject}&startIndex=${startIndex}&maxResults=6`
  );
  if (cdata.error) {
    cbookContainer.innerHTML = `<div class='prompt'>ツ Limit exceeded! Try after some time</div>`;
  } else if (cdata.totalItems === 0) {
    cbookContainer.innerHTML = `<div class='prompt'>ツ No results, try a different term!</div>`;
  } else if (cdata.totalItems === undefined) {
    cbookContainer.innerHTML = `<div class='prompt'>ツ Network problem!</div>`;
  } else if (!cdata.items || cdata.items.length === 0) {
    cbookContainer.innerHTML = `<div class='prompt'>ツ There is no more result!</div>`;
  } else {
    for (let i in cdata.items) {
      cdata.items[i].volumeInfo.title = await translate(cdata.items[i].volumeInfo.title);
      cdata.items[i].volumeInfo.authors = await translate(cdata.items[i].volumeInfo.authors);
    }
    cbookContainer.innerHTML = await cdata.items
        .map(
            ({ volumeInfo }) =>
                `<div class='book' style='background: linear-gradient(` +
                getRandomColor() +
                `, rgba(0, 0, 0, 0));'><a href='${volumeInfo.previewLink}' target='_blank'><img class='thumbnail' src='` +
                extractThumbnail(volumeInfo) +
                `' alt='cover'></a><div class='book-info'><h3 class='book-title'><a href='${volumeInfo.previewLink}' target='_blank'>${volumeInfo.title}</a></h3><div class='book-authors' onclick='updateFilter(this,"author");'>${volumeInfo.authors}</div><div class='info' onclick='updateFilter(this,"subject");' style='background-color: ` +
                getRandomColor() +
                `;'>` +
                (volumeInfo.categories === undefined
                    ? "Others"
                    : volumeInfo.categories) +
                `</div></div></div>`
        )
        .join("");
  }
};

const drawListBook = async () => {
  if (searchBooks.value !== "") {
    bookContainer.style.display = "flex";
    bookContainer.innerHTML = `<div class='prompt'><div class="loader"></div></div>`;
    const data = await getBooks(`${searchBooks.value}&maxResults=6`);
    if (data.error) {
      bookContainer.innerHTML = `<div class='prompt'>ツ Limit exceeded! Try after some time</div>`;
    } else if (data.totalItems === 0) {
      bookContainer.innerHTML = `<div class='prompt'>ツ No results, try a different term!</div>`;
    } else if (data.totalItems === undefined) {
      bookContainer.innerHTML = `<div class='prompt'>ツ Network problem!</div>`;
    } else {
      bookContainer.innerHTML = data.items
          .map(
              ({ volumeInfo }) =>
                  `<div class='book' style='background: linear-gradient(` +
                  getRandomColor() +
                  `, rgba(0, 0, 0, 0));'><a href='${volumeInfo.previewLink}' target='_blank'><img class='thumbnail' src='` +
                  extractThumbnail(volumeInfo) +
                  `' alt='cover'></a><div class='book-info'><h3 class='book-title'><a href='${volumeInfo.previewLink}' target='_blank'>${volumeInfo.title}</a></h3><div class='book-authors' onclick='updateFilter(this,"author");'>${volumeInfo.authors}</div><div class='info' onclick='updateFilter(this,"subject");' style='background-color: ` +
                  getRandomColor() +
                  `;'>` +
                  (volumeInfo.categories === undefined
                      ? "Others"
                      : volumeInfo.categories) +
                  `</div></div></div>`
          )
          .join("");
    }
  } else {
    bookContainer.style.display = "none";
  }
};

const updateFilter = ({ innerHTML }, f) => {
  document.getElementById("main").scrollIntoView({
    behavior: "smooth",
  });
  let m;
  switch (f) {
    case "author":
      m = "inauthor:";
      break;
    case "subject":
      m = "subject:";
      break;
  }
  searchBooks.value = m + innerHTML;
  debounce(drawListBook, 1000);
};

const debounce = (fn, time, to = 0) => {
  to ? clearTimeout(to) : (to = setTimeout(drawListBook, time));
};

if (searchBooks) {
  searchBooks.addEventListener("input", () => debounce(drawListBook, 1000));
}

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('search-button');

  if (!searchInput || !searchButton) {
    console.error('Search input or button not found in the DOM.');
    return;
  }

  searchButton.addEventListener('click', async () => {
    const searchTerm = searchInput.value.trim();
    if (searchTerm === '') {
      // Display error message on the page instead of alert
      const errorMessage = document.createElement('div');
      errorMessage.textContent = 'Please enter a search query';
      errorMessage.classList.add('error-message');
      // Append the error message before the search input
      searchInput.parentNode.insertBefore(errorMessage, searchInput.nextSibling);
      return;
    }
  });


  searchBox.addEventListener('input', async () => {
    const searchTerm = searchBox.value.trim();
    if (searchTerm.length === 0) {
      resultsContainer.innerHTML = '';
      return;
    }

    try {
      const response = await fetch(`/search?term=${searchTerm}`);
      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }

      const data = await response.json();

      if (data && data.results) {
        const resultsHTML = data.results.map(result => {
          return `<div class="result">${result.title}</div>`;
        }).join('');
        resultsContainer.innerHTML = resultsHTML;
      } else {
        resultsContainer.innerHTML = '<div class="no-results">No results found</div>';
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
      resultsContainer.innerHTML = '<div class="error">Error fetching search results</div>';
    }
  });

  const displayResults = (results) => {
    resultsContainer.innerHTML = '';

    if (results.length === 0) {
      resultsContainer.innerHTML = '<p>No results found</p>';
      return;
    }

    results.forEach(book => {
      const bookElement = document.createElement('div');
      bookElement.classList.add('book');

      const title = document.createElement('h2');
      title.textContent = book.volumeInfo.title;

      const authors = document.createElement('p');
      authors.textContent = `Authors: ${book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'Unknown'}`;

      const thumbnail = document.createElement('img');
      thumbnail.src = book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.thumbnail : 'https://via.placeholder.com/100';
      thumbnail.alt = 'Book cover';

      const previewLink = document.createElement('a');
      previewLink.href = book.volumeInfo.previewLink;
      previewLink.textContent = 'Preview';

      bookElement.appendChild(thumbnail);
      bookElement.appendChild(title);
      bookElement.appendChild(authors);
      bookElement.appendChild(previewLink);

      resultsContainer.appendChild(bookElement);
    });
  };
});

document.addEventListener("DOMContentLoaded", () => {
  const fictionContainer = document.createElement("div");
  fictionContainer.classList.add("fiction");
  document.body.appendChild(fictionContainer);

  const poetryContainer = document.createElement("div");
  poetryContainer.classList.add("poetry");
  document.body.appendChild(poetryContainer);

  const fantasyContainer = document.createElement("div");
  fantasyContainer.classList.add("fantasy");
  document.body.appendChild(fantasyContainer);

  const romanceContainer = document.createElement("div");
  romanceContainer.classList.add("romance");
  document.body.appendChild(romanceContainer);
});

let mainNavLinks = document.querySelectorAll(".scrolltoview");
window.addEventListener("scroll", (event) => {
  let fromTop = window.scrollY + 64;
  mainNavLinks.forEach(({ hash, classList }) => {
    let section = document.querySelector(hash);
    if (
        section.offsetTop <= fromTop &&
        section.offsetTop + section.offsetHeight > fromTop
    ) {
      classList.add("current");
    } else {
      classList.remove("current");
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const userDropdown = document.getElementById('user-dropdown');
  const userDropdownMenu = document.getElementById('user-dropdown-menu');

  userDropdown.addEventListener('click', () => {
    userDropdownMenu.classList.toggle('show');
  });
});

  window.addEventListener('click', (event) => {
    if (!event.target.matches('#user-dropdown-btn')) {
      const dropdowns = document.getElementsByClassName('dropdown-content');
      for (const dropdown of dropdowns) {
        if (dropdown.classList.contains('show')) {
          dropdown.classList.remove('show');
        }
      }
    }
});


const getRandomColor = () =>
    `#${Math.floor(Math.random() * 16777215).toString(16)}40`;
const toggleSwitch = document.querySelector(
    '.theme-switch input[type="checkbox"]'
);

if (localStorage.getItem("marcdownTheme") === "dark") {
  document.documentElement.setAttribute("data-theme", "dark");
  document
      .querySelector("meta[name=theme-color]")
      .setAttribute("content", "#090b28");
  toggleSwitch.checked = true;
  localStorage.setItem("marcdownTheme", "dark");
} else {
  document.documentElement.setAttribute("data-theme", "light");
  document
      .querySelector("meta[name=theme-color]")
      .setAttribute("content", "#ffffff");
  toggleSwitch.checked = false;
  localStorage.setItem("marcdownTheme", "light");
}
const switchTheme = ({ target }) => {
  if (target.checked) {
    document.documentElement.setAttribute("data-theme", "dark");
    document
        .querySelector("meta[name=theme-color]")
        .setAttribute("content", "#090b28");
    localStorage.setItem("marcdownTheme", "dark");
  } else {
    document.documentElement.setAttribute("data-theme", "light");
    document
        .querySelector("meta[name=theme-color]")
        .setAttribute("content", "#ffffff");
    localStorage.setItem("marcdownTheme", "light");
  }
};
toggleSwitch.addEventListener("change", switchTheme, false);
let startIndex = 0;

const next = (subject) => {
  startIndex += 6;
  if (startIndex >= 0) {
    document.getElementById(`${subject}-prev`).style.display = "inline-flex";
    drawChartBook(subject, startIndex);
  } else {
    document.getElementById(`${subject}-prev`).style.display = "none";
  }
};

const prev = (subject) => {
  startIndex -= 6;
  if (startIndex <= 0) {
    startIndex = 0;
    drawChartBook(subject, startIndex);
    document.getElementById(`${subject}-prev`).style.display = "none";
  } else {
    document.getElementById(`${subject}-prev`).style.display = "inline-flex";
    drawChartBook(subject, startIndex);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const dropdownMenu = toggle.nextElementSibling;
      dropdownMenu.classList.toggle('show');
    });
  });

  document.addEventListener('click', (event) => {
    dropdownToggles.forEach(toggle => {
      const dropdownMenu = toggle.nextElementSibling;
      if (!toggle.contains(event.target) && !dropdownMenu.contains(event.target)) {
        dropdownMenu.classList.remove('show');
      }
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const logoutLink = document.getElementById('logout-link');

  if (!logoutLink) {
    console.error('Logout link not found in the DOM.');
    return;
  }

  logoutLink.addEventListener('click', async () => {
    try {
      const response = await fetch('/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        // Redirect to the login page after successful logout
        window.location.href = '/login';
      } else {
        console.error('Logout failed:', response.statusText);
        alert('Logout failed. Please try again.');
      }
    } catch (error) {
      console.error('Error logging out:', error);
      alert('An error occurred while logging out. Please try again later.');
    }
  });
});




const modal = document.querySelector(".modal");
const toggleModal = () => modal.classList.toggle("show-modal");
const windowOnClick = ({ target }) => {
  if (target === modal) {
    toggleModal();
  }
};
if (modal) {
  modal.addEventListener("click", windowOnClick);
}