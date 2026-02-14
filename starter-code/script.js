document.addEventListener('DOMContentLoaded', () => {
	document.querySelector('.input-results').classList.add('hide')
	document.querySelector('.definitions').classList.add('hide');
})


const fontPicker = document.querySelectorAll(".font-option");
const themeToggle = document.querySelector(".toggle-circle");
const searchInput = document.getElementById("search");
const playButton = document.getElementById("playButton");
const searchResult = document.querySelector(".definitions");
const seachForm = document.querySelector("form");
const dropDown = document.getElementById('dropdown');

const dictionaryState = {
	searchedWord: '',
	meaning: [],
	phonetics: [],
	audioUrl: '',
	infoUrl: '',
	phonetic: ''
}

function toggleDropdown(){
	document.querySelector('.font-options').classList.toggle('show')
}
dropDown.addEventListener('click', toggleDropdown)
fontPicker.forEach((button) => button.addEventListener('click', pickFont))
function pickFont(e){
	fontPicker.forEach((item) => {
		if (e.target.dataset.font === item.dataset.font){
			document.body.classList.add(item.dataset.font);
			dropDown.firstElementChild.innerText = item.dataset.font;
		} else {
			document.body.classList.remove(item.dataset.font)

		}
	})
}
themeToggle.addEventListener("click", () => {
	themeToggle.classList.toggle("toggle-theme");
	if (document.body.classList.contains("theme-dark")) {
		document.body.classList.remove("theme-dark");
		document.body.classList.add("theme-light");
	} else {
		document.body.classList.remove("theme-light");
		document.body.classList.add("theme-dark");
	}
});
seachForm.addEventListener("submit", handleSubmit);

function handleSubmit(e) {
  e.preventDefault();
  const query = getInputData();
  processData(query)
  handleEmptyInput()
}
function getInputData(){
	return searchInput.value.trim()
}

async function getData(query){
	const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${query}`)
	return  response.json();

}

async function processData(query){
	const data = await getData(query);
	data.forEach((item) => {
		dictionaryState.searchedWord = item.word;
		console.log(item)
		item.phonetics.map((item) => {
			if (item.audio !== undefined && item.audio !== ''){
				dictionaryState.audioUrl = item.audio
				return dictionaryState.audioUrl
			}
			if (item.text !== undefined && item.text !== ''){
				dictionaryState.phonetic = item.text;
				return dictionaryState.phonetic
			}
		})
		item.sourceUrls.forEach((url) => {
			dictionaryState.infoUrl = url;
		})
		dictionaryState.meaning = item.meanings;
	})
	renderWord(dictionaryState.searchedWord, dictionaryState.phonetic)
	playButton.addEventListener('click', () => {
		getAudio(dictionaryState.audioUrl)
	})
	searchResult.innerHTML = renderPhonetics() + renderSource(dictionaryState.infoUrl);
}
processData()
function getAudio(url){
	const wordAudio = new Audio(url)
	wordAudio.play()
}
function renderWord(word, phonetic){
	document.querySelector('.result-words').innerHTML = `
            <h1 id="word">${word}</h1>
            <p id="phonetic">${phonetic}</p>`
}
function renderPhonetics(){
	const uniqueParts = [...new Set(dictionaryState.meaning.map(phonetic => phonetic))];

	return uniqueParts.map((phonetic) => {
	const exampleObj = phonetic.definitions.find(item => item.example && item.example.trim() !== '');
	const exampleHTML = exampleObj ? `<p>"${exampleObj.example}"</p>` : '';
	const synonymsObj = phonetic.synonyms.find((synonym) => synonym && synonym.trim() !== '');
	const synonymsHTML = synonymsObj ? `
	<div class="definition-item-text">
	<p>Synonyms</p>
	<span>${synonymsObj}</span>
	<div />` : '';
			return `<div class="definition-section">
				  <div class="definition-block">
					<div class="results-container">
					  <div class="definition-title">
						<h2>${phonetic.partOfSpeech}</h2>
					  </div>
					  <div class="content-container">
						<p>Meaning</p>
						<div class="definition-list">
						  <ul>
						  ${phonetic.definitions.map((item) => {
							  return `<li>${item.definition}</li>`
						  }).join('')}
						  </ul>
						  	${exampleHTML}
						</div>
					  </div>
					</div>
					${synonymsHTML}	
				  </div>
				</div>`
		
	}).join('')
}

function renderSource(url){
	return `<div class="verb-header">
          <span>Source</span>
          <div class="source-link">
            <a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>
			<a href="${url}" target="_blank" rel="noopener noreferrer"><img src="./assets/images/icon-new-window.svg" alt=""></a>
          </div>
        </div>`
}
function handleEmptyInput() {
	if (searchInput.value.trim() === "") {
		searchInput.classList.add("error");
		document.querySelector("small").classList.add("show");
		document.querySelector('.definitions').classList.add('hide');
		document.querySelector('.input-results').classList.add('hide');

	} else {
		searchInput.classList.remove("error");
		document.querySelector("small").classList.remove("show");
		document.querySelector('.definitions').classList.remove('hide');
		document.querySelector('.input-results').classList.remove('hide');
	}
}