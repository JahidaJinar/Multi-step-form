// script.js
let currentStep = 1;
const totalSteps = 4;

// Initialize the app
function init() {
  setupEventListeners();
  updateSteps();
  setupBillingToggle();
}

// Event listeners setup
function setupEventListeners() {
  document.querySelector(".btn-next").addEventListener("click", handleNextStep);
  document.querySelector(".btn-prev").addEventListener("click", handlePrevStep);

  document.querySelectorAll(".form-input").forEach((input) => {
    input.addEventListener("blur", () => validateInput(input));
  });

  // Plan selection
  document.querySelectorAll(".plan-input").forEach((input) => {
    input.addEventListener("change", handlePlanSelection);
  });

  // Addon selection
  document.querySelectorAll(".addon-input").forEach((input) => {
    input.addEventListener("change", handleAddonSelection);
  });

  // Change plan link
  document.querySelector(".change-link")?.addEventListener("click", (e) => {
    e.preventDefault();
    currentStep = 2;
    updateSteps();
  });
}

// Update UI for steps
function updateSteps() {
  updateSidebar();
  updateContent();
  if (currentStep === 4) updateConfirmation();

  // Hide Previous button on step 1
  const prevButton = document.querySelector(".btn-prev");
  prevButton.style.display = currentStep === 1 ? "none" : "block";
  const nextButton = document.querySelector(".btn-next");
  nextButton.textContent = currentStep === 4 ? "Confirm" : "Next Step";
}

function updateSidebar() {
  document.querySelectorAll(".step-item").forEach((item, index) => {
    item.classList.toggle("active", index + 1 === currentStep);
  });
}

function updateContent() {
  document.querySelectorAll(".step-content").forEach((content) => {
    content.classList.toggle(
      "active",
      parseInt(content.dataset.step) === currentStep
    );
  });
}

// Navigation handlers
function handleNextStep(e) {
  e.preventDefault();

  if (currentStep === 1 && !validateForm()) return;
  if (currentStep === 2 && !validateStep2()) return;
  if (currentStep === 3 && !validateStep3()) return;

  if (currentStep < totalSteps) {
    currentStep++;
    updateSteps();
  } else if (currentStep === totalSteps) {
    handleConfirmation();
  }
}

// Add confirmation handler
function handleConfirmation() {
  // Hide all step content and sidebar
  document.querySelectorAll(".step-content").forEach((content) => {
    content.style.display = "none";
  });
  

  // Show success message
  const confirmationHTML = `
    <div class="confirmation-success">
      <img src="./assets/images/icon-thank-you.svg" alt="Success" class="confirmation-icon">
      <h1>Thank you!</h1>
      <p>Thanks for confirming your subscription! We hope you have fun using our platform. If you ever need support, please feel free to email us at support@loremgaming.com</p>
    </div>
  `;
  document.querySelector(".content-area").innerHTML = confirmationHTML;
}

function handlePrevStep(e) {
  e.preventDefault();
  if (currentStep > 1) {
    currentStep--;
    updateSteps();
  }
}

// Step 1 Form validation
function validateForm() {
  let isValid = true;
  const inputs = document.querySelectorAll(".form-input");

  inputs.forEach((input) => {
    validateInput(input);
    if (input.classList.contains("invalid")) isValid = false;
  });

  return isValid;
}

function validateInput(input) {
  const errorMessage = input.parentElement.querySelector(".error-message");
  input.classList.remove("invalid");
  errorMessage.style.display = "none";

  // Required check
  if (!input.value.trim()) {
    showError(input, errorMessage);
    return;
  }

  // Email validation
  if (input.type === "email" && !isValidEmail(input.value)) {
    showError(input, errorMessage);
    return;
  }

  // Phone validation
  if (input.type === "tel" && !/^\d{10}$/.test(input.value)) {
    showError(input, errorMessage);
    return;
  }
}

// Step 2 Validation
function validateStep2() {
  const selectedPlan = document.querySelector(".plan-input:checked");
  if (!selectedPlan) {
    alert("Please select a plan");
    return false;
  }
  return true;
}

// Step 3 Validation
function validateStep3() {
  const selectedAddons = document.querySelectorAll(".addon-input:checked");
  if (selectedAddons.length === 0) {
    alert("Please select at least one add-on");
    return false;
  }
  return true;
}

// Billing Toggle
function setupBillingToggle() {
  const toggleSwitch = document.querySelector(".toggle-switch");
  const billingElements = {
    monthly: document.querySelector(".monthly"),
    yearly: document.querySelector(".yearly"),
    prices: document.querySelectorAll(".price"),
    promos: document.querySelectorAll(".promo"),
  };

  toggleSwitch?.addEventListener("click", () => {
    const isYearly = document.body.classList.toggle("billing-yearly");
    billingElements.monthly.classList.toggle("active");
    billingElements.yearly.classList.toggle("active");

    // Update Prices
    billingElements.prices.forEach((price) => {
      price.textContent = isYearly
        ? price.dataset.yearly
        : price.dataset.monthly;
    });

    // Update Addon Prices
    updateAddonPrices(isYearly);
  });
}

// Plan Selection
function handlePlanSelection(e) {
  document.querySelectorAll(".plan-card").forEach((card) => {
    card.classList.remove("selected");
  });
  if (e.target.checked)
    e.target.closest(".plan-card").classList.add("selected");
}

// Addon Selection
function handleAddonSelection(e) {
  const addonCard = e.target.closest(".addon-card");
  if (e.target.checked) {
    addonCard.classList.add("selected");
  } else {
    addonCard.classList.remove("selected");
  }
}

// Update Addon Prices
function updateAddonPrices(isYearly) {
  document.querySelectorAll(".addon-price").forEach((price) => {
    price.textContent = isYearly ? price.dataset.yearly : price.dataset.monthly;
  });
}

// Update Confirmation Page
function updateConfirmation() {
  const planName = document.querySelector(".plan-name");
  const planPrice = document.querySelector(".plan-price");
  const addonSummary = document.querySelector(".addon-summary");
  const totalPrice = document.querySelector(".total-price");

  // Clear previous addons
  addonSummary.innerHTML = "";

  // Update plan info
  const selectedPlan = document.querySelector(".plan-input:checked");
  if (selectedPlan) {
    const billingType = document.body.classList.contains("billing-yearly")
      ? "Yearly"
      : "Monthly";
    planName.textContent = `${
      selectedPlan.closest(".plan-card").querySelector("h3").textContent
    } (${billingType})`;
    planPrice.textContent = selectedPlan
      .closest(".plan-card")
      .querySelector(".price").textContent;
  }

  // Update addons
  const selectedAddons = document.querySelectorAll(".addon-input:checked");
  let total = parseFloat(planPrice.textContent.replace(/[^0-9.]/g, ""));

  selectedAddons.forEach((addon) => {
    const title = addon
      .closest(".addon-item")
      .querySelector(".addon-title").textContent;
    const price = addon
      .closest(".addon-item")
      .querySelector(".addon-price").textContent;

    // Create new addon item
    const addonElement = document.createElement("div");
    addonElement.className = "addon-item";
    addonElement.innerHTML = `
      <span>${title}</span>
      <span class="addon-price">${price}</span>
    `;

    addonSummary.appendChild(addonElement);

    // Add to total
    total += parseFloat(price.replace(/[^0-9.]/g, ""));
  });

  // Update total
  const billingSuffix = document.body.classList.contains("billing-yearly")
    ? "yr"
    : "mo";
  totalPrice.textContent = `$${total.toFixed(2)}/${billingSuffix}`;
}

// Common Functions
function showError(input, errorMessage) {
  input.classList.add("invalid");
  errorMessage.style.display = "block";
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Start the application
document.addEventListener("DOMContentLoaded", init);
