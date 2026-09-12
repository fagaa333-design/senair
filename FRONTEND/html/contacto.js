const contactForm = document.getElementById("contactForm");
const contactMessage = document.getElementById("contactMessage");

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  contactMessage.textContent = "Gracias por escribirnos. Revisaremos tu mensaje y te responderemos pronto.";
  contactForm.reset();
});
