document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form")
  const successMessage = document.getElementById("formSuccess")

  if (form && successMessage) {
    form.addEventListener("submit", (event) => {
      event.preventDefault()
      successMessage.style.display = "block"
      form.style.display = "none"
      form.reset()
    })
  }

  const projectList = document.getElementById("project-list")
  let projectsLoaded = false

  async function fetchProjects() {
    if (projectsLoaded) return
    projectsLoaded = true
    projectList.innerHTML = ""
    try {
      const response = await fetch("https://api.github.com/users/hiennq1701/repos", {
        headers: {
          Authorization:
            "token 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",
        },
      })
      const repos = await response.json()
      repos.forEach((repo) => {
        const projectItem = document.createElement("div")
        projectItem.className = "project-item"
        projectItem.innerHTML = `
                    <h3><a href="${repo.html_url}" target="_blank">${repo.name}</a></h3>
                    <p>${repo.description || "Không có mô tả"}</p>
                    <p>⭐ ${repo.stargazers_count}</p>
                    <p>Ngôn ngữ: ${repo.language || "Không xác định"}</p>
                `
        projectList.appendChild(projectItem)
      })
    } catch (error) {
      projectList.innerHTML = "<p>Không thể tải dự án từ GitHub.</p>"
    }
  }

  if (projectList) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            fetchProjects()
            observer.disconnect()
          }
        })
      },
      { threshold: 0.1 },
    )
    observer.observe(projectList)
  }
})

// Theme switching functionality
function initializeThemeSwitch() {
  const toggleSwitches = document.querySelectorAll('.theme-switch input[type="checkbox"]')
  const currentTheme = localStorage.getItem("theme")
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)")

  toggleSwitches.forEach((toggleSwitch) => {
    if (currentTheme) {
      document.documentElement.setAttribute("data-theme", currentTheme)
      if (currentTheme === "dark") {
        toggleSwitch.checked = true
      }
    } else if (prefersDarkScheme.matches) {
      document.documentElement.setAttribute("data-theme", "dark")
      toggleSwitch.checked = true
    }

    function switchTheme(e) {
      if (e.target.checked) {
        document.documentElement.setAttribute("data-theme", "dark")
        localStorage.setItem("theme", "dark")
      } else {
        document.documentElement.setAttribute("data-theme", "light")
        localStorage.setItem("theme", "light")
      }

      // Sync all theme switches
      toggleSwitches.forEach((switchElement) => {
        switchElement.checked = e.target.checked
      })
    }

    toggleSwitch.addEventListener("change", switchTheme)
  })
}

// Language switching functionality
const translations = {
  vi: {
    home: "Trang chủ",
    projects: "Dự án",
    skills: "Kĩ năng",
    contact: "Liên hệ",
    title: "Xin chào👋, mình là<br>Ngô Quang Hiển!",
    intro:
      "Chào mừng bạn đến với portfolio của mình!<br>Mình đang là sinh viên năm 2 tại Hà Nội,<br>học tại trường cao đẳng FPT Polyschool,<br>chuyên ngành phát triển phần mềm.",
    search: "Tìm kiếm dự án...",
    name: "Tên:",
    email: "Email:",
    message: "Lời nhắn:",
    send: "Gửi",
    thankYou: "Cảm ơn bạn đã gửi thông tin liên hệ!",
  },
  en: {
    home: "Home",
    projects: "Projects",
    skills: "Skills",
    contact: "Contact",
    title: "Hello👋, I'm<br>Ngô Quang Hiển!",
    intro:
      "Welcome to my portfolio!<br>I am a 2nd-year student in Hanoi,<br>studying at FPT Polyschool,<br>majoring in Software Development.",
    search: "Search projects...",
    name: "Name:",
    email: "Email:",
    message: "Message:",
    send: "Send",
    thankYou: "Thank you for contacting me!",
  },
}

let currentLang = localStorage.getItem("language") || "vi"

// Function to detect user's country
async function detectUserCountry() {
  try {
    const response = await fetch("https://api.country.is/", {
      timeout: 5000,
    })
    const data = await response.json()
    return data.country
  } catch (error) {
    console.log("Could not detect country, using default language")
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (timezone.includes("Asia/Ho_Chi_Minh") || timezone.includes("Asia/Bangkok")) {
      return "VN"
    }
    return null
  }
}

// Function to set language
function setLanguage(lang) {
  currentLang = lang
  localStorage.setItem("language", lang)
  document.documentElement.lang = lang

  document.querySelectorAll("[data-lang]").forEach((element) => {
    const key = element.getAttribute("data-lang")
    if (translations[lang][key]) {
      if (element.tagName === "INPUT" && element.type === "text") {
        element.placeholder = translations[lang][key]
      } else {
        element.innerHTML = translations[lang][key]
      }
    }
  })

  const langTexts = document.querySelectorAll(".lang-text")
  langTexts.forEach((langText) => {
    langText.textContent = lang === "vi" ? "EN" : "VI"
  })
}

// Initialize language based on user's country
async function initializeLanguage() {
  try {
    const country = await detectUserCountry()
    if (country && country !== "VN") {
      setLanguage("en")
    } else {
      setLanguage(currentLang)
    }
  } catch (error) {
    setLanguage(currentLang)
  }
}

// Language toggle button click handlers
function initializeLanguageSwitch() {
  const langToggles = document.querySelectorAll("#langToggle, #langToggleDesktop")

  langToggles.forEach((langToggle) => {
    langToggle.addEventListener("click", () => {
      const newLang = currentLang === "vi" ? "en" : "vi"
      setLanguage(newLang)
    })
  })
}

// Initialize language and theme
initializeLanguage()
initializeThemeSwitch()
initializeLanguageSwitch()

// GitHub API integration for projects
async function fetchGitHubRepos() {
  try {
    const response = await fetch("https://api.github.com/users/hiennq1701/repos")
    const repos = await response.json()
    displayProjects(repos)
  } catch (error) {
    console.error("Error fetching GitHub repos:", error)
  }
}

function displayProjects(repos) {
  const projectList = document.getElementById("project-list")
  const searchInput = document.getElementById("projectSearch")

  if (!projectList || !searchInput) return

  function filterAndDisplayProjects(repos) {
    const searchTerm = searchInput.value.toLowerCase()

    const filteredRepos = repos.filter((repo) => {
      return repo.name.toLowerCase().includes(searchTerm) || repo.description?.toLowerCase().includes(searchTerm)
    })

    projectList.innerHTML = ""
    filteredRepos.forEach((repo) => {
      const projectCard = document.createElement("div")
      projectCard.className = "project-card"
      projectCard.innerHTML = `
                <h3><a href="${repo.html_url}" target="_blank">${repo.name}</a></h3>
                <p>${repo.description || ""}</p>
                <div class="project-meta">
                    <span><i class="fas fa-star"></i> ${repo.stargazers_count}</span>
                    <span><i class="fas fa-code-branch"></i> ${repo.language || "N/A"}</span>
                </div>
            `
      projectList.appendChild(projectCard)
    })
  }

  searchInput.addEventListener("input", () => {
    filterAndDisplayProjects(repos)
  })
}

// Contact form handling
const contactForm = document.getElementById("contact-form")
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault()
    const form = e.target
    const successMessage = document.getElementById("formSuccess")

    if (successMessage) {
      form.submit()
      successMessage.style.display = "block"
      form.reset()
      setTimeout(() => {
        successMessage.style.display = "none"
      }, 3000)
    }
  })
}

// Initialize projects
fetchGitHubRepos()

// Intersection Observer for lazy loading
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible")
      }
    })
  },
  {
    threshold: 0.1,
  },
)

document.querySelectorAll(".section").forEach((section) => {
  sectionObserver.observe(section)
})

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault()
    const target = document.querySelector(this.getAttribute("href"))
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
      })

      // Close mobile menu after clicking a link
      const menu = document.getElementById("menu")
      if (menu && menu.classList.contains("active")) {
        menu.classList.remove("active")
        const menuToggle = document.getElementById("menuToggle")
        if (menuToggle) {
          menuToggle.style.transform = "translateY(-50%) rotate(0deg)"
        }
      }
    }
  })
})

// Clear button functionality
const clearBtn = document.querySelector(".clear-btn")
if (clearBtn) {
  clearBtn.addEventListener("click", () => {
    const form = document.getElementById("contact-form")
    if (form) {
      form.reset()
      const successMessage = document.getElementById("formSuccess")
      if (successMessage) {
        successMessage.style.display = "none"
      }
      form.style.display = ""
    }
  })
}

// Mobile menu toggle with smooth animation
const menuToggle = document.getElementById("menuToggle")
const menu = document.getElementById("menu")

if (menuToggle && menu) {
  menuToggle.addEventListener("click", (e) => {
    e.stopPropagation()
    menu.classList.toggle("active")

    // Add rotation animation to menu toggle
    if (menu.classList.contains("active")) {
      menuToggle.style.transform = "translateY(-50%) rotate(90deg)"
    } else {
      menuToggle.style.transform = "translateY(-50%) rotate(0deg)"
    }
  })
}

// Close mobile menu when clicking outside
document.addEventListener("click", (e) => {
  if (menu && menuToggle) {
    if (!menu.contains(e.target) && !menuToggle.contains(e.target)) {
      menu.classList.remove("active")
      menuToggle.style.transform = "translateY(-50%) rotate(0deg)"
    }
  }
})

// Prevent menu from closing when clicking inside it
if (menu) {
  menu.addEventListener("click", (e) => {
    e.stopPropagation()
  })
}
