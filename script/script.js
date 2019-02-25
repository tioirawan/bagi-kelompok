// menyimpan data murid
let data = [];

// menyimpan hasil pengacakan sebelumnya untuk dibandingkan
let temp = [];

// menghitung jumlah pengacakan tiap pembagian untuk menghindari infinite loop
let count = 0;
let maxCount = 50; // jumlah maksimal pengacakan tiap pembagian

async function getData() {
  if (!data.length) {
    data = await (await fetch('script/murid.json')).json();
  }

  return data;
}

function copyHasil() {
  let hasil = '';
  let index = 1;

  for (let kelompok of temp) {
    hasil += `Kelompok ${index++}:\n`;

    for (let murid of kelompok) {
      hasil += `${murid.nama} (${murid.no})\n`;
    }

    hasil += '\n';
  }

  copyToClipboard(hasil);
}

async function bagiKelompok() {
  const jumlah = document.getElementById('jumlah').value;
  const rata = document.getElementById('rata-perempuan').checked;

  const murid = await getData();

  if (!jumlah || jumlah > murid.length) return;

  startLoading();

  let hasil;

  do {
    hasil = await (rata ? bagiRata(murid, jumlah) : bagiAcak(murid, jumlah));

    await delay(100); // delay 0.1s tiap pengacakan (max 10 acakan/detik)
  } while (cekKesamaan(hasil, temp) && count++ < maxCount);

  temp = hasil;
  count = 0; // reset count

  render(hasil);
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
  const container = document.getElementById('container');

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

// menampilkan loading
function startLoading() {
  document.getElementById('container').innerHTML = `
  <div class="lds-grid"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
  `;
}
