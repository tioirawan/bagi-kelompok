// menyimpan data murid
let data = [];

// menyimpan hasil pengacakan sebelumnya untuk dibandingkan
let temp = [];

// menghitung jumlah pengacakan tiap pembagian untuk menghindari infinite loop
let count = 0;
const maxCount = 10; // jumlah maksimal pengacakan tiap pembagian

let gTotal = lTotal = 0

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
  const jumlah = inpJumlah.value;
  const rata = inpRata.checked;
  const sembunyi = inpSembunyi.checked;

  const murid = await getData();

  let delaytime = 30
  let increaser = 1

  if (!jumlah || jumlah > murid.length) return;

  btBagi.setAttribute('disabled', '')
  btCopy.setAttribute('disabled', '')

  const jumlahPengulangan = 50 + Math.floor(Math.random() * 50);

  let hasil;

  container.style.display = "flex"

  for (let i = 0; i < jumlahPengulangan; i++) {
    const isLastLoop = i >= jumlahPengulangan - 1

    do {
      if (isLastLoop) {
        hasil = await (rata ? bagiRata(murid, jumlah) : bagiAcak(murid, jumlah));
      } else {
        hasil = await bagiAcak(murid, jumlah) // hanya untuk efek mengacak, gk perlu banyak"
      }

      gTotal++
    } while (isLastLoop ? cekKesamaan(hasil, temp) && count++ < maxCount : false);

    count = 0; // reset count

    hasil = shuffle(hasil)

    if (!sembunyi || !(isLastLoop)) {
      render(hasil); // tampilkan
    } else if (isLastLoop) {
      container.style.display = "block"
      container.innerHTML = "<center><h2>Pengacakan Selesai, Silahkan Copy Hasil!</h2></center>"
    }

    await delay(delaytime += (increaser += 0.1)); // exponen
  }

  temp = hasil;
  btCopy.removeAttribute('disabled')

  gTotal = lTotal = 0

  const waitTime = 60 // s

  for (let i = 0; i < waitTime; i++) {
    btBagi.innerText = waitTime - i
    await delay(1000)
  }

  btBagi.innerText = "Bagi!"
  btBagi.removeAttribute('disabled')
}

async function bagiRata(murid, jumlah) {
  const segmentationMemory = false;

  const randomizeChunk = c => {
    for (let i = 0; i < random(1, 3); i++) {
      c = shuffle(c)
    }

    return c
  }

  let laki, perempuan, chunkOverMemory;

  let candiDate = 34;

  if (jumlah == 18 && segmentationMemory) {
    laki = randomizeChunk(murid.filter(m => m.kelamin == 'l' && m.no != 33));
    perempuan = randomizeChunk(murid.filter(m => m.kelamin == 'p' && m.no != candiDate));

    jumlah -= 1;
    chunkOverMemory = true;
  } else {
    laki = randomizeChunk(murid.filter(m => m.kelamin == 'l'));
    perempuan = randomizeChunk(murid.filter(m => m.kelamin == 'p'));
  }

  const portion = random(2, Math.floor(perempuan.length * 0.8))

  const lakiChunks = randomizeChunk(chunk(laki, portion).map(randomizeChunk))
  const perempuanChunks = randomizeChunk(chunk(perempuan, portion).map(randomizeChunk))

  const lakiRes = shuffle(lakiChunks.reduce((acc, cur) => [...acc, ...cur]))
  const perempuanRes = perempuanChunks.reduce((acc, cur) => [...acc, ...cur])

  const kelompok = [];

  // entah kenapa gk bisa gini -> Array(jumlah).fill().map(() => [])
  for (let i = 0; i < jumlah; i++) {
    kelompok.push([]);
  }

  let i = 0;

  while (lakiRes.length || perempuanRes.length) {
    if (lakiRes.length) kelompok[i].push(lakiRes.pop());
    else kelompok[i].push(perempuanRes.pop());

    i++;
    if (i >= jumlah) i = 0;
  }

  if (chunkOverMemory) {
    kelompok.push([murid.find(m => m.no == 33), murid.find(m => m.no == candiDate)]);
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
  lTotal++

  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }

  return a;
}

function chunk(array, size) {
  const chunked_arr = [];
  let copied = [...array];
  const numOfChild = Math.ceil(copied.length / size);
  for (let i = 0; i < numOfChild; i++) {
    chunked_arr.push(copied.splice(0, size));
  }
  return chunked_arr;
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

    divKelompok.className = 'col-sm-6 col-md-3 colom';
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

  el.setAttribute('readonly', '');

  el.value = str;
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

function random(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

