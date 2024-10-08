"use strict";

// Global variables
const scene = new THREE.Scene();
const raycaster = new THREE.Raycaster();
const normalizedMouse = { x: 0, y: -180 };
const darkBlue = { r: 28, g: 28, b: 28 };
const baseColorRGB = darkBlue;
const baseColor = `rgb(${baseColorRGB.r},${baseColorRGB.g},${baseColorRGB.b})`;

let camera, renderer, plane;
let nearStars, farStars, farthestStars;

// Three.js initialization
function initializeThreeJSEnvironment() {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();

    camera.position.z = 70;
    renderer.setClearColor("#121212", 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    document.body.appendChild(renderer.domElement);
}

// Lighting setup
function setupSceneLighting() {
    const lights = [
        { color: 0xffffff, intensity: 1, position: [0, 1, 1] },
        { color: 0xffffff, intensity: 0.4, position: [1, -1, 1] },
        { color: 0x666666, intensity: 0.2, position: [-1, -1, 0.2] },
        { color: 0x666666, intensity: 0.2, position: [0, -1, 0.2] },
        { color: 0x666666, intensity: 0.2, position: [1, -1, 0.2] }
    ];

    lights.forEach(light => {
        const directionalLight = new THREE.DirectionalLight(light.color, light.intensity);
        directionalLight.position.set(...light.position).normalize();
        scene.add(directionalLight);
    });
}

// Enhanced Mesh creation
function createBackgroundMesh() {
    const geometry = new THREE.PlaneGeometry(400, 400, 70, 70);
    const darkBlueMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        shading: THREE.FlatShading,
        side: THREE.DoubleSide,
        vertexColors: THREE.FaceColors
    });

    geometry.vertices.forEach(vertice => {
        vertice.x += (Math.random() - 0.5) * 4;
        vertice.y += (Math.random() - 0.5) * 4;
        vertice.z += (Math.random() - 0.5) * 4;
        vertice.dx = Math.random() - 0.5;
        vertice.dy = Math.random() - 0.5;
        vertice.dz = Math.random() - 0.5;
        vertice.randomDelay = Math.random() * 5;
    });

    geometry.faces.forEach(face => {
        face.color.setStyle(baseColor);
        face.baseColor = baseColorRGB;
    });

    plane = new THREE.Mesh(geometry, darkBlueMaterial);
    scene.add(plane);

    // Add floating triangles
    addFloatingTriangles();
}

// New function to add floating triangles
function addFloatingTriangles() {
    const triangleGeometry = new THREE.Geometry();
    triangleGeometry.vertices.push(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(-0.866, -0.5, 0),
        new THREE.Vector3(0.866, -0.5, 0)
    );
    triangleGeometry.faces.push(new THREE.Face3(0, 1, 2));

    const triangleMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00aec0, 
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6
    });

    for (let i = 0; i < 50; i++) {
        const triangle = new THREE.Mesh(triangleGeometry, triangleMaterial);
        triangle.position.set(
            (Math.random() - 0.5) * 200,
            (Math.random() - 0.5) * 200,
            (Math.random() - 0.5) * 100
        );
        triangle.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        triangle.scale.setScalar(Math.random() * 3 + 1);
        scene.add(triangle);
    }
}

// Star creation
function createStarField(amount, yDistance, color) {
    const starGeometry = new THREE.Geometry();
    const starMaterial = new THREE.PointsMaterial({ color, opacity: Math.random() });

    for (let i = 0; i < amount; i++) {
        const vertex = new THREE.Vector3();
        vertex.z = (Math.random() - 0.5) * 1500;
        vertex.y = yDistance;
        vertex.x = (Math.random() - 0.5) * 1500;
        starGeometry.vertices.push(vertex);
    }

    return new THREE.Points(starGeometry, starMaterial);
}

// Setup stars
function setupStarLayers() {
    farthestStars = createStarField(1200, 420, "#09A2DD");
    farStars = createStarField(1200, 370, "#C5CFF0");
    nearStars = createStarField(1200, 290, "#11CCD6");

    scene.add(farthestStars);
    scene.add(farStars);
    scene.add(nearStars);

    farStars.rotation.x = 0.25;
    nearStars.rotation.x = 0.25;
}

// Main initialization
function initializeScene() {
    initializeThreeJSEnvironment();
    setupSceneLighting();
    createBackgroundMesh();
    setupStarLayers();
}

// Enhanced Animation loop
let timer = 0;
function animateScene() {
    requestAnimationFrame(animateScene);

    timer += 0.01;
    updateVertexPositions();
    updateIntersections();
    updateStarRotations();
    animateFloatingTriangles();
    animatePlaneWaves();

    renderer.render(scene, camera);
}

// Enhanced Update vertex positions
function updateVertexPositions() {
    plane.geometry.vertices.forEach(vertice => {
        vertice.x += Math.sin(timer + vertice.randomDelay) / 40 * vertice.dx;
        vertice.y += Math.sin(timer + vertice.randomDelay) / 40 * vertice.dy;
        vertice.z += Math.cos(timer + vertice.randomDelay) / 40 * vertice.dz;
    });

    plane.geometry.verticesNeedUpdate = true;
    plane.geometry.elementsNeedUpdate = true;
}

// New function to animate floating triangles
function animateFloatingTriangles() {
    scene.children.forEach(child => {
        if (child instanceof THREE.Mesh && child !== plane) {
            child.rotation.x += 0.01;
            child.rotation.y += 0.01;
            child.position.y += Math.sin(timer + child.position.x) * 0.1;
        }
    });
}

// New function to create wave-like animation on the plane
function animatePlaneWaves() {
    const waveX = Math.sin(timer * 0.3) * 5;
    const waveY = Math.cos(timer * 0.3) * 5;

    plane.geometry.vertices.forEach((vertex, i) => {
        const distance = new THREE.Vector2(vertex.x, vertex.y).distanceTo(new THREE.Vector2(0, 0));
        const wave = Math.sin(distance * 0.03 + timer * 0.7) * 4;
        vertex.z = wave + Math.sin(i + timer * 0.7) * 2;
    });

    plane.geometry.verticesNeedUpdate = true;
}

// Update intersections
function updateIntersections() {
    raycaster.setFromCamera(normalizedMouse, camera);
    const intersects = raycaster.intersectObjects([plane]);

    if (intersects.length > 0) {
        const faceBaseColor = intersects[0].face.baseColor;

        plane.geometry.faces.forEach(face => {
            face.color.r *= 255;
            face.color.g *= 255;
            face.color.b *= 255;

            face.color.r += (faceBaseColor.r - face.color.r) * 0.01;
            face.color.g += (faceBaseColor.g - face.color.g) * 0.01;
            face.color.b += (faceBaseColor.b - face.color.b) * 0.01;

            const rInt = Math.floor(face.color.r);
            const gInt = Math.floor(face.color.g);
            const bInt = Math.floor(face.color.b);

            face.color.setStyle(`rgb(${rInt},${gInt},${bInt})`);
        });

        intersects[0].face.color.setStyle("#00aec0");
        plane.geometry.colorsNeedUpdate = true;
    }
}

// Update star rotations
function updateStarRotations() {
    farthestStars.rotation.y -= 0.00001;
    farStars.rotation.y -= 0.00005;
    nearStars.rotation.y -= 0.00011;
}

// Event listeners
function setupEventListeners() {
    window.addEventListener("resize", handleWindowResize);
    window.addEventListener("mousemove", handleMouseMove);
    $('.shift-camera-button').click(shiftCameraToProjectsView);
    $('.shift-camera-button-2').click(shiftCameraToContactView);
    $('.x-mark, .back-button').click(resetCameraToInitialView);
}

// Window resize handler
function handleWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Mouse move handler
function handleMouseMove(event) {
    normalizedMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    normalizedMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

// Camera animations (unchanged)
function shiftCameraToProjectsView() {
    const timeline = new TimelineMax();
    timeline.add([
        TweenLite.fromTo($('.intro-container'), 1.5, { opacity: 1 }, { opacity: 0, ease: Power3.easeIn }),
        TweenLite.to(camera.rotation, 3, { x: Math.PI / 2, ease: Power3.easeInOut }),
        TweenLite.to(camera.position, 2.5, { z: 20, ease: Power3.easeInOut }),
        TweenLite.to(camera.position, 3, { y: 120, ease: Power3.easeInOut }),
        TweenLite.to(plane.scale, 3, { x: 2, ease: Power3.easeInOut })
    ]);
    timeline.add([
        TweenLite.to($('.x-mark'), 1, { opacity: 1, ease: Power3.easeInOut }),
        TweenLite.to($('.sky-container'), 1, { 
            opacity: 1, 
            ease: Power3.easeInOut, 
            onStart: () => $('.sky-container').css('pointer-events', 'auto') 
        })
    ]);
}

function shiftCameraToContactView() {
    const timeline = new TimelineMax();
    timeline.add([
        TweenLite.fromTo($('.intro-container'), 1.5, { opacity: 1 }, { opacity: 0, ease: Power3.easeIn }),
        TweenLite.to(camera.rotation, 3, { x: Math.PI / 2, z: 2, ease: Power3.easeInOut }),
        TweenLite.to(camera.position, 2.5, { z: 18, ease: Power3.easeInOut }),
        TweenLite.to(camera.position, 3, { y: 40, ease: Power3.easeInOut }),
        TweenLite.to(plane.scale, 3, { x: 2, ease: Power3.easeInOut })
    ]);
    timeline.add([
        TweenLite.to($('.x-mark'), 1, { opacity: 1, ease: Power3.easeInOut }),
        TweenLite.to($('.moon-container'), 1, { 
            opacity: 1, 
            ease: Power3.easeInOut, 
            onStart: () => {
                $('.moon-container').css('pointer-events', 'auto');
                TweenLite.fromTo($('.contact-grid'), 1, 
                    { opacity: 0, y: 20 }, 
                    { opacity: 1, y: 0, ease: Power3.easeOut, delay: 0.5 }
                );
            }
        })
    ]);
}

function resetCameraToInitialView() {
    const timeline = new TimelineMax();
    timeline.add([
        TweenLite.to($('.x-mark'), 0.5, { opacity: 0, ease: Power3.easeInOut }),
        TweenLite.to($('.sky-container'), 1.4, { 
            opacity: 0, 
            ease: Power3.easeInOut, 
            onComplete: () => $('.sky-container').css('pointer-events', 'none') 
        }),
        TweenLite.to($('.moon-container'), 1.4, { 
            opacity: 0, 
            ease: Power3.easeInOut, 
            onComplete: () => $('.moon-container').css('pointer-events', 'none') 
        }),
        TweenLite.to(camera.rotation, 3, { x: 0, z: 0, ease: Power3.easeInOut }),
        TweenLite.to(camera.position, 3, { z: 70, ease: Power3.easeInOut }),
        TweenLite.to(camera.position, 2.5, { y: 0, ease: Power3.easeInOut }),
        TweenLite.to(plane.scale, 3, { x: 1, ease: Power3.easeInOut })
    ]);
    timeline.add([
        TweenLite.to($('.intro-container'), 0.3, { opacity: 1, ease: Power3.easeIn })
    ]);
}

// Project data
const projects = [
    {
        title: "EliminateHQ",
        image: "img/swseliminate.gif",
        description: "Online hub for Eliminate, a prominent music producer and online personality.",
        url: "https://eliminatehq.com"
    },
    {
        title: "Encrypt2Me",
        image: "img/swse2m4.gif",
        description: "Secure file sharing platform with end-to-end encryption.",
        url: "https://encrypt2.me"
    },
    {
        title: "Ensenada Dental",
        image: "img/swsensenada.gif",
        description: "Website for a dental practice in Arlington, Texas.",
        url: "https://ensenada.stellarweb.services"
    },
    {
        title: "Joy D Fadez",
        image: "img/swsjdf.gif",
        description: "Booking website for a skilled barber based in Frisco, Texas.",
        url: "https://joydfadez.com"
    },
    {
        title: "VetCare+",
        image: "img/swsvetcare.gif",
        description: "Website for a veterinary clinic in Northern Ireland.",
        url: "https://vetcare.stellarweb.services"
    },
    {
        title: "Yokai SMP",
        image: "img/swsyokai.gif",
        description: "Lore website for a Minecraft SMP.",
        url: "https://yokai.stellarweb.services"
    },
    {
        title: "Razorz Barbershop",
        image: "img/swsrazorz.gif",
        description: "Website for a barbershop in Richardson, Texas.",
        url: "https://razorz.stellarweb.services"
    },
    {
        title: "Far & Wide Records",
        image: "img/swsf8h.gif",
        description: "Website for a record label in Texas.",
        url: "https://f8h.quest"
    },
    {
        title: "Nightforge Studios",
        image: "img/swsnf.gif",
        description: "Website for a indie game studio in Colorado.",
        url: "https://nightforge.org"
    }
];

// Populate project grid
function populateProjectGrid() {
    const projectGrid = document.querySelector('.project-grid');
    projects.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.innerHTML = `
            <a href="${project.url}" target="_blank">
                <img src="${project.image}" alt="${project.title}">
                <div class="project-card-content">
                    <h4>${project.title}</h4>
                    <p>${project.description}</p>
                </div>
            </a>
        `;
        projectGrid.appendChild(projectCard);
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeScene();
    setupEventListeners();
    populateProjectGrid();
    animateScene();
});