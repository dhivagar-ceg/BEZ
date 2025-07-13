import * as THREE from 'three';
import { MindARThree } from './libs/mindar-image-three.prod.js';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const start = async () => {
  const mindarThree = new MindARThree({
    container: document.querySelector("#ar-container"),
    imageTargetSrc: "./targets1.mind"
  });

  const { renderer, scene, camera } = mindarThree;
  const anchor = mindarThree.addAnchor(0);

  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const dir = new THREE.DirectionalLight(0xffffff, 1);
  dir.position.set(0, 2, 2);
  scene.add(dir);

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;

  const gltf = await new GLTFLoader().loadAsync("./2.glb");
  const avatar = gltf.scene;
  avatar.scale.set(0.35, 0.35, 0.35);
  avatar.rotation.x = Math.PI / 2;
  avatar.visible = false;
  anchor.group.add(avatar);
  const mixer = new THREE.AnimationMixer(avatar);
  mixer.clipAction(gltf.animations[0]).play();

  const clickable = [];
  const createButton = (img, x, y, w, h, cb) => {
    const tex = new THREE.TextureLoader().load(img);
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true })
    );
    mesh.position.set(x, y, 0.2); // Z changed from 0.1 to 0.2
    mesh.visible = false;
    mesh.renderOrder = 999; // Ensure button is drawn above others
    mesh.userData.onClick = cb;
    anchor.group.add(mesh);
    clickable.push(mesh);
    return mesh;
  };

const createImageCardWithText = (img, title, desc, x, y, link, overlayText = false) => {
  const group = new THREE.Group();

  const tex = new THREE.TextureLoader().load(img);
  const image = new THREE.Mesh(
    new THREE.PlaneGeometry(0.5, 0.35),
    new THREE.MeshBasicMaterial({ map: tex })
  );
  image.position.set(0, 0, 0);
  
  // 🔥 Make the image itself clickable
  image.userData.onClick = () => window.open(link, '_blank');
  clickable.push(image);

  group.add(image);

  if (overlayText) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.font = "40px sans-serif";
    ctx.fillText(title, canvas.width / 2, 80);

    const tex2 = new THREE.CanvasTexture(canvas);
    const textPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(0.5, 0.15),
      new THREE.MeshBasicMaterial({ map: tex2, transparent: true })
    );
    textPlane.position.set(0, 0, 0.01);
    group.add(textPlane);
  } else {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 180;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "black";
    ctx.globalAlpha = 0.6;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "bold 24px sans-serif";
    ctx.fillText(title, canvas.width / 2, 40);

    if (desc) {
      ctx.font = "16px sans-serif";
      const words = desc.split(' ');
      let line = '';
      let y = 75;
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > 450 && line.length > 0) {
          ctx.fillText(line, canvas.width / 2, y);
          line = words[i] + ' ';
          y += 22;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, canvas.width / 2, y);
    }

    const tex2 = new THREE.CanvasTexture(canvas);
    const textPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(0.5, 0.25),
      new THREE.MeshBasicMaterial({ map: tex2, transparent: true })
    );
    textPlane.position.set(0, -0.3, 0.01);
    group.add(textPlane);
  }

  group.position.set(x, y, 0.1);
  group.visible = false;

  anchor.group.add(group);
  return group;
};

  const header = new THREE.Mesh(
    new THREE.PlaneGeometry(0.8, 0.2),
    new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("./header.png"), transparent: true })
  );
  header.position.set(0, 0.8, 0.1);
  header.visible = false;
  anchor.group.add(header);

  const caseStudies = [
    createImageCardWithText("./case1.png", "Fashion", "National Geographic, With National Geographic, we captured the novel journey of their Melbourne store opening, crafting visuals that epitomize the spirit of inquisitiveness.", -0.7, 1, "https://www.bez.agency/case-study/national-geographic/"),
    createImageCardWithText("./case2.png", "Automotive", "Lamborghini, With Lamborghini, every rev tells a story. From launching the Huracan STO in Australia to documenting the exclusive arrival of the Lamborghini Countach, our photo and video content has raced through Lamborghini’s global networks, echoing the brand’s unparalleled prestige and performance.", 0, 1, "https://www.bez.agency/case-study/lamborghini/"),
    createImageCardWithText("./case3.png", "Services", "Hello Bello, Embarking on a culinary voyage with Hello Bello Pizza, we created a suite of photos illuminating their range of woodfired pizzas, hearty pastas, and refreshing drinks, primed for social showcasing and UberEats allure.", 0.7, 1, "https://www.bez.agency/case-study/hello-bello/"),

    createImageCardWithText("./case4.png", "Technology", "Diving into the technical narrative with 1MILLIKELVIN, we utilized video production to unravel a pioneering thermoelastic stress imaging system, bridging keen scientific innovation with relatable storytelling, unveiling a future where stress analysis is simplified, precise, and user-friendly.", -0.6, -0.6, "https://www.bez.agency/case-study/1millikelvin/"),
    createImageCardWithText("./case5.png", "Products & Manufacturing", "Collaborating with VicRoads Custom Plates, we showcased a myriad of custom plate designs through engaging campaigns across Victoria, emphasizing the joy of personalization.", 0, -0.6, "https://www.bez.agency/case-study/vicroads-custom-plates/"),
    createImageCardWithText("./case6.png", "Fashion", "Controversial Watches, Setting the stage for Controversial Watches, our lens narrated the elegance and bold demeanor of their timepieces, showcasing a blend of tradition and modernity in every tick and tock.", 0.6, -0.6, "https://www.bez.agency/case-study/controversial-watches/")
  ];

const aboutGallery = [
  createImageCardWithText(
    "./video.png",
    "Video Production",
    "Transforming Visions to Visible Results",
    0, 1.1,
    "https://www.bez.agency/services/video-production/"
  ),
  createImageCardWithText(
    "./photo.png",
    "Photography",
    "Framing Shots That Elevate Your Presence",
    0, 0.4,
    "https://www.bez.agency/services/photography/"
  ),
  createImageCardWithText(
    "./social.png",
    "Social Media Management",
    "Crafting Conversations That Command Attention",
    0, -0.3,
    "https://www.bez.agency/services/social-media-management/"
  )
];





  const videoFiles = ["bez1.mp4", "bez2.mp4", "bez3.mp4", "bez1.mp4"];
  const videoPositions = [[-1.12, 0.75], [-0.37, 0.75], [0.37, 0.75], [1.12, 0.75]];

  const videoPlanes = [];
  for (let i = 0; i < videoFiles.length; i++) {
    const vid = document.createElement("video");
    vid.src = videoFiles[i];
    vid.loop = false;
    vid.muted = false;
    vid.playsInline = true;
    vid.crossOrigin = "anonymous";
    const tex = new THREE.VideoTexture(vid);

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(0.7, 0.4),
      new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide })
    );
    plane.position.set(...videoPositions[i], 0);
    plane.visible = false;
    anchor.group.add(plane);
    videoPlanes.push({ plane, video: vid });
  }

  const menuBtns = [
    createButton("./content.png", 0, -0.55, 0.6, 0.12, showContent),
    createButton("./case.png", 0, -0.73, 0.6, 0.12, showCaseStudies),
    createButton("./about.png", 0, -0.92, 0.6, 0.12, showAboutUs)
  ];

  const backBtn = createButton("./backbtn.png", -1.3, 1.2, 0.2, 0.2, showMain);
  const site = createButton("./website.png", -0.5, -1.2, 0.4, 0.12, () => {
  stopIntroAudio();
  window.open("https://www.bez.agency");
});

const contact = createButton("./contact.png", 0.5, -1.2, 0.4, 0.12, () => {
  stopIntroAudio();
  window.open("mailto:bez@gmail.com");
});


  function showMain() {
  avatar.visible = true;
  avatar.position.set(0, 0, 0);
  header.visible = true;
  menuBtns.forEach(b => b.visible = true);
  backBtn.visible = false;
  site.visible = contact.visible = true;
  videoPlanes.forEach(v => { v.plane.visible = false; v.video.pause(); });
  caseStudies.forEach(c => c.visible = false);
  aboutGallery.forEach(a => a.visible = false);
}


  function showContent() {
  avatar.visible = true;
  header.visible = false;
  menuBtns.forEach(b => b.visible = false);
  backBtn.visible = true;
  site.visible = contact.visible = true;
  videoPlanes.forEach(v => v.plane.visible = true);
  caseStudies.forEach(c => c.visible = false);
  aboutGallery.forEach(a => a.visible = false);

  (async () => {
    for (let i = 0; i < videoPlanes.length; i++) {
      avatar.position.set(...videoPositions[i], 0);
      videoPlanes.forEach((v, j) => i === j ? v.video.play() : v.video.pause());
      await new Promise(r => videoPlanes[i].video.onended = r);
    }
    showMain();
  })();
}


  function showCaseStudies() {
  avatar.visible = false;
  header.visible = false;
  menuBtns.forEach(b => b.visible = false);
  backBtn.visible = true;
  site.visible = contact.visible = true;
  videoPlanes.forEach(v => v.plane.visible = false);
  aboutGallery.forEach(a => a.visible = false);
  caseStudies.forEach(c => c.visible = true);
}

function showAboutUs() {
  avatar.visible = false;
  header.visible = false;
  menuBtns.forEach(b => b.visible = false);
  backBtn.visible = true;
  site.visible = contact.visible = true;
  videoPlanes.forEach(v => v.plane.visible = false);
  caseStudies.forEach(c => c.visible = false);
  aboutGallery.forEach(a => a.visible = true);
}

const audio = new Audio("BezVO.mp3");
audio.loop = false;
audio.crossOrigin = "anonymous";
audio.preload = "auto";

let introPlayed = false;

const stopIntroAudio = () => {
  if (!audio.paused) {
    audio.pause();
    audio.currentTime = 0;
  }
};

const playIntro = async () => {
  if (introPlayed) return;
  introPlayed = true;

  avatar.visible = true;
  avatar.position.set(0, 0, 0);
  mixer.clipAction(gltf.animations[0]).play();

  try {
    await audio.play();
  } catch (e) {
    console.warn("Autoplay blocked:", e);
  }

  await new Promise((res) => setTimeout(res, 8000));
  showMain();
};

window.addEventListener("click", e => {
  const mouse = new THREE.Vector2(
    (e.clientX / window.innerWidth) * 2 - 1,
    -(e.clientY / window.innerHeight) * 2 + 1
  );
  const ray = new THREE.Raycaster();
  ray.setFromCamera(mouse, camera);
  const hit = ray.intersectObjects(clickable, true);
  if (hit.length > 0 && hit[0].object.userData.onClick) {
    // ✅ Stop audio ONLY here
    if (!audio.paused) {
      audio.pause();
      audio.currentTime = 0;
    }

    hit[0].object.userData.onClick();
  }
});


  anchor.onTargetFound = playIntro;
  anchor.onTargetLost = () => videoPlanes.forEach(v => v.video.pause());

  await mindarThree.start();
  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    mixer.update(clock.getDelta());
    renderer.render(scene, camera);
  });
};

start();
