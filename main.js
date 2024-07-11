import { detecIcon, setStorage, detecType } from "./helpers.js";

/* HTML'den gelenler */
const form = document.querySelector("form");
const list = document.querySelector("ul");

/*Olay izleyicileri */
form.addEventListener("submit", handleSubmit);
list.addEventListener("click", handleClick);

/* Ortak kullanım alanı */
let map;
let coords = [];
let notes = JSON.parse(localStorage.getItem("notes")) || [];
let layerGroup = [];

/* Kullanıcının konumunu öğrenme */
navigator.geolocation.getCurrentPosition(
  loadMap,
  console.log("Kullanıcı kabul etmedi ")
);

/* Haritaya tıklanınca çalışır */
function onMapClick(e) {
  form.style.display = "flex";
  coords = [e.latlng.lat, e.latlng.lng];
  console.log(coords);
}

/* Kullanıcının konumuna göre ekrana haritayı basar */

function loadMap(e) {
  /*  Haritanın kurulumunu yapar */
  map = new L.map("map").setView([e.coords.latitude, e.coords.longitude], 10);
  L.control;
  /* Haritanın nasıl gözükeceğini belirler */
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  /* Harita'da ekrana basılacak imleçleri tutan katman */
  layerGroup = L.layerGroup().addTo(map);

  /* Local storage'dan gelen notesları listeler */
  renderNoteList(notes);

  /* Harita'da bir tıklama olduğunda çalışacak fonksiyon */
  map.on("click", onMapClick);
}

function renderMarker(item) {
  console.log(item);
  L.marker(item.coords, { icon: detecIcon(item.status) })

    .addTo(layerGroup)
    .bindPopup(`${item.desc}`);
}

/* Formun gönderilmesini sağlar */
function handleSubmit(e) {
  e.preventDefault();
  console.log(e);
  const desc = e.target[0].value;
  const date = e.target[1].value;
  const status = e.target[2].value;

  /* Notes dizisine eleman ekler */
  notes.push({ id: new Date().getTime(), desc, date, status, coords });
  console.log(notes);
  /* Local Storage güncelleme */
  setStorage(notes);

  renderNoteList(notes);

  /* Form gönderildiğinde kapanır */
  form.style.display = "none";
}

function renderNoteList(item) {
  list.innerHTML = "";

  /* Markerları temizleme */
  layerGroup.clearLayers();
  item.forEach((item) => {
    const listElement = document.createElement("li");
    /* Datasına sahip olduğu ıd ekleme */
    listElement.dataset.id = item.id;

    listElement.innerHTML = `
    
    <div>

    <p>${item.desc}</p>
    <p><span>Tarih: </span>${item.date}</p>
    <p><span>Durum: </span>${detecType(item.status)}</p>

  </div>

  <i class="bi bi-x" id="delete"></i>
  <i class="bi bi-airplane-fill" id="fly"></i>
    `;
    list.insertAdjacentElement("afterbegin", listElement);
    /* Ekrana marker basma */
    renderMarker(item);
  });
}
function handleClick(e) {
  console.log(e.target.id);
  /* Güncellenecek elemanın id'sini öğrenme */
  const id = e.target.parentElement.dataset.id;
  console.log(notes);
  if (e.target.id === "delete") {
    console.log("tıklanıldı");
    /* ID'sini bildiğimiz elemanı diziden kaldırma */
    notes = notes.filter((note) => note.id != id);
    console.log(notes);

    /* LocalStorage güncelleme */
    setStorage(notes);
    /* Ekranı güncelleme */
    renderNoteList(notes);
  }

  if (e.target.id === "fly") {
    const note = notes.find((note) => note.id == id);
    map.flyTo(note.coords);
  }
}
