<template>
  <section id="hero" class="hero-section hub-section">
    <div class="container content">
      <h1 class="display-3 fw-bold text-gradient mb-5">Soratix.fr</h1>
      <p class="lead text-secondary">Bienvenue sur mon hub créatif — outils, projets et expérimentations</p>
    </div>
  </section>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'

const particleTimeouts = []
const particles = []
const mountTimeouts = []
const isUnmounted = ref(false)

const createParticle = () => {
  if (isUnmounted.value) return

  const heroSection = document.getElementById('hero')
  if (!heroSection) return

  const particle = document.createElement('div')
  particle.classList.add('particle')

  const size = Math.random() * 8 + 2
  particle.style.width = `${size}px`
  particle.style.height = `${size}px`

  let x = Math.random() * heroSection.clientWidth
  let y = Math.random() * heroSection.clientHeight

  particle.style.left = '0px'
  particle.style.top = '0px'
  particle.style.transform = `translate(${x}px, ${y}px)`

  heroSection.appendChild(particle)

  let dx = (Math.random() - 0.5) * 1.5
  let dy = (Math.random() - 0.5) * 1.5

  const move = () => {
    if (isUnmounted.value) return

    x += dx
    y += dy

    if (x < 0 || x > heroSection.clientWidth) dx *= -1
    if (y < 0 || y > heroSection.clientHeight) dy *= -1

    particle.style.transform = `translate(${x}px, ${y}px)`
    requestAnimationFrame(move)
  }

  requestAnimationFrame(move)

  const timeoutId = setTimeout(() => {
    if (!isUnmounted.value) {
      particle.remove()
      const index = particles.indexOf(particle)
      if (index !== -1) particles.splice(index, 1)
      createParticle()
    }
  }, 15000)

  particles.push(particle)
  particleTimeouts.push(timeoutId)
}

onMounted(() => {
  isUnmounted.value = false
  for (let i = 0; i < 100; i++) {
    const id = setTimeout(() => createParticle(), i * 100)
    mountTimeouts.push(id)
  }
})

onBeforeUnmount(() => {
  isUnmounted.value = true
  mountTimeouts.forEach(clearTimeout)
  mountTimeouts.length = 0
  particleTimeouts.forEach(clearTimeout)
  particleTimeouts.length = 0
  particles.forEach((particle) => particle.remove())
  particles.length = 0
})
</script>
