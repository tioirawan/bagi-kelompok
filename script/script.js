// menyimpan data murid
let data = [];

// menyimpan hasil pengacakan sebelumnya untuk dibandingkan
let temp = [];

// menghitung jumlah pengacakan tiap pembagian untuk menghindari infinite loop
let count = 0;
const maxCount = 10; // jumlah maksimal pengacakan tiap pembagian

let gTotal = 0

const btCopy = document.getElementById("btCopy")
const btBagi = document.getElementById("btBagi")
const container = document.getElementById('container');
const inpJumlah = document.getElementById('jumlah');
const inpRata = document.getElementById('rata-perempuan');
const inpSembunyi = document.getElementById('sembunyi');
const snackbar = document.getElementById("snackbar");

async function getData() {
  if (!data.length) {
    data = await (await fetch('script/murid.json')).json();
  }

  return data;
}

function copyHasil() {
  if (!temp.length) return

  let hasil = '';
  let index = 1;

  for (let kelompok of temp) {
    hasil += `*Kelompok ${index++}:*\n`;

    for (let murid of kelompok) {
      hasil += `- ${murid.nama} (${murid.no})\n`;
    }

    hasil += '\n';
  }

  copyToClipboard(hasil);

  snackbar.className = "show";

  setTimeout(
    () => snackbar.className = snackbar.className.replace("show", ""),
    3000);
}

async function bagiKelompok() {
  btBagi.setAttribute('disabled', '')
  btCopy.setAttribute('disabled', '')

  const jumlah = inpJumlah.value;
  const rata = inpRata.checked;
  const sembunyi = inpSembunyi.checked;

  const murid = await getData();

  let delaytime = 30
  let increaser = 1

  if (!jumlah || jumlah > murid.length) return;

  const jumlahPengulangan = 50 + Math.floor(Math.random() * 50);

  let hasil;

  container.style.display = "flex"

  for (let i = 0; i < jumlahPengulangan; i++) {
    do {
      hasil = await (rata ? bagiRata(murid, jumlah) : bagiAcak(murid, jumlah));

      gTotal++

    } while (cekKesamaan(hasil, temp) && count++ < maxCount);

    count = 0; // reset count

    if (!sembunyi || !(i >= jumlahPengulangan - 1)) render(hasil);
    else {
      if (i >= jumlahPengulangan - 1) {
        container.style.display = "block"
        container.innerHTML = "<center><h2>Pengacakan Selesai, Silahkan Copy Hasil!</h2></center>"
      }
    }

    await delay(delaytime += (increaser += 0.1)); // delay 0.1s tiap pengacakan (max 10 acakan/detik)
  }

  temp = hasil;
  btCopy.removeAttribute('disabled')

  console.log(gTotal)
  gTotal = 0

  const waitTime = 60 // s

  for (let i = 0; i < waitTime; i++) {
    btBagi.innerText = waitTime - i
    await delay(1000)
  }

  btBagi.innerText = "Bagi!"
  btBagi.removeAttribute('disabled')
}

async function bagiRata(murid, jumlah) {
  const laki = shuffle(shuffle(shuffle(murid.filter(m => m.kelamin == 'l'))));
  const perempuan = shuffle(
    shuffle(shuffle(murid.filter(m => m.kelamin == 'p')))
  );

  const kelompok = [];

  // entah kenapa gk bisa gini -> Array(jumlah).fill().map(() => [])
  for (let i = 0; i < jumlah; i++) {
    kelompok.push([]);
  }

  let i = 0;

  while (laki.length || perempuan.length) {
    if (laki.length) kelompok[i].push(laki.pop());
    else kelompok[i].push(perempuan.pop());

    i++;
    if (i >= jumlah) i = 0;
  }

  return kelompok;
}

async function bagiAcak(murid, jumlah) {
  const acak = shuffle(shuffle(shuffle(murid)));

  return kelompokan(acak, murid.length / jumlah);
}

function cekKesamaan(a, b) {
  if (!a.length || !b.length) return false;

  for (let da of a.length > b.length ? a : b) {
    for (let db of a.length > b.length ? b : a) {
      // urutkan -> bandingkan
      const sortedA = da.map(n => n.nama).sort();
      const sortedB = db.map(n => n.nama).sort();

      if (JSON.stringify(sortedA) === JSON.stringify(sortedB)) return true;
    }
  }

  return false;
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }

  return a;
}

function kelompokan(array, size) {
  const chunked_arr = [];
  const copied = [...array];
  const numOfChild = Math.ceil(copied.length / size);

  for (let i = 0; i < numOfChild; i++) {
    chunked_arr.push(copied.splice(0, size));
  }

  return chunked_arr;
}

function render(data) {
  container.innerHTML = '';

  let index = 1;

  for (let d of data) {
    const divKelompok = document.createElement('div');
    const card = document.createElement('div');
    const ul = document.createElement('ul');
    const kel = document.createElement('span');

    divKelompok.className = 'col-sm-6 col-md-4 colom';
    card.className = 'card';
    kel.className = 'kel';

    kel.appendChild(document.createTextNode(index++));

    for (let murid of d) {
      let li = document.createElement('li');
      let textNode = document.createTextNode(`${murid.nama} / ${murid.no}`);

      li.appendChild(textNode);
      ul.appendChild(li);
    }

    divKelompok.appendChild(kel);
    divKelompok.appendChild(card);

    card.appendChild(ul);

    container.appendChild(divKelompok);
  }
}

function copyToClipboard(str) {
  const el = document.createElement('textarea');
  el.value = str;
  el.setAttribute('readonly', '');
  el.style.position = 'absolute';
  el.style.left = '-9999px';
  document.body.appendChild(el);
  const selected =
    document.getSelection().rangeCount > 0
      ? document.getSelection().getRangeAt(0)
      : false;
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  if (selected) {
    document.getSelection().removeAllRanges();
    document.getSelection().addRange(selected);
  }
}

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

