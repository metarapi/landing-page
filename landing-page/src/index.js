import './styles.css';
//import * as THREE from 'three';
import scene from './scene';

scene();

document.addEventListener('DOMContentLoaded', () => {
    const dropDownButton = document.getElementById('drop-down-button');
    const dropdownMenu = document.getElementById('portfolio-dropdown');
    
    dropDownButton.addEventListener('click', () => {
        dropdownMenu.classList.toggle('hidden');
    });

    // Optionally, close the dropdown when clicking outside
    document.addEventListener('click', (event) => {
        if (!dropDownButton.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.classList.add('hidden');
        }
    });
});