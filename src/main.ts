import { createApp } from 'vue'
import App from './App.vue'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';  // Pour importer les scripts JavaScript de Bootstrap
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Import du JS de Bootstrap (avec Popper.js)
import './assets/main.css'

createApp(App).mount('#app')