import * as THREE from 'three';
import { MindARThree } from 'mind-ar/dist/mindar-image-three.prod.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const start = async () => {
  const mindarThree = new MindARThree({
    container: document.querySelector("#ar-container"),
    imageTargetSrc: "./targets1.mind"
  });
  const { renderer, scene, camera } = mindarThree;
  const anchor = mindarThree.addAnchor(0);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const dir = new THREE.DirectionalLight(0xffffff, 1);
  dir.position.set(0, 2, 2);
  scene.add(dir);

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;

  // Avatar
  const gltf = await new GLTFLoader().loadAsync("./2.glb");
  const avatar = gltf.scene;
  avatar.scale.set(0.35, 0.35, 0.35);
  avatar.rotation.x = Math.PI / 2;
  avatar.visible = false;
  anchor.group.add(avatar);
  const mixer = new THREE.AnimationMixer(avatar);
  mixer.clipAction(gltf.animations[0]).play();

  // Header logo
  const header = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 0.35),
    new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load("./header.png"),
      transparent: true
    })
  );
  header.position.set(0, 1, 0.01); header.visible = false;
  anchor.group.add(header);

  // Videos
  const videoFiles = ["bez1.mp4","bez2.mp4","bez3.mp4","bez1.mp4"];
  const videoPositions = [[-0.9,0.1],[ -0.3,0.1],[0.3,0.1],[0.9,0.1]];
  const videoPlanes = [];
  for (let i=0; i<videoFiles.length; i++) {
    const vid = document.createElement("video");
    vid.src = videoFiles[i]; vid.loop = false; vid.muted = true;
    vid.playsInline = true; vid.crossOrigin = "anonymous";
    const tex = new THREE.VideoTexture(vid);
    const p = new THREE.Mesh(
      new THREE.PlaneGeometry(0.7, 0.4),
      new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide })
    );
    p.position.set(...videoPositions[i], 0);
    p.visible = false;
    anchor.group.add(p);
    videoPlanes.push({ plane: p, video: vid });
  }

  // Output helper functions
  const clickable = [];
  const createButton = (img, x,y,w,h, cb) => {
    const t = new THREE.TextureLoader().load(img);
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(w,h),
      new THREE.MeshBasicMaterial({ map:t, transparent:true })
    );
    mesh.position.set(x,y,0.1);
    mesh.userData.onClick = cb;
    mesh.visible = false;
    anchor.group.add(mesh);
    clickable.push(mesh);
    return mesh;
  };

  const createCard = (title,cat,text,img,x,y=0.6) => {
    const grp = new THREE.Group();
    const tex = new THREE.TextureLoader().load(img);
    const pic = new THREE.Mesh(
      new THREE.PlaneGeometry(0.5,0.33),
      new THREE.MeshBasicMaterial({ map: tex })
    );
    pic.position.set(0,0.2,0);
    grp.add(pic);
    const canvas = document.createElement("canvas");
    canvas.width=512;canvas.height=256;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle="#000";ctx.fillRect(0,0,512,256);
    ctx.fillStyle="#fff";ctx.font="bold 24px Arial";
    ctx.fillText(cat, 20,40);
    ctx.fillText(title,20,80);
    ctx.font="18px Arial";
    ctx.fillText(text,20,130);
    const infoTex = new THREE.CanvasTexture(canvas);
    const infoP = new THREE.Mesh(
      new THREE.PlaneGeometry(0.5,0.25),
      new THREE.MeshBasicMaterial({ map: infoTex })
    );
    infoP.position.set(0,-0.25,0);
    grp.add(infoP);
    grp.position.set(x,y,0.2);
    grp.visible = false;
    anchor.group.add(grp);
    return grp;
  };

  const createGallery = (imgs, xStart, yStart) => {
    return imgs.map((url,i) => {
      const x = xStart + (i % 3) * 0.7;
      const y = yStart - Math.floor(i/3) * 0.5;
      return createCard("", "", "", url, x, y);
    });
  };

  // Sections
  const cards = [
    createCard("National Geographic","Fashion","Curiosity.","./case1.png",-0.9,0.6),
    createCard("Lamborghini","Auto","Rev story.","./case2.png",0,0.6),
    createCard("Hello Bello","Services","Culinary.","./case3.png",0.9,0.6),
    createCard("Nike","Sports","Just do it.","./case4.png",-0.9,0),
    createCard("Tesla","Tech","Future drives.","./case5.png",0,0),
    createCard("Disney","Entertainment","Dreamcreate.","./case6.png",0.9,0)
  ];

  const aboutGallery = createGallery(
    ["./brand1.png","./web1.png","./pack1.png","./media1.png","./photo1.png","./video1.png"],
    -0.9, 0.6
  );

  // Controls
  let introPlayed = false;
  const showMain = () => {
    avatar.visible=true; header.visible=true;
    backBtn.visible=false;
    menuBtns.forEach(b=>b.visible=true);
    site.visible=contact.visible=true;
    videoPlanes.forEach(({plane,video})=>{plane.visible=false; video.pause();});
    cards.forEach(c=>c.visible=false);
    aboutGallery.forEach(g=>g.visible=false);
  };
  const showContent = () => {
    avatar.visible=true; header.visible=false;
    menuBtns.forEach(b=>b.visible=false);
    backBtn.visible=true; site.visible=contact.visible=true;
    cards.forEach(c=>c.visible=false);
    aboutGallery.forEach(g=>g.visible=false);
    videoPlanes.forEach(({plane})=>plane.visible=true);
    (async () => {
      for (let i=0; i<videoPlanes.length; i++){
        avatar.position.set(...videoPositions[i],0);
        videoPlanes.forEach((v,j)=>i===j?v.video.play():v.video.pause());
        await new Promise(r=>videoPlanes[i].video.onended=r);
      }
      showMain();
    })();
  };
  const showCases = () => {
    avatar.visible=false; header.visible=false;
    menuBtns.forEach(b=>b.visible=false);
    backBtn.visible=true; site.visible=contact.visible=true;
    videoPlanes.forEach(({plane})=>plane.visible=false);
    aboutGallery.forEach(g=>g.visible=false);
    cards.forEach(c=>c.visible=true);
  };
  const showAbout = () => {
    avatar.visible=true; header.visible=false;
    menuBtns.forEach(b=>b.visible=false);
    backBtn.visible=true; site.visible=contact.visible=true;
    videoPlanes.forEach(({plane})=>plane.visible=false);
    cards.forEach(c=>c.visible=false);
    aboutGallery.forEach(g=>g.visible=true);
  };

  // Buttons
  const menuBtns = [
    createButton("./content.png",0,-0.6,0.8,0.18, showContent),
    createButton("./case.png",0,-0.9,0.8,0.18, showCases),
    createButton("./about.png",0,-1.2,0.8,0.18, showAbout)
  ];
  const site = createButton("./website.png",-0.6,-1.6,0.5,0.14,()=>window.open("https://www.bez.agency"));
  const contact = createButton("./contact.png",0.6,-1.6,0.5,0.14,()=>window.open("mailto:bez@gmail.com"));
  const backBtn = createButton("./backbtn.png",-1.2,0.9,0.3,0.2, showMain);

  const playIntro = async () => {
    if (introPlayed) return;
    introPlayed=true;
    avatar.visible=true; header.visible=false;
    mixer.clipAction(gltf.animations[0]).play();
    await new Promise(r=>setTimeout(r,8000));
    showMain();
  };

  window.addEventListener("click", e => {
    const mouse = new THREE.Vector2(
      (e.clientX/window.innerWidth)*2-1,
      -(e.clientY/window.innerHeight)*2+1
    );
    const ray = new THREE.Raycaster();
    ray.setFromCamera(mouse, camera);
    const hit = ray.intersectObjects(clickable,true);
    if (hit.length>0 && hit[0].object.userData.onClick){
      hit[0].object.userData.onClick();
    }
  });

  anchor.onTargetFound = playIntro;
  anchor.onTargetLost = () => {
    videoPlanes.forEach(v=>v.video.pause());
  };

  await mindarThree.start();
  const clock = new THREE.Clock();
  renderer.setAnimationLoop(()=>{
    mixer.update(clock.getDelta());
    renderer.render(scene, camera);
  });
};

start();
