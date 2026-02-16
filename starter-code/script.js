const fontPicker = document.querySelectorAll(".font-option");
const themeToggle = document.querySelector(".toggle-circle");
const searchInput = document.getElementById("search");
const playButton = document.getElementById("playButton");
const searchResult = document.querySelector(".definitions");
const seachForm = document.querySelector("form");
const dropDown = document.getElementById('dropdown');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
	document.querySelector('.input-results').classList.add('hide')
	document.querySelector('.definitions').classList.add('hide');
})
dropDown.addEventListener('click', toggleDropdown)
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
fontPicker.forEach((button) => button.addEventListener('click', pickFont))


// State
const dictionaryState = {
	searchedWord: '',
	meaning: [],
	phonetics: [],
	audioUrl: '',
	infoUrl: '',
	phonetic: '',
	definitions: '',
	errorTitle: '',
	errorMessage: '',

}
const testState = {
	searchedWord: '',
	meaning: [],
	phonetics: [],
	audioUrl: '',
	infoUrl: '',
	phonetic: '',
	definitions: '',
	errorTitle: '',
	errorMessage: '',

}
// Functions
function toggleDropdown(){
	document.querySelector('.font-options').classList.toggle('show')
}
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

function handleSubmit(e) {
  e.preventDefault();
  const query = getInputData();
//   processData(query)
  handleEmptyInput();
  test(query);
}
function getInputData(){
	return searchInput.value.trim()
}

async function getData(query){
	const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${query}`)
	return  response.json();
}

function getAudio(url){
	const wordAudio = new Audio(url)
	wordAudio.play()
}
function renderWord(word, phonetic){
	document.querySelector('.result-words').innerHTML = `
            <h1 id="word">${word}</h1>
            <p id="phonetic">${phonetic}</p>`
}

function renderSearchedWordNotFound(title, errorMessage){
	if (title){
		document.querySelector('.definitions').classList.add('hide');
		document.querySelector('.input-results').classList.add('hide');

		return `
			<h1>😕<h1/>
			<h2>${title ? title : ''}<h2/>
			<p>${errorMessage ? errorMessage : ''}<p/>
		`
	} else {
		document.querySelector('.definitions').classList.remove('hide');
		document.querySelector('.input-results').classList.remove('hide');
		document.querySelector('.not-found').classList.add('hide');
	}

}
function renderPhonetics(){
	const renderMeaning = testState.meaning.map(phonetic => phonetic);
	return renderMeaning.map((phonetic) => {
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
		document.querySelector('.not-found').classList.add('hide');

	} else {
		searchInput.classList.remove("error");
		document.querySelector("small").classList.remove("show");
		document.querySelector('.definitions').classList.remove('hide');
		document.querySelector('.input-results').classList.remove('hide');
		document.querySelector('.not-found').classList.add('hide');
	}
}

async function test(query){
	const data = await getData(query);
	const entry = data[0];
	testState.infoUrl = entry.sourceUrls[0];
	testState.phonetic = entry.phonetic ? entry.phonetic : entry.phonetics.find((phonetic) => phonetic && phonetic.trim() !== '');
	testState.searchedWord = entry.word;
	testState.meaning = entry.meanings.map((meaning) => {
		return meaning
	})
	testState.audioUrl = entry.phonetics.find((item) => item.audio && item.audio.trim() !== '');
	testState.definitions = testState.meaning.map((item) => {
		return item.definitions
	})
	// If API returns error object
	if (!Array.isArray(data)) {
		testState.errorTitle = data.title || '';
		testState.errorMessage = (data.message || '') + ' ' + (data.resolution || '');
		document.querySelector('.not-found').innerHTML =
			renderSearchedWordNotFound(testState.errorTitle, testState.errorMessage);
		return;
	}

	// Clear previous error UI
	dictionaryState.errorTitle = '';
	dictionaryState.errorMessage = '';
	document.querySelector('.not-found').innerHTML = '';
	
	renderWord(testState.searchedWord, testState.phonetic);
	playButton.addEventListener('click', () => {getAudio(testState.audioUrl.audio)});
	searchResult.innerHTML = renderPhonetics() + renderSource(testState.infoUrl);
}