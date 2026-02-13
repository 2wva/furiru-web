/* eslint-env es6 */

document.addEventListener("DOMContentLoaded", () => {

  const stage = document.getElementById("stage");
  const opacitySlider = document.getElementById("opacitySlider");

  let currentColor = "white";
  let currentLevel = null; // base
  let currentOpacity = 1;

  // ===== 画像定義 =====
  const frillImages = {
    white: [
      "img/sennF1.png",
      "img/sennF2.png",
    
    ],
    black: [
      "img/sennB1.png",
      "img/sennB2.png",
    
    ], pink: [
      "img/sennP1.png",
      "img/sennP2.png",
    
    ],blue: [
      "img/sennBL1.png",
      "img/sennBL2.png",
    
    ]
  };

  const layers = [];

  // ===== ベース =====
  const base = document.createElement("img");
  base.src = "img/senn.png";
  base.className = "layer visible";
  stage.appendChild(base);

  // ===== 全フリル削除 =====
  function clearFrills() {
    layers.forEach(img => {
      img.classList.remove("visible");
      setTimeout(() => img.remove(), 300);
    });
    layers.length = 0;
  }

  // ===== フリル更新 =====
  function updateFrill() {
    if (currentLevel === null) return;

    clearFrills();

    for (let i = 0; i <= currentLevel; i++) {
      const img = document.createElement("img");
      img.src = frillImages[currentColor][i];
      img.className = "layer";
      img.style.opacity = currentOpacity;

      stage.appendChild(img);
      layers.push(img);

      requestAnimationFrame(() => {
        img.classList.add("visible");
      });
    }
  }

  // ===== フリルボタン =====
  document.querySelectorAll(".frill-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      currentLevel = Number(btn.dataset.level);
      updateFrill();
    });
  });

  // ===== 色ボタン =====
  document.querySelectorAll(".color-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      currentColor = btn.dataset.color;
      updateFrill();
    });
  });

  // ===== 透け感 =====
  opacitySlider.addEventListener("input", () => {
    currentOpacity = opacitySlider.value;
    layers.forEach(img => img.style.opacity = currentOpacity);
  });

   // ===== ★ リセットを外から呼べるようにする =====
  window.resetFrill = function () {

  // フリルを消す
  currentLevel = null;
  clearFrills();

  // 透け感をリセット
  currentOpacity = 1;
  opacitySlider.value = 1;

  // 念のため残っているレイヤーにも適用
  layers.forEach(img => {
    img.style.opacity = 1;
  });
};

});








// ① IndexedDB を開く
function openDB(callback) {
  const request = indexedDB.open("FrillGalleryDB", 1);

  request.onupgradeneeded = e => {
    const db = e.target.result;
    if (!db.objectStoreNames.contains("images")) {
      db.createObjectStore("images", { autoIncrement: true });
    }
  };

  request.onsuccess = e => {
    callback(e.target.result);
  };
}
// ② 保存
function saveToIndexedDB(dataURL) {
  openDB(db => {
    const tx = db.transaction("images", "readwrite");
    const store = tx.objectStore("images");

    store.add({
      img: dataURL,
      date: new Date().toLocaleString()
    });

    alert("ギャラリーに保存しました");
  });
}
// ③ 読み出し
function loadGallery(callback) {
  openDB(db => {
    const tx = db.transaction("images", "readonly");
    const store = tx.objectStore("images");

    const images = [];

    store.openCursor(null, "prev").onsuccess = e => {
      const cursor = e.target.result;
      if (cursor) {
        images.push(cursor.value);
        cursor.continue();
      } else {
        callback(images);
      }
    };
  });
}
// ④ html2canvas で保存
function savePNG(){

  const stage = document.getElementById("stage");

  html2canvas(stage, {
    useCORS: true,
    allowTaint: true,
    backgroundColor: null   // ← 透明を保ちたいならこのまま
  }).then(canvas => {

    // PNGで保存
    const data = canvas.toDataURL("image/png");

    saveToIndexedDB(data);
  });
}











function printStage() {
  const overlay = document.getElementById("printOverlay");
  overlay.style.display = "flex";

  const stage = document.getElementById("stage");

  html2canvas(stage, {
    backgroundColor: null
  }).then(canvas => {

    const dataUrl = canvas.toDataURL("image/png");
    const win = window.open("", "_blank");

    win.document.write(`
      <html>
      <head>
        <style>
          @page { size: 100mm 148mm; margin: 0; }
          body { margin: 0; }
          img { width: 100%; }
        </style>
      </head>
      <body>
        <img src="${dataUrl}">
        <script>
          window.onload = () => window.print();
          window.onafterprint = () => window.close();
        <\/script>
      </body>
      </html>
    `);

    win.document.close();

    // 印刷が終わって元画面に戻ったら消える
    window.onfocus = () => {
      overlay.style.display = "none";
    };
  });
}
