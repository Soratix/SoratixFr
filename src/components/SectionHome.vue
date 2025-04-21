<template>
  <section id="hero" class="hero-section">
    <div class="container content">
      <h1 class="display-3 fw-bold text-gradient mb-5">Soratix.fr</h1>
      <p class="lead text-secondary">Bienvenue sur mon hub créatif</p>
    </div>
  </section>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';

let particleTimeouts = [];  // Pour stocker les timeouts et les nettoyer
let particles = [];        // Pour stocker les particules et les supprimer
let isUnmounted = ref(false);  // Flag pour savoir si le composant est démonté

// Fonction qui crée et anime une particule
const createParticle = () => {
  if (isUnmounted.value) return;  // Si le composant est démonté, on arrête la création de particules

  const heroSection = document.getElementById('hero'); // Cible la section principale

  const particle = document.createElement('div');      // Crée un nouvel élément <div>
  particle.classList.add('particle');                  // Ajoute la classe CSS 'particle'

  // Génère une taille aléatoire entre 2px et 10px
  const size = Math.random() * 8 + 2;
  particle.style.width = `${size}px`;
  particle.style.height = `${size}px`;

  // Génère une position de départ aléatoire dans la section
  let x = Math.random() * heroSection.clientWidth;
  let y = Math.random() * heroSection.clientHeight;

  // Position initiale (on utilisera transform pour le déplacement)
  particle.style.left = '0px';
  particle.style.top = '0px';
  particle.style.transform = `translate(${x}px, ${y}px)`;

  // Ajoute la particule dans le DOM
  heroSection.appendChild(particle);

  // Vitesse et direction aléatoires
  let dx = (Math.random() - 0.5) * 1.5; // vitesse horizontale
  let dy = (Math.random() - 0.5) * 1.5; // vitesse verticale

  // Fonction récursive qui met à jour la position
  const move = () => {
    if (isUnmounted.value) return;  // Si le composant est démonté, on arrête l'animation

    x += dx;
    y += dy;

    // Si la particule touche un bord, elle rebondit
    if (x < 0 || x > heroSection.clientWidth) dx *= -1;
    if (y < 0 || y > heroSection.clientHeight) dy *= -1;

    // Met à jour la position visuelle avec transform (fluidité GPU)
    particle.style.transform = `translate(${x}px, ${y}px)`;

    // Continue le mouvement à la prochaine frame
    requestAnimationFrame(move);
  };

  // Démarre l'animation
  requestAnimationFrame(move);

  // Supprime la particule après 15s et relance une nouvelle
  const timeoutId = setTimeout(() => {
    if (!isUnmounted.value) {
      particle.remove();
      createParticle(); // Boucle infinie : une disparait = une renaît
    }
  }, 15000);

  // Stocke la particule et son timeout pour nettoyage
  particles.push(particle);
  particleTimeouts.push(timeoutId);
};

// Quand le composant est monté, on crée 50 particules progressivement
onMounted(() => {
  isUnmounted.value = false;  // S'assure que le flag est `false` lors de la montée du composant
  for (let i = 0; i < 100; i++) {
    setTimeout(() => createParticle(), i * 100); // Délai pour effet progressif
  }
});

// Lorsque le composant est détruit, on arrête et supprime les particules
onBeforeUnmount(() => {
  isUnmounted.value = true; // Le flag indique que le composant est démonté
  // Supprimer toutes les particules
  particles.forEach(particle => particle.remove());
  // Annuler tous les timeouts
  particleTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
});
</script>
