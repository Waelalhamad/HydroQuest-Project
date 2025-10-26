/*******************************************************************************************************
 *                                                                                                      *
 *                                           Navbar                                                     *
 *                                                                                                      *
 *******************************************************************************************************/
const header = document.querySelector("header");
const navLinks = document.querySelectorAll(".nav-links li a");
const sections = document.querySelectorAll("section");

function onScroll() {
  let scrollTop = window.pageYOffset;

  if (scrollTop > 0) {
    header.classList.add("with-bg");
    navLinks.forEach((link) => link.classList.add("topLink"));
  } else {
    header.classList.remove("with-bg");
    navLinks.forEach((link) => link.classList.remove("topLink"));
  }

  // Update active nav link based on scroll position
  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute("id");

    if (
      scrollTop >= sectionTop - 50 &&
      scrollTop < sectionTop + sectionHeight - 50
    ) {
      navLinks.forEach((link) => {
        link.classList.remove("active-nav");
        if (link.getAttribute("href").includes(sectionId)) {
          link.classList.add("active-nav");
        }
      });
    }
  });
}

// Function to handle click event on nav links
function onClick(event) {
  navLinks.forEach((link) => link.classList.remove("active-nav"));
  event.target.classList.add("active-nav");
}

// Attach scroll event listener
window.addEventListener("scroll", onScroll);

// Attach click event listeners to nav links
navLinks.forEach((link) => {
  link.addEventListener("click", onClick);
});

/*******************************************************************************************************
 *                                                                                                      *
 *                                           Slider                                                     *
 *                                                                                                      *
 *******************************************************************************************************/

const sliderItems = document.querySelectorAll(".home .slide-list .slide-item");
const sliderPrev = document.querySelector(".slider-btn.prev");
const sliderNext = document.querySelector(".slider-btn.next");

let sliderCount = sliderItems.length;
let slideActive = 0;

let refreshInterval = setInterval(function () {
  nextSlide();
}, 6000);

function prevSlide() {
  slideActive = slideActive - 1;
  if (slideActive < 0) {
    slideActive = sliderCount - 1;
  }
  showSLider();
}

function nextSlide() {
  slideActive = slideActive + 1;
  if (slideActive >= sliderCount) {
    slideActive = 0;
  }
  showSLider();
}

function showSLider() {
  let slideActiveOld = document.querySelector(
    ".home .slide-list .active-slide"
  );

  slideActiveOld.classList.remove("active-slide");
  sliderItems[slideActive].classList.add("active-slide");

  clearInterval(refreshInterval);
  refreshInterval = setInterval(function () {
    nextSlide();
  }, 6000);

  // Reset Animation
  sliderItems[slideActive].querySelector("img").style.animation = "none";
  sliderItems[slideActive].querySelector("img").offsetHeight;
  sliderItems[slideActive].querySelector("img").style.animation = "";
}

/*******************************************************************************************************
 *                                                                                                      *
 *                                           Team Section                                               *
 *                                                                                                      *
 *******************************************************************************************************/

document.addEventListener("DOMContentLoaded", function () {
  const swiper = new Swiper(".js-testimonials-slider", {
    grabCursor: true,
    spaceBetween: 50,
    breakpoints: {
      767: {
        slidesPerView: 2,
      },
    },
  });
});

// scroll up button
const scrollUpButton = document.getElementById("scrollUp");

window.addEventListener("scroll", () => {
  if (window.scrollY > window.innerHeight) {
    scrollUpButton.classList.add("visible");
  } else {
    scrollUpButton.classList.remove("visible");
  }
});

scrollUpButton.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/*******************************************************************************************************
 *                                                                                                      *
 *                                         Contact Email Send                                           *
 *                                                                                                      *
 *******************************************************************************************************/
const contactForm = document.getElementById("contact-form");
const contactName = document.getElementById("form-name");
const contactEmail = document.getElementById("form-email");
const contactMessage = document.getElementById("form-message");

function sendEmail() {
  const bodyMessage = `Full Name: ${contactName.value}<br>Email: ${contactEmail.value}<br> Message: ${contactMessage.value}`;

  Email.send({
    SecureToken: "e0d5ad9f-92f9-42f3-94c7-b2e7b982c8fe",
    To: "team.hope.hydroquest@gmail.com",
    From: "team.hope.hydroquest@gmail.com",
    Subject: "New Form Message",
    Body: bodyMessage,
  }).then((message) => {
    if (message === "OK") {
      console.log("Your Message Sent Successfully");
      alert("Your Message Sent Successfully");
    } else {
      console.log("Error");
    }
  });
}

document.getElementById("submit").addEventListener("click", (event) => {
  event.preventDefault();
  sendEmail();

  contactEmail.value = ""
  contactName.value = ""
  contactMessage.value = ""
});

